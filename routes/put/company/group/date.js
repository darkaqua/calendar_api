/**
 * Created by Pablo on 12/05/17.
 */
const sql_source = require('../../../../utils/sql-source');
const validators = require('../../../../utils/validators');

module.exports = (app, express, request, response, next) => {

    global.functions.authRequest(request).then((auth) => {
        if (!auth.valid) {
            response.json(auth);
            return;
        }
        const body = request.body;

        //Comprobar que company_uuid esta escrita
        if(body.company_uuid === undefined){
            response.json({valid: false, message: `La uuid de la compañia no puede estar vacia`});
            return;
        }
        //Comprobar que company_uuid es valida
        if(!validators.verifyUUID(body.company_uuid)){
            response.json({valid: false, message: `La uuid de la compañia no es valida`});
            return;
        }
        //Comprobar que group_id esta escrito
        if(body.group_id === undefined){
            response.json({valid: false, message: `La id del grupo no puede estar vacia`});
            return;
        }
        //Comprobar que group_id es un numero
        if(!isNaN(body.group_id)){
            response.json({valid: false, message: `La id del grupo no puede estar vacia`});
            return;
        }
        //Comprobar que el titulo no esta vacio
        //Comprobar que el titulo tiene una longitud mayor a X
        //Comprobar que la fecha no este vacia
        //Comprobar que la fecha tenga un formato "dd/MM/yyyy hh:mm"
        //Comprobar que los minutos no estan vacios
        //Comprobar que los minutos sean numeros

        //Comprobar que company_uuid existe
        //Comprobar que group_id existe
        //Comprobar que tieenes permisos de edición en la compañia o en el grupo

    });
};