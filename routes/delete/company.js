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
        const query = request.query;

        if(query.uuid === undefined){
            response.json({ valid: false, message: `La uuid de la compañia no puede estar vacia` });
            return;
        }
        if(!validators.verifyUUID(query.uuid)){
            response.json({ valid: false, message: `La uuid de la compañia no es valida` });
            return;
        }

        //Verificar que la compañia existe
        global.functions.isCompanyRegisterd(query.uuid).then((isCompanyRegisterd) => {
            if(!isCompanyRegisterd){
                response.json({ valid: false, message: `La compañia no existe` });
                return;
            }

            //Verificar que el usuario tiene permisos para editar la compañia
            const sql_conn = sql_source.connection();
            let sql_query =
                `SELECT COUNT(*) AS count 
                FROM UserLinkedCompany 
                WHERE fk_company_uuid=${sql_conn.escape(query.uuid)}
                AND fk_user_uuid=${sql_conn.escape(auth.user_uuid)}
                AND can_edit='1'`;
            sql_conn.query(sql_query, (sql_error, sql_results, sql_fields) => {

                if(sql_results[0].count === 0){
                    response.json({ valid: false, message: `No tienes permisos suficientes sobre esta compañia` });
                    return;
                }

                sql_query = `DELETE FROM Company WHERE uuid=${sql_conn.escape(query.uuid)}`;
                sql_conn.query(sql_query, () => {
                    response.json({ valid: true, message: `Se ha eliminado con éxito la compañia` });
                });
            });
        });
    });
};