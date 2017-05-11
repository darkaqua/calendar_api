/**
 * Created by srpag on 29/03/2017.
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

        if(body.user_uuid === undefined){
            response.json({ valid: false, message: `La uuid del usuario no puede estar vacia` });
            return;
        }
        if(!validators.verifyUUID(body.user_uuid)){
            response.json({ valid: false, message: `La uuid del usuario no es valida` });
            return;
        }

        if(body.company_uuid === undefined){
            response.json({ valid: false, message: `La uuid de la compañia no puede estar vacia` });
            return;
        }
        if(!validators.verifyUUID(body.company_uuid)){
            response.json({ valid: false, message: `La uuid de la compañia no es valida` });
            return;
        }

        //Verificar si la compañia existe
        global.functions.isCompanyRegistered(body.company_uuid).then((isCompanyRegistered) => {
            if(!isCompanyRegistered){
                response.json({ valid: false, message: `La compañia no existe` });
                return;
            }
            //Verificar si el usuario pertenence a la compañia
            global.functions.isUserFromCompany(body.company_uuid, body.user_uuid)
                .then((isUserFromCompany) => {

                if(!isUserFromCompany){
                    response.json({ valid: false, message: `El usuario no pertenece a la compañia` });
                    return;
                }
                //Si el usuario es el mismo se puede eliminar
                if(auth.user_uuid === body.user_uuid){
                    deleteUser(body.company_uuid, body.user_uuid, true).then((res) => response.json(res));
                    return;
                }

                //Verificar si el usuario tiene permiso para echar al usuario
                global.functions.hasUserPermissionToEditCompany(body.company_uuid, auth.user_uuid)
                    .then((hasUserPermissionToEditCompany) => {

                    if (!hasUserPermissionToEditCompany) {
                        response.json({valid: false, message: `No tienes permisos suficientes sobre esta compañia`});
                        return;
                    }

                    deleteUser(body.company_uuid, body.user_uuid, false)
                        .then((res) => response.json(res));

                });

            });
        });

    });
};

const deleteUser = (company_uuid, user_uuid, is_same_user) => {
    return new Promise((promise_result, promise_error) => {
        const sql_conn = sql_source.connection();
        const sql_query =
            `DELETE FROM UserLinkedCompany 
            WHERE fk_company_uuid=${sql_conn.escape(company_uuid)} 
            AND fk_user_uuid=${sql_conn.escape(user_uuid)}`;
        sql_conn.query(sql_query, (sql_error, sql_results, sql_fields) => {
            promise_result({
                valid: true,
                message: is_same_user
                    ? `Te has salido de la compañia con éxito`
                    : `Se ha eliminado al usuario con éxito`
            });
            sql_conn.end();
        });
    });
};