/**
 * Created by srpag on 15/04/17.
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
            `SELECT fk_company_uuid AS company_uuid, fk_group_id AS group_id
            FROM UserLinkedCompanyGroup 
            WHERE fk_user_uuid=${sql_conn.escape(auth.user_uuid)} 
            ORDER BY join_timestamp DESC`;
        sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
            let promises = [];
            sql_results
                .forEach((res) => promises.push(global.functions.getCompanyGroupInfo(res.company_uuid, res.group_id, auth.user_uuid)) );
            Promise.all(promises).then((res) => response.json(res));
            sql_conn.end();
        })
        
    });

};