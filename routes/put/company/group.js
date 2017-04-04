/**
 * Created by pablo on 4/4/17.
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

        //Comprobar que uuid esta escrita
        if(body.company_uuid === undefined){

        }
        //Comprobar que la uuid es valida
        if(!validators.verifyUUID(body.company_uuid)){

        }
        //Comprobar que el nombre no esta vacio
        if(body.name === undefined){

        }
        //Comprobar que el nombre es mas largo de 4 caracteres
        if(body.name.length <= 4){

        }
        //Descripción opcional

        //Comprobar que la uuid pertenece a una compañia
        global.functions.isCompanyRegistered(body.company_uuid).then(isCompanyRegistered => {
            if(!isCompanyRegistered){

            }
            //Comprobar que tienes permisos de edición en la compañia
            global.functions.hasUserPermissionToEditCompany(body.company_uuid, auth.user_uuid).then(hasUserPermissionToEditCompany => {
                if(!hasUserPermissionToEditCompany){

                }
                //Comprobar si puede crear mas grupos

                //Recuperar la id del último grupo y añadir +1
                //Añadir grupo (Añadir al grupo el creador(?))
            });
        });

    });

};

const getNumberOfCompanyGroups = (company_uuid) => {

};

const getMaxNumberOfCompanyGroups = (user_uuid) => {
    return new Promise((promise_result, promise_error) => {
        const sql_conn = sql_source.connection();
        const query =
            `SELECT count(*) AS count 
            FROM UserPayment 
            WHERE fk_user_uuid=${sql_conn.escape(user_uuid)}`;
        sql_conn.query(
            query,
            (sql_error, sql_results, sql_fields) => {
                promise_result(sql_results[0].count + 1)
            }
        );
    });
};