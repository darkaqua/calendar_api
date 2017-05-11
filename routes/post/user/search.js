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
        const username = sql_conn.escape(request.body.search).replace(/'/g, '');
        const query = `SELECT uuid, username FROM User WHERE username LIKE '%${username}%'`;
        sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
            response.json(sql_results.map((un) => un));
            sql_conn.end();
        });

    });

};