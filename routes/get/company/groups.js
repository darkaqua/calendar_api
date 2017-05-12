/**
 * Created by srpag on 15/04/17.
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

        if(body.company_uuid === undefined){
            response.json({ valid: false, message: "No se ha introducido ninguna uuid" });
            return;
        }

        //Verificacion de la uuid
        if(!validators.verifyUUID(body.company_uuid)){
            response.json({ valid: false, message: "La uuid no es valida" });
            return;
        }

        //Comprobar que la compañia existe
        global.functions.isCompanyRegistered(body.company_uuid).then((isCompanyRegistered) => {
            if (!isCompanyRegistered) {
                response.json({valid: false, message: "La compañia no esta registrada"});
                return;
            }

            //Comprobar que el usuario pertenece a la compañia
            global.functions.isUserFromCompany(body.company_uuid, auth.user_uuid).then((isUserFromCompany) => {
                if (!isUserFromCompany) {
                    response.json({valid: false, message: "No tienes acceso a esta compañia"});
                    return;
                }

                const sql_conn = sql_source.connection();
                const sql_query =
                    `SELECT id AS group_id
                    FROM CompanyGroup 
                    WHERE fk_company_uuid=${sql_conn.escape(body.company_uuid)} 
                    ORDER BY id DESC`;
                sql_conn.query(sql_query, (sql_error, sql_results, sql_fields) => {
                    let promises = [];
                    sql_results
                        .forEach((res) => promises.push(global.functions.getCompanyGroupInfo(body.company_uuid, res.group_id, auth.user_uuid)) );
                    Promise.all(promises).then((res) => response.json(res));
                    sql_conn.end();
                })

            });
        });
    });
};