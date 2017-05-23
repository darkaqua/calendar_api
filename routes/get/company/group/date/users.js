/**
 * Created by pablo on 31/3/17.
 */
const sql_source = require('../../../../../utils/sql-source');
const validators = require('../../../../../utils/validators');

module.exports = (app, express, request, response, next) => {

    global.functions.authRequest(request).then((auth) => {
        if (!auth.valid) {
            response.json(auth);
            return;
        }
        const body = Object.keys(request.body).length !== 0 ? request.body : JSON.parse(request.query.params);

        //Comprobar que la uuid de la compañia es una uuid
        if(body.company_uuid === undefined){
            response.json({ valid: false, message: `La uuid de la compañia no puede estar vacia` });
            return;
        }
        if(!validators.verifyUUID(body.company_uuid)){
            response.json({ valid: false, message: `La uuid de la compañia debe ser una uuid valida` });
            return;
        }
        //Comprobar que la id del grupo es un integer
        if(body.group_id === undefined){
            response.json({ valid: false, message: `La id del grupo no puede estar vacia` });
            return;
        }
        if(isNaN(body.group_id)){
            response.json({ valid: false, message: `La id del grupo debe ser un número valido` });
            return;
        }
        //Validación de date_id
        if(body.date_id === undefined){
            response.json({ valid: false, message: `La id de la fecha no puede estar vacia` });
            return;
        }
        if(isNaN(body.date_id)){
            response.json({ valid: false, message: `La id de la fecha debe ser un número valido` });
            return;
        }

        //Comprobar que la uuid de la compañia existe
        global.functions.isCompanyRegistered(body.company_uuid).then((isCompanyRegistered) => {
            if (!isCompanyRegistered) {
                response.json({valid: false, message: `La compañia no existe`});
                return;
            }
            //Comprobar que la id del grupo existe
            global.functions.isCompanyGroupRegistered(body.company_uuid, body.group_id)
                .then((isCompanyGroupRegistered) => {
                if (!isCompanyGroupRegistered) {
                    response.json({valid: false, message: `No existe este grupo dentro de la compañia`});
                    return;
                }

                //Comprobar si la fecha existe
                global.functions.isCompanyGroupDateRegistered(body.company_uuid, body.group_id, body.date_id)
                    .then(isCompanyGroupDateRegistered => {
                    if (!isCompanyGroupDateRegistered) {
                        response.json({
                            valid: false,
                            message: `No existe esta fecha dentro de este grupo dentro de la compañia`
                        });
                        return;
                    }

                    global.functions.isUserFromCompany(body.company_uuid, auth.user_uuid).then((isUserFromCompany) => {
                        if (!isUserFromCompany) {
                            response.json({valid: false, message: "No tienes acceso a esta compañia"});
                            return;
                        }

                        const sql_conn = sql_source.connection();
                        const sql_query =
                            `SELECT fk_user_uuid AS user_uuid
                        FROM UserLinkedCompanyGroupDate 
                        WHERE fk_company_uuid=${sql_conn.escape(body.company_uuid)} 
                        AND fk_group_id=${sql_conn.escape(body.group_id)} 
                        AND fk_date_id=${sql_conn.escape(body.date_id)} 
                        ORDER BY join_timestamp DESC`;
                        sql_conn.query(sql_query, (sql_error, sql_results, sql_fields) => {
                            let promises = [];
                            sql_results.map((user) => user.user_uuid)
                                .forEach((user_uuid) => promises.push(global.functions.getUserInfo(user_uuid, false)));
                            Promise.all(promises).then((res) => response.json(res));
                            sql_conn.end();
                        });
                    });
                });
            });
        });

    });

};