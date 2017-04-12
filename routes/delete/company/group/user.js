/**
 * Created by srpag on 11/04/17.
 */
const sql_source = require('../../../../utils/sql-source');
const validators = require('../../../../utils/validators');

module.exports = (app, express, request, response, next) => {

    global.functions.authRequest(request).then((auth) => {
        if (!auth.valid) {
            response.json(auth);
            return;
        }
        const query = request.query;

        //Validación de user_uuid
        if(query.user_uuid === undefined){
            response.json({ valid: false, message: `La uuid del usuario no puede estar vacia` });
            return;
        }
        if(!validators.verifyUUID(query.user_uuid)){
            response.json({ valid: false, message: `La uuid del usuario no es valida` });
            return;
        }
        //Validación de company_uuid
        if(query.company_uuid === undefined){
            response.json({ valid: false, message: `La uuid de la compañia no puede estar vacia` });
            return;
        }
        if(!validators.verifyUUID(query.company_uuid)){
            response.json({ valid: false, message: `La uuid de la compañia debe ser una uuid valida` });
            return;
        }
        //Validación de group_id
        if(query.group_id === undefined){
            response.json({ valid: false, message: `La id del grupo no puede estar vacia` });
            return;
        }
        if(isNaN(query.group_id)){
            response.json({ valid: false, message: `La id del grupo debe ser un número valido` });
            return;
        }
        //Comprobar que la uuid del usuario no sea la misma que la de el mismo
        if(query.user_uuid === auth.user_uuid){
            response.json({ valid: false, message: `No puedes eliminarte a ti mismo de un grupo` });
            return;
        }
        //Comprobar que el usuario esta registrado
        global.functions.isUserUUIDRegistered(query.user_uuid).then((isUserUUIDRegistered) => {
            if(!isUserUUIDRegistered){
                response.json({valid: false, message: `El usuario no esta registrado`});
                return;
            }
            //Comprobar si la compañia esta registrada
            global.functions.isCompanyRegistered(query.company_uuid).then((isCompanyRegistered) => {
                if (!isCompanyRegistered) {
                    response.json({valid: false, message: `La compañia no existe`});
                    return;
                }
                //Comprobar si el grupo existe
                global.functions.isCompanyGroupRegistered(query.company_uuid, query.group_id)
                    .then((isCompanyGroupRegistered) => {
                        if (!isCompanyGroupRegistered) {
                            response.json({valid: false, message: `No existe este grupo dentro de la compañia`});
                            return;
                        }
                        //Comprobar si el usuario tiene permiso para editar el grupo
                        global.functions.hasUserPermissionToEditCompanyGroup(query.company_uuid, query.group_id, auth.user_uuid)
                            .then((hasUserPermissionToEditCompanyGroup) => {

                            global.functions.hasUserPermissionToEditCompany(query.company_uuid, auth.user_uuid)
                                .then(hasUserPermissionToEditCompany => {

                                if(!hasUserPermissionToEditCompanyGroup && !hasUserPermissionToEditCompany){
                                    response.json({valid: false, message: `No tienes permisos en este grupo`});
                                    return;
                                }

                                //Comprobar si el usuario pertenece al grupo
                                global.functions.isUserFromCompanyGroup(query.company_uuid, query.group_id, query.user_uuid)
                                    .then(isUserFromCompanyGroup => {
                                    if(!isUserFromCompanyGroup){
                                        response.json({valid: false, message: `El usuario no pertenece a este grupo`});
                                        return;
                                    }

                                    deleteUser(query.company_uuid, query.group_id, query.user_uuid)
                                        .then((res) => response.json(res));
                                });
                            });
                        });
                    });

            });
        });

    });
};

const deleteUser = (company_uuid, group_id, user_uuid) => {
    return new Promise((promise_result, promise_error) => {
        const sql_conn = sql_source.connection();
        const sql_query =
            `DELETE FROM UserLinkedCompanyGroup 
            WHERE fk_company_uuid=${sql_conn.escape(company_uuid)} 
            AND fk_group_id=${sql_conn.escape(group_id)}
            AND fk_user_uuid=${sql_conn.escape(user_uuid)}`;
        sql_conn.query(sql_query, (sql_error, sql_results, sql_fields) => {
            promise_result({
                valid: true,
                message: `Se ha eliminado al usuario con éxito`
            });
        });
    });
};