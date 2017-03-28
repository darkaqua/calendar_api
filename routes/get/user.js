/**
 * Created by Pablo on 25/03/2017.
 */
const sql_source = require('../../utils/sql-source');
const validators = require('../../utils/validators');

module.exports = (app, express, request, response, next) => {
    global.functions.authRequest(request).then((auth) => {
        if(!auth.valid){
            response.json(auth);
            return;
        }
        const query = request.query;

        if(query.uuid === undefined){
            response.json({ valid: false, message: "LNo se ha introducido ninguna uuid" });
            return;
        }

        //Verificacion de la uuid
        if(!validators.verifyUUID(query.uuid)){
            response.json({ valid: false, message: "La uuid no es valida" });
            return;
        }

        getUserInfo(query.uuid, auth.user_uuid === query.uuid).then((data) => {
            if(data.valid){
                auth.content = data.content;
                response.json(auth);
                return;
            }
            auth.valid = false;
            auth.message = "El usuario no existe";
            response.json(auth);
        });
    });
};

const getUserInfo = (user_uuid, pub) => {
    return new Promise((promise_result, promise_error) => {
        const sql_conn = sql_source.connection();
        const query =
            `SELECT u.name, u.username, u.telephone, u.city, 
            u.postal_code, u.email, u.register_timestamp, 
            c.name AS country_name, c.code AS country_code 
            FROM User u 
            JOIN Country c 
            ON u.fk_country_id = c.id 
            WHERE uuid=${sql_conn.escape(user_uuid)}`;
        sql_conn.query(
            query,
            (sql_error, sql_results, sql_fields) => {
                let sql_result = sql_results[0];
                if(sql_result === undefined){
                    promise_result({ valid: false });
                    return;
                }
                //El contenido del usuario es publico
                if(!pub){
                    const content = {
                        name: sql_result.name,
                        username: sql_result.username,
                        register_timestamp: sql_result.register_timestamp
                    };
                    promise_result({ valid: true, content: content });
                    return;
                }
                //El contenido del usuario es privado
                const country = {
                    name: sql_result.country_name,
                    code: sql_result.country_code
                };
                sql_result.country_name = sql_result.country_code = undefined;
                sql_result.country = country;
                promise_result({ valid: true, content: sql_result });
            }
        );
    });
};