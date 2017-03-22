/**
 * Created by pablo on 17/3/17.
 */
const validators = require('../../../utils/validators');
const crypt_utils = require('../../../utils/crypt-utils');
const sql_source = require('../../../utils/sql-source');

module.exports = (app, express, request, response, next) => {
    const query = request.query;

    getLoginResponse(query.email, query.password).then((res) => {
        response.json(res);
    });

    // response.json(
    //     {
    //         valid: true,
    //         client_id: "c69effc00619d50fd735cb09721221b68c81f6b7bcb063df590d5bd7c68c0d7b",
    //         client_token: "471acf692b08612c2a9cb219491f4610c4af824adc391239f512105a83ec2312",
    //
    //         debug: {
    //             email: query.email,
    //             password: query.password
    //         }
    //     }
    // );
};

const getLoginResponse = (email, password) => {
    return new Promise((promise_result, promise_error) => {
        //Comprueba que el correo electrónico no sea null o no tenga un formato valido
        if(email === undefined || !validators.verifyEmail(email)){
            promise_result({ valid: false, message: `El correo electrónico no es valido` });
            return;
        }
        //Comprueba que la contraseña no sea null
        if(password === undefined){
            promise_result({ valid: false, message: `La contraseña no es valida` });
            return;
        }

        const sql_conn = sql_source.connection();
        const query = `SELECT uuid, hash FROM User WHERE email=${sql_conn.escape(email)}`;
        sql_conn.query(
            query,
            (sql_error, sql_results, sql_fields) => {
                //Comprueba que el resultado no este vacio
                if(sql_results === undefined){
                    promise_result({ valid: false, message: `El correo electrónico no esta registrado` });
                    return;
                }

                const sql_result = sql_results[0];
                //Comprueba que los resultados son vacios
                if(sql_results.length === 0){
                    promise_result({ valid: false, message: `El correo electrónico no esta registrado` });
                    return;
                }
                //Comprueba la contraseña con el hash de la cuenta
                if(!crypt_utils.bcrypt_verify(password, sql_result.hash)){
                    promise_result({ valid: false, message: `La contraseña no coincide con el correo electrónico` });
                    return;
                }
                //Genera un client token
                const all_client_token = crypt_utils.genClientToken();
                //Genera una id de cliente
                const client_id = all_client_token.id;
                //Genera un token + hash_token del cliente
                const client_token = all_client_token.token;

                //Añadir nueva autentificación del usuario en la db
                const query =
                    `INSERT INTO UserSession(fk_user_uuid, client_id, client_token) 
                    VALUES (${sql_conn.escape(sql_result.uuid)},'${client_id}','${client_token.hash}')`;
                sql_conn.query(
                    query,
                    () => {
                        //Envia la id del cliente el token
                        promise_result({ valid: true, client_id: client_id, client_token: client_token.raw });
                    }
                );
            }
        );
    });
};