/**
 * Created by pablo on 24/3/17.
 */
const sql_source = require('./utils/sql-source');
const crypt_utils = require('./utils/crypt-utils');

global.functions = {
    authRequest: (request) => {
        return new Promise((promise_result, promise_error) => {
            const client_id = request.headers.client_id;
            const client_token = request.headers.client_token;

            const sql_conn = sql_source.connection();
            const query =
                `SELECT fk_user_uuid, client_hash 
                FROM UserSession 
                WHERE valid='1' AND DATE_ADD(creation,INTERVAL 30 DAY) > NOW()
                AND client_id=${sql_conn.escape(client_id)}`;
            sql_conn.query(
                query,
                (sql_error, sql_results, sql_fields) => {
                    const sql_result = sql_results[0];
                    const err_message = "No se ha podido verificar la autenticidad del cliente";

                    if(sql_result === undefined){
                        promise_result({ valid: false, message: err_message});
                        return;
                    }

                    const client_hash = sql_result.client_hash;

                    if(!crypt_utils.bcrypt_verify(client_token, client_hash)){
                        promise_result({ valid: false, message: err_message});
                        return;
                    }

                    promise_result({ valid: true, user_uuid: sql_result.fk_user_uuid });
                }
            );
        });
    }
};