/**
 * Created by srpag on 11/04/17.
 */
const sql_source = require('../../../../../utils/sql-source');
const validators = require('../../../../../utils/validators');

module.exports = (app, express, request, response, next) => {

    global.functions.authRequest(request).then((auth) => {
        if (!auth.valid) {
            response.json(auth);
            return;
        }
        const body = request.body;

        //Validación de user_uuid
        if(body.user_uuid === undefined){
            response.json({ valid: false, message: `La uuid del usuario no puede estar vacia` });
            return;
        }
        if(!validators.verifyUUID(body.user_uuid)){
            response.json({ valid: false, message: `La uuid del usuario no es valida` });
            return;
        }
        //Validación de company_uuid
        if(body.company_uuid === undefined){
            response.json({ valid: false, message: `La uuid de la compañia no puede estar vacia` });
            return;
        }
        if(!validators.verifyUUID(body.company_uuid)){
            response.json({ valid: false, message: `La uuid de la compañia debe ser una uuid valida` });
            return;
        }
        //Validación de group_id
        if(body.group_id === undefined){
            response.json({ valid: false, message: `La id del grupo no puede estar vacia` });
            return;
        }
        if(isNaN(body.group_id)){
            response.json({ valid: false, message: `La id del grupo debe ser un número valido` });
            return;
        }
        //Validación de date_id
        if(body.date_id === undefined){
            response.json({ valid: false, message: `La id de la fecha no puede estar vacia` });
            return;
        }
        if(isNaN(body.date_id)){
            response.json({ valid: false, message: `La id de la fecha debe ser un número valido` });
            return;
        }
        //Comprobar que la uuid del usuario no sea la misma que la de el mismo
        if(body.user_uuid === auth.user_uuid){
            response.json({ valid: false, message: `No puedes eliminarte a ti mismo de un grupo` });
            return;
        }
        //Comprobar que el usuario esta registrado
        global.functions.isUserUUIDRegistered(body.user_uuid).then((isUserUUIDRegistered) => {
            if(!isUserUUIDRegistered){
                response.json({valid: false, message: `El usuario no esta registrado`});
                return;
            }
            //Comprobar si la compañia esta registrada
            global.functions.isCompanyRegistered(body.company_uuid).then((isCompanyRegistered) => {
                if (!isCompanyRegistered) {
                    response.json({valid: false, message: `La compañia no existe`});
                    return;
                }
                //Comprobar si el grupo existe
                global.functions.isCompanyGroupRegistered(body.company_uuid, body.group_id)
                    .then((isCompanyGroupRegistered) => {
                    if (!isCompanyGroupRegistered) {
                        response.json({valid: false, message: `No existe este grupo dentro de la compañia`});
                        return;
                    }
                    //Comprobar si la fecha existe
                    global.functions.isCompanyGroupDateRegistered(body.company_uuid, body.group_id, body.date_id)
                        .then(isCompanyGroupDateRegistered => {
                        if(!isCompanyGroupDateRegistered){
                            response.json({valid: false, message: `No existe esta fecha dentro de este grupo dentro de la compañia`});
                            return;
                        }
                        //Comprobar si el usuario tiene permiso para editar la compañia, el grupo o la fecha
                        global.functions.hasUserPermissionToEditCompanyGroupDate(body.company_uuid, body.group_id, body.date_id, auth.user_uuid)
                            .then(hasUserPermissionToEditCompanyGroupDate => {
                            global.functions.hasUserPermissionToEditCompanyGroup(body.company_uuid, body.group_id, auth.user_uuid)
                                .then((hasUserPermissionToEditCompanyGroup) => {

                                global.functions.hasUserPermissionToEditCompany(body.company_uuid, auth.user_uuid)
                                    .then(hasUserPermissionToEditCompany => {

                                    if(!hasUserPermissionToEditCompanyGroupDate
                                        && !hasUserPermissionToEditCompanyGroup
                                        && !hasUserPermissionToEditCompany){
                                        response.json({valid: false, message: `No tienes permisos en esta fecha`});
                                        return;
                                    }
                                    //Comprobar si el usuario pertenece a la fecha
                                    global.functions.isUserFromCompanyGroupDate(body.company_uuid, body.group_id, body.date_id, body.user_uuid)
                                        .then(isUserFromCompanyGroupDate => {
                                        if(!isUserFromCompanyGroupDate){
                                            response.json({valid: false, message: `El usuario no pertenece a esta fecha`});
                                            return;
                                        }

                                        deleteUser(body.company_uuid, body.group_id, body.date_id, body.user_uuid, body.can_edit)
                                            .then((res) => response.json(res));
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

};

const deleteUser = (company_uuid, group_id, date_id, user_uuid) => {
    return new Promise((promise_result, promise_error) => {
        const sql_conn = sql_source.connection();
        const sql_query =
            `DELETE FROM UserLinkedCompanyGroupDate 
            WHERE fk_company_uuid=${sql_conn.escape(company_uuid)} 
            AND fk_group_id=${sql_conn.escape(group_id)}
            AND fk_date_id=${sql_conn.escape(date_id)}
            AND fk_user_uuid=${sql_conn.escape(user_uuid)}`;
        sql_conn.query(sql_query, (sql_error, sql_results, sql_fields) => {
            promise_result({
                valid: true,
                message: `Se ha eliminado al usuario con éxito`
            });
            sql_conn.end();
        });
    });
};