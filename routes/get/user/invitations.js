/**
 * Created by Pablo on 26/03/2017.
 */
const sql_source = require('../../../utils/sql-source');

module.exports = (app, express, request, response, next) => {

    global.functions.authRequest(request).then((auth) => {
        if (!auth.valid) {
            response.json(auth);
            return;
        }

        const sql_conn = sql_source.connection();
        const query =
            `SELECT fk_company_uuid AS company_uuid, join_timestamp, can_edit 
            FROM UserLinkedCompany 
            WHERE petition='0'
            AND fk_user_uuid=${sql_conn.escape(auth.user_uuid)}`;
        sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
            response.json(sql_results);
        });

    });

};