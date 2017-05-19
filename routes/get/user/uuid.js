/**
 * Created by pablo on 19/5/17.
 */
const sql_source = require('../../../utils/sql-source');
const validators = require('../../../utils/validators');

module.exports = (app, express, request, response, next) => {

    global.functions.authRequest(request).then((auth) => {
        if (!auth.valid) {
            response.json(auth);
            return;
        }
        const body = Object.keys(request.body).length !== 0 ? request.body : JSON.parse(request.query.params);

        if(body.username === undefined){
            response.json({ valid: false, message: `El nombre de usuario no puede estar vacio` });
            return;
        }

        global.functions.isUsernameRegistered(body.username).then(isUsernameRegistered => {
            if(!isUsernameRegistered){
                response.json({ valid: false, message: `El nombre de usuario no esta registrado` });
                return;
            }
            global.functions.getUUIDFromUsername(body.username).then(user_uuid => {
                response.json({ valid: true, user_uuid: user_uuid });
            });
        });
    });
};