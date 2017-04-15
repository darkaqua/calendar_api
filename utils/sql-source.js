/**
 * Created by pablo on 22/3/17.
 */
const mysql = require('mysql');

module.exports = {
    connection: () => {
        return mysql.createConnection(global.config.db);
    }
};