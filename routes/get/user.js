/**
 * Created by Pablo on 25/03/2017.
 */
const sql_source = require('../../utils/sql-source');
const validators = require('../../utils/validators');

module.exports = (app, express, request, response, next) => {
    global.functions.authRequest(request).then((auth) => {
        if (!auth.valid) {
            response.json(auth);
            return;
        }
        const query = request.query;

        if (query.uuid === undefined) {
            response.json({valid: false, message: "No se ha introducido ninguna uuid"});
            return;
        }

        //Verificacion de la uuid
        if (!validators.verifyUUID(query.uuid)) {
            response.json({valid: false, message: "La uuid no es valida"});
            return;
        }

        global.functions.isUserUUIDRegistered(query.uuid).then((isUserRegistered) => {

            if(!isUserRegistered){
                response.json({valid: false, message: "El usuario no esta registrado"});
                return;
            }

            global.functions.getUserInfo(query.uuid, auth.user_uuid === query.uuid).then((data) => {
                response.json(data);
            });
        });
    });
};