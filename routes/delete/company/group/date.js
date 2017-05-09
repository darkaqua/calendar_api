/**
 * Created by srpag on 22/04/17.
 */
const sql_source = require('../../../../utils/sql-source');
const validators = require('../../../../utils/validators');

module.exports = (app, express, request, response, next) => {
    global.functions.authRequest(request).then((auth) => {
        if (!auth.valid) {
            response.json(auth);
            return;
        }
        const body = request.body;

        //Comprobar que la id es un integer
        if(body.date_id === undefined){
            response.json({ valid: false, message: `La id de la fecha no puede estar vacia` });
            return;
        }
        if(isNaN(body.date_id)){
            response.json({ valid: false, message: `La id de la fecha debe ser un número valido` });
            return;
        }
        //Comprobar que la id del grupo es un integer
        if(body.group_id === undefined){
            response.json({ valid: false, message: `La id del grupo no puede estar vacia` });
            return;
        }
        if(isNaN(body.group_id)){
            response.json({ valid: false, message: `La id del grupo debe ser un número valido` });
            return;
        }
        //Comprobar que la uuid de la compañia es una uuid
        if(body.company_uuid === undefined){
            response.json({ valid: false, message: `La uuid de la compañia no puede estar vacia` });
            return;
        }
        if(!validators.verifyUUID(body.company_uuid)){
            response.json({ valid: false, message: `La uuid de la compañia debe ser una uuid valida` });
            return;
        }

        //Comprobar que la uuid de la compañia existe
        global.functions.isCompanyRegistered(body.company_uuid).then((isCompanyRegistered) => {
            if (!isCompanyRegistered) {
                response.json({valid: false, message: `La compañia no existe`});
                return;
            }
            //Comprobar que la id del grupo existe
            global.functions.isCompanyGroupRegistered(body.company_uuid, body.group_id)
                .then((isCompanyGroupRegistered) => {
                if (!isCompanyGroupRegistered) {
                    response.json({valid: false, message: `No existe este grupo dentro de la compañia`});
                    return;
                }
                //Comprobar si el usuario tiene permiso para editar la fecha
                global.functions.hasUserPermissionToEditCompanyGroupDate()
                    .then(hasUserPermissionToEditCompanyGroupDate => {

                    global.functions.hasUserPermissionToEditCompanyGroup(body.company_uuid, body.group_id, auth.user_uuid)
                        .then(hasUserPermissionToEditCompanyGroup => {

                        global.functions.hasUserPermissionToEditCompany(body.company_uuid, auth.user_uuid)
                            .then(hasUserPermissionToEditCompany => {

                            if(!hasUserPermissionToEditCompanyGroupDate
                                && !hasUserPermissionToEditCompanyGroup
                                && !hasUserPermissionToEditCompany){
                                response.json({valid: false, message: `No tienes permisos en esta fecha`});
                                return;
                            }

                            //Comprobar si la id del grupo existe
                            global.functions.isCompanyGroupDateRegistered()
                                .then(isCompanyGroupDateRegistered => {

                                if(!isCompanyGroupDateRegistered){
                                    response.json({valid: false, message: `Esta fecha no esta registrada`});
                                    return;
                                }

                                //Eliminar fecha del grupo de la compañia
                                deleteCompanyGroupDate()
                                    .then(res => response.json(res));
                            });

                        });
                    });
                });
            });
        });
    });
};

const deleteCompanyGroupDate = (company_uuid, group_id, date_id) => {
    return new Promise((promise_result, promise_error) => {
        const sql_conn = sql_source.connection();
        const sql_query =
            `DELETE FROM CompanyGroupDate 
            WHERE fk_company_uuid=${sql_conn.escape(company_uuid)} 
            AND fk_group_id=${sql_conn.escape(group_id)} 
            AND id=${sql_conn.escape(date_id)}`;
        sql_conn.query(sql_query, (sql_error, sql_results, sql_fields) => {
            promise_result({
                valid: true,
                message: `Se ha eliminado la fecha con éxito`
            });
        });
    });
};