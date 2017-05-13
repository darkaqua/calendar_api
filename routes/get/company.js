/**
 * Created by pablo on 30/3/17.
 */
const validators = require('../../utils/validators');

module.exports = (app, express, request, response, next) => {

    global.functions.authRequest(request).then((auth) => {
        if (!auth.valid) {
            response.json(auth);
            return;
        }

        const body = JSON.parse(request.query.params);

        if(body.company_uuid === undefined){
            response.json({ valid: false, message: "No se ha introducido ninguna uuid" });
            return;
        }

        //Verificacion de la uuid
        if(!validators.verifyUUID(body.company_uuid)){
            response.json({ valid: false, message: "La uuid no es valida" });
            return;
        }

        global.functions.isCompanyRegistered(body.company_uuid).then((isCompanyRegistered) => {

            if(!isCompanyRegistered){
                response.json({ valid: false, message: "La compañia no esta registrada" });
                return;
            }

            global.functions.getCompanyInfo(body.company_uuid, auth.user_uuid).then((company) => {
                response.json({ valid: true, content: company });
            });

        });
    });

};