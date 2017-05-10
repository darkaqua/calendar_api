/**
 * Created by pablo on 5/5/17.
 */
const probe = require('pmx').probe();
const sql_source = require('../utils/sql-source');

let e = module.exports.metric = probe.metric({
    name    : 'Registered users'
});

const sql_conn = sql_source.connection();
const query = `SELECT COUNT(*) AS count FROM User`;
sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
    if(sql_error) return;
    if(!sql_results.length) return;

    e.metric.set(sql_results[0].count);

    sql_conn.close();
});