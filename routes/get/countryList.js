/**
 * Created by pablo on 23/3/17.
 */
const sql_source = require('../../utils/sql-source');

module.exports = (app, express, request, response, next) => {
    const sql_conn = sql_source.connection();
    const query = `SELECT name, code FROM Country`;
    sql_conn.query(
        query,
        (sql_error, sql_results, sql_fields) => {
            console.log(sql_results);
            response.json(sql_results);
        }
    );
};