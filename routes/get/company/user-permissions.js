/**
 * Created by Pablo on 26/03/2017.
 */
const sql_source = require('../../../utils/sql-source');

module.exports = (app, express, request, response, next) => {
    sql_source.connection().query(`SELECT * FROM UserPermission`,
        (sql_error, sql_results, sql_fields) => response.json(sql_results));
};