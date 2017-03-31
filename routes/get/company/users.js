/**
 * Created by pablo on 31/3/17.
 */
const sql_source = require('../../../utils/sql-source');

module.exports = (app, express, request, response, next) => {

    global.functions.authRequest(request).then((auth) => {
        if (!auth.valid) {
            response.json(auth);
            return;
        }
        const query = request.query;

        const sql_conn = sql_source.connection();
        const sql_query =
            `SELECT fk_user_uuid AS user_uuid
            FROM UserLinkedCompany 
            WHERE petition=1 
            AND fk_company_uuid=${sql_conn.escape(query.uuid)} 
            ORDER BY join_timestamp DESC`;
        sql_conn.query(sql_query, (sql_error, sql_results, sql_fields) => {
            let promises = [];
            sql_results.map((user) => user.user_uuid)
                .forEach((user_uuid) => promises.push(global.functions.getUserInfo(user_uuid, false)) );
            Promise.all(promises).then((res) => response.json(res));

        });

    });

};