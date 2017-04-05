/**
 * Created by pablo on 4/4/17.
 */
const sql_source = require('../../../utils/sql-source');
const validators = require('../../../utils/validators');

module.exports = (app, express, request, response, next) => {

    global.functions.authRequest(request).then((auth) => {
        if (!auth.valid) {
            response.json(auth);
            return;
        }

        const body = request.body;

        //Comprobar que uuid esta escrita
        if(body.company_uuid === undefined){
            response.json({valid: false, message: `La uuid de la compañia no puede estar vacia`});
            return;
        }
        //Comprobar que la uuid es valida
        if(!validators.verifyUUID(body.company_uuid)){
            response.json({valid: false, message: `La uuid de la compañia no es valida`});
            return;
        }
        //Comprobar que el nombre no esta vacio
        if(body.name === undefined){
            response.json({valid: false, message: `El nombre del grupo no puede estar vacio`});
            return;
        }
        //Comprobar que el nombre es mas largo de 4 caracteres
        if(body.name.length <= 4){
            response.json({valid: false, message: `El nombre del grupo debe contener más de 4 carácteres`});
            return;
        }
        //Descripción opcional

        //Comprobar que la uuid pertenece a una compañia
        global.functions.isCompanyRegistered(body.company_uuid).then(isCompanyRegistered => {
            if(!isCompanyRegistered){
                response.json({valid: false, message: `La compañia no existe`});
                return;
            }
            //Comprobar que tienes permisos de edición en la compañia
            global.functions.hasUserPermissionToEditCompany(body.company_uuid, auth.user_uuid).then(hasUserPermissionToEditCompany => {
                if(!hasUserPermissionToEditCompany){
                    response.json({valid: false, message: `No tienes permisos sobre la compañia`});
                    return;
                }
                //Comprobar si puede crear mas grupos
                global.functions.getUserQuota(auth.user_uuid).then(user_quota => {
                    if(user_quota.group_count <= 0){
                        response.json({valid: false, message: `No puedes crear más grupos`});
                        return;
                    }

                    const sql_conn = sql_source.connection();
                    const query =
                        `SET @last_id = (SELECT id 
                            FROM CompanyGroup 
                            WHERE fk_company_uuid=${sql_conn.escape(body.company_uuid)} 
                            ORDER BY creation_timestamp DESC 
                            LIMIT 1);
                        SET @next_id = (SELECT IFNULL(@last_id + 1, 0));
                        INSERT INTO CompanyGroup(id, fk_company_uuid, name, description) 
                        VALUES (
                            @next_id,
                            ${sql_conn.escape(body.company_uuid)},
                            ${sql_conn.escape(body.name)},
                            ${sql_conn.escape(body.description === undefined ? '' : body.description)}
                        );
                        INSERT INTO UserLinkedCompanyGroup(fk_group_id, fk_company_uuid, fk_user_uuid, can_edit) 
                        VALUES (
                            @next_id, 
                            ${sql_conn.escape(body.company_uuid)}, 
                            ${sql_conn.escape(auth.user_uuid)}, 
                            '1'
                        )`;
                    sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
                        response.json({ valid:true, message: `Se ha creado el grupo con éxito`});
                    });

                });

                //Recuperar la id del último grupo y añadir +1
                //Añadir grupo (Añadir al grupo el creador(?))
            });
        });

    });

};