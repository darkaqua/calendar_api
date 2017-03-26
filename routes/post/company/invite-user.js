/**
 * Created by Pablo on 26/03/2017.
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

        //uuid de la compañia
        if(body.company_uuid === undefined){
            response.json({ valid: false, message: `La uuid de la compañia no puede estar vacia` });
            return;
        }
        if(!validators.verifyUUID(body.company_uuid)){
            response.json({ valid: false, message: `La uuid de la compañia no es valida` });
            return;
        }
        //username del usuario
        if(body.username === undefined){
            response.json({ valid: false, message: `El nombre de usuario no puede estar vacio` });
            return;
        }
        //rango
        if(body.permission === undefined){
            response.json({ valid: false, message: `El numero de permiso no puede estar vacio` });
            return;
        }
        if(isNaN(body.permission)){
            response.json({ valid: false, message: `El numero de permiso no es un numero` });
            return;
        }

        //Que la compañia exista y tenga rango owner de ella
        const sql_conn = sql_source.connection();
        const query =
            `SELECT COUNT(*) AS count 
            FROM UserLinkedCompany 
            WHERE fk_user_permission='1' 
            AND fk_user_uuid=${sql_conn.escape(auth.user_uuid)}
            AND fk_company_uuid=${sql_conn.escape(body.company_uuid)}`;
        sql_conn.query(query, (sql_error, sql_results, sql_fields) => {
            const count = sql_results[0].count;

            if(count === 0){
                response.json({ valid: false, message: `No tienes permisos para enviar peticiones de esta compañia` });
                return;
            }

            //Verificar que el owner no se esta intentando cambiar los permisos
            global.functions.getUUIDFromUsername(body.username).then((user_uuid) => {

                if(user_uuid === auth.user_uuid){
                    response.json({ valid: false, message: `No puedes cambiarte los permisos sobre la compañia` });
                    return;
                }

                //Usuario exista mediante username
                global.functions.isUsernameRegistered(body.username).then((isUsernameRegistered) => {

                    if(!isUsernameRegistered){
                        response.json({ valid: false, message: `El nombre de usuario no esta registrado` });
                        return;
                    }

                    //Verificar si el nivel de permiso existe
                    const query =
                        `SELECT COUNT(*) AS count 
                        FROM UserPermission 
                        WHERE id=${sql_conn.escape(body.permission)}`;
                    sql_conn.query(query, (sql_error, sql_results, sql_fields) => {

                        if(sql_results[0].count === 0){
                            response.json({ valid: false, message: `El numero de permiso no existe` });
                            return;
                        }

                        //Que no tenga una peticion previa
                        //Este en la misma compañia con el mismo rango (en caso de que tenga otro rango se asigna de forma automatica)
                        const query =
                            `INSERT INTO 
                            UserLinkedCompany(fk_company_uuid, fk_user_uuid, fk_user_permission) 
                            VALUES(
                            ${sql_conn.escape(body.company_uuid)},
                            (SELECT uuid FROM User WHERE username=${sql_conn.escape(body.username)}),
                            ${sql_conn.escape(body.permission)}
                            ) ON DUPLICATE KEY UPDATE 
                            fk_user_permission=${sql_conn.escape(body.permission)}`;
                        sql_conn.query(query, () => {
                            response.json({ valid: true, message: `Se ha enviado la solicitud a ${body.username}!` });
                        });

                    });

                });

            });

        });

    });
};