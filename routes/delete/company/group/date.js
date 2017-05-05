/**
 * Created by srpag on 22/04/17.
 */
const sql_source = require('../../../../utils/sql-source');
const validators = require('../../../../utils/validators');

module.exports = (app, express, request, response, next) => {
    global.functions.authRequest(request).then((auth) => {
        if (!auth.valid) {
            response.json(auth);
            return;
        }
        const query = request.query;

        //Comprobar id del grupo
        //Comprobar uuid de la compañia
        //Comprobar titulo
        //Comprobar fecha
        //Comprobar minutos

        //Añadir
    });
};