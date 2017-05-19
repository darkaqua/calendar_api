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
        const body = request.body;

        if(body.company_uuid === undefined){
            response.json({ valid: false, message: "No se ha introducido ninguna uuid" });
            return;
        }

        //Verificacion de la uuid
        if(!validators.verifyUUID(body.company_uuid)){
            response.json({ valid: false, message: "La uuid no es valida" });
            return;
        }

        if(body.group_id === undefined){
            response.json({ valid: false, message: "No se ha introducido ninguna id del grupo" });
            return;
        }

        if(isNaN(body.group_id)){
            response.json({ valid: false, message: "La id del grupo no es un número" });
            return;
        }

        //Comprobar que la compañia existe
        global.functions.isCompanyRegistered(body.company_uuid).then((isCompanyRegistered) => {
            if (!isCompanyRegistered) {
                response.json({valid: false, message: "La compañia no esta registrada"});
                return;
            }

            //Comprobar que el grupo existe
            global.functions.isCompanyGroupRegistered(body.company_uuid, body.group_id)
                .then((isCompanyGroupRegistered) => {
                if (!isCompanyGroupRegistered) {
                    response.json({valid: false, message: `No existe este grupo dentro de la compañia`});
                    return;
                }

                global.functions.getCompanyGroupInfo(body.company_uuid, body.group_id, auth.user_uuid)
                    .then(res => response.json(res));
            });
        });
    });
};