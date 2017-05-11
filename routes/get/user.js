/**
 * Created by Pablo on 25/03/2017.
 */
const validators = require('../../utils/validators');

module.exports = (app, express, request, response, next) => {
    global.functions.authRequest(request).then((auth) => {
        if (!auth.valid) {
            response.json(auth);
            return;
        }
        const body = request.body;

        if (body.user_uuid === undefined) {
            response.json({valid: false, message: "No se ha introducido ninguna uuid"});
            return;
        }

        //Verificacion de la uuid
        if (!validators.verifyUUID(body.user_uuid)) {
            response.json({valid: false, message: "La uuid no es valida"});
            return;
        }

        global.functions.isUserUUIDRegistered(body.user_uuid).then((isUserRegistered) => {

            if(!isUserRegistered){
                response.json({valid: false, message: "El usuario no esta registrado"});
                return;
            }

            global.functions.getUserInfo(body.user_uuid, auth.user_uuid === body.user_uuid).then((data) => {
                response.json(data);
            });
        });
    });
};