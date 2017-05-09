/**
 * Created by pablo on 5/5/17.
 */
const probe = require('pmx').probe();
const sql_source = require('../utils/sql-source');

let metric = probe.metric({
    name    : 'Registered users'
});

setInterval(() => {
    const sql_conn = sql_source.connection();
    const query = `SELECT COUNT(*) AS count FROM User`;
    sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
        if(sql_error) return;
        if(!sql_results.length) return;

        metric.set(sql_results[0].count);
    });
}, 1000);