/**
 * Created by srpag on 14/04/17.
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
        //Puede editar
        if(body.can_edit === undefined){
            response.json({ valid: false, message: `Se debe especificar si el usuario podrá editar o no` });
            return;
        }
        body.can_edit = body.can_edit === true;
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
                //Comprobar si el usuario tiene permiso para editar el grupo
                global.functions.hasUserPermissionToEditCompanyGroup(body.company_uuid, body.group_id, auth.user_uuid)
                    .then((hasUserPermissionToEditCompanyGroup) => {

                    global.functions.hasUserPermissionToEditCompany(body.company_uuid, auth.user_uuid)
                        .then(hasUserPermissionToEditCompany => {

                            if(!hasUserPermissionToEditCompanyGroup && !hasUserPermissionToEditCompany){
                                response.json({valid: false, message: `No tienes permisos en este grupo`});
                                return;
                            }

                            //Comprobar si el usuario no pertenece al grupo
                            global.functions.isUserFromCompanyGroup(body.company_uuid, body.group_id, body.user_uuid)
                                .then(isUserFromCompanyGroup => {
                                if(isUserFromCompanyGroup){
                                    response.json({valid: false, message: `El usuario ya pertenece a este grupo`});
                                    return;
                                }

                                addUser(body.company_uuid, body.group_id, body.user_uuid, body.can_edit)
                                    .then((res) => response.json(res));
                            });
                        });
                    });
                });
            });
        });
    });

};

const addUser = (company_uuid, group_id, user_uuid, can_edit) => {
    return new Promise((promise_result, promise_error) => {
        const sql_conn = sql_source.connection();
        const sql_query =
            `INSERT INTO UserLinkedCompanyGroup
            (fk_company_uuid, fk_group_id, fk_user_uuid, can_edit)
            VALUES(
            ${sql_conn.escape(company_uuid)},
            ${sql_conn.escape(group_id)},
            ${sql_conn.escape(user_uuid)},
            ${sql_conn.escape(can_edit)}
            )`;
        sql_conn.query(sql_query, (sql_error, sql_results, sql_fields) => {
            promise_result({
                valid: true,
                message: `Se ha añadido al usuario con éxito`
            });
        });
    });
};