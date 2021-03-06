/**
 * Created by pablo on 24/3/17.
 */
const sql_source = require('../../utils/sql-source');
const crypt_utils = require('../../utils/crypt-utils');

module.exports = (app, express, request, response, next) => {
    global.functions.authRequest(request).then((auth) => {
        if(!auth.valid){
            response.json(auth);
            return;
        }
        console.log(request.body + "-1");
        response.json(auth);
    });
};