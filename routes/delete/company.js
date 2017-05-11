/**
 * Created by srpag on 28/03/2017.
 */
const sql_source = require('../../utils/sql-source');
const validators = require('../../utils/validators');

module.exports = (app, express, request, response, next) => {
    global.functions.authRequest(request).then((auth) => {
        if (!auth.valid) {
            response.json(auth);
            return;
        }
        const body = request.body;

        if(body.company_uuid === undefined){
            response.json({ valid: false, message: `La uuid de la compañia no puede estar vacia` });
            return;
        }
        if(!validators.verifyUUID(body.uuid)){
            response.json({ valid: false, message: `La uuid de la compañia no es valida` });
            return;
        }

        //Verificar que la compañia existe
        global.functions.isCompanyRegistered(body.uuid).then((isCompanyRegistered) => {
            if(!isCompanyRegistered){
                response.json({ valid: false, message: `La compañia no existe` });
                return;
            }

            //Verificar que el usuario tiene permisos para editar la compañia
            global.functions.hasUserPermissionToEditCompany(body.company_uuid, auth.user_uuid)
                .then((hasUserPermissionToEditCompany) => {

                if(!hasUserPermissionToEditCompany){
                    response.json({ valid: false, message: `No tienes permisos suficientes sobre esta compañia` });
                    return;
                }
                const sql_conn = sql_source.connection();
                const sql_query = `DELETE FROM Company WHERE uuid=${sql_conn.escape(body.uuid)}`;
                sql_conn.query(sql_query, () => {
                    response.json({ valid: true, message: `Se ha eliminado con éxito la compañia` });
                    sql_conn.end();
                });
            });
        });
    });
};