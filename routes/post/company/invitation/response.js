/**
 * Created by Pablo on 26/03/2017.
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

        if(body.company_uuid === undefined){
            response.json({ valid: false, message: `La uuid de la compañia no puede estar vacia` });
            return;
        }
        if(!validators.verifyUUID(body.company_uuid)){
            response.json({ valid: false, message: `La uuid de la compañia no es valida` });
            return;
        }

        if(body.response === undefined){
            response.json({ valid: false, message: `La respuesta no puede estar vacia` });
            return;
        }

        //Verificar que la solicitud existe
        const sql_conn = sql_source.connection();
        const query =
            `SELECT COUNT(*) AS count 
            FROM UserLinkedCompany 
            WHERE petition='0' 
            AND fk_user_uuid=${sql_conn.escape(auth.user_uuid)}
            AND fk_company_uuid=${sql_conn.escape(body.company_uuid)}`;
        sql_conn.query(query, (sql_error, sql_results, sql_fields) => {

            if(sql_results[0].count === 0){
                response.json({ valid: false, message: `La solcitud no existe` });
                sql_conn.end();
                return;
            }

            if(body.response){

                //Aceptar o denegar la solicitud
                const query =
                    `UPDATE UserLinkedCompany 
                    SET petition='1' 
                    WHERE petition='0' 
                    AND fk_user_uuid=${sql_conn.escape(auth.user_uuid)}
                    AND fk_company_uuid=${sql_conn.escape(body.company_uuid)}`;
                sql_conn.query(query, (sql_error_2, sql_results_2, sql_fields_2) => {
                    response.json({ valid: true, message: `La solcitud ha sido aceptada!` });
                    sql_conn.end();
                });
                return;
            }
            const query =
                `DELETE FROM UserLinkedCompany 
                WHERE petition='0' 
                AND fk_user_uuid=${sql_conn.escape(auth.user_uuid)}
                AND fk_company_uuid=${sql_conn.escape(body.company_uuid)}`;
            sql_conn.query(query, (sql_error_2, sql_results_2, sql_fields_2) => {
                response.json({ valid: true, message: `La solcitud ha sido rechazada!` });
                sql_conn.end();
            });
        });

    });
};