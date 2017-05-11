/**
 * Created by pablo on 22/3/17.
 */
const validators = require('../../../utils/validators');
const crypt_utils = require('../../../utils/crypt-utils');
const sql_source = require('../../../utils/sql-source');
const uuid = require('uuid');
const metrics_registerd_users = require('../../../metrics/m_registerd-users');

module.exports = (app, express, request, response, next) => {
    const body = request.body;

    getRegisterResponse(
        body.name,
        body.username,
        body.email,
        body.re_email,
        body.password,
        body.re_password,
        body.telephone,
        body.city,
        body.postal_code,
        body.country
    ).then((res) => {
        response.json(res);
    });
};

const getRegisterResponse = (
    name, username,
    email, re_email,
    password, re_password,
    telephone, //Puede estar vacio
    city, //Puede estar vacio
    postal_code, //Puede estar vacio
    country) => {
    return new Promise((promise_result, promise_error) => {
        //Verificación del nombre
        if(name === undefined){
            promise_result({ valid: false, message: `El campo del nombre no puede estar vacio` });
            return;
        }
        if(name.length <= 4){
            promise_result({ valid: false, message: `El nombre debe contener más carácteres` });
            return;
        }
        //Verificación del nombre de usuario
        if(username === undefined){
            promise_result({ valid: false, message: `El campo del nombre de usuario no puede estar vacio` });
            return;
        }
        if(username.length <= 4){
            promise_result({ valid: false, message: `El nombre de usuario debe contener más carácteres` });
            return;
        }
        //Verificación del correo electrónico
        if(email === undefined){
            promise_result({ valid: false, message: `El campo del correo electrónico no puede estar vacio` });
            return;
        }
        if(!validators.verifyEmail(email)){
            promise_result({ valid: false, message: `El correo electrónico no es valido` });
            return;
        }
        if(re_email === undefined){
            promise_result({ valid: false, message: `La campo de confirmación del correo electrónico no puede estar vacio` });
            return;
        }
        if(email !== re_email){
            promise_result({ valid: false, message: `Los correos electrónicos no coinciden` });
            return;
        }
        //Verificación de la contraseña
        if(password === undefined){
            promise_result({ valid: false, message: `El campo del contraseña no puede estar vacia` });
            return;
        }
        if(password.length <= 8){
            promise_result({ valid: false, message: `La contraseña debe contener más de 8 carácteres` });
            return;
        }
        if(re_password === undefined){
            promise_result({ valid: false, message: `El campo de confirmación de la contraseña no puede estar vacia` });
            return;
        }
        if(password !== re_password){
            promise_result({ valid: false, message: `Las contraseñas no coinciden` });
            return;
        }
        //Verificación del telefono
        if(telephone === undefined){
            promise_result({ valid: false, message: `El campo del telefono no puede estar vacio` });
            return;
        }
        if(telephone.length <= 8){
            promise_result({ valid: false, message: `El telefono no puede ser tan corto` });
            return;
        }
        //Verificación del pais
        if(country === undefined){
            promise_result({ valid: false, message: `El campo del pais no puede estar vacio` });
            return;
        }
        //country valido
        const sql_conn = sql_source.connection();
        const query = `SELECT count(*) AS count, id AS country_id FROM Country WHERE code=${sql_conn.escape(country)}`;
        sql_conn.query(
            query,
            (sql_error, sql_results, sql_fields) => {

                const sql_result = sql_results[0];
                if(sql_result.count !== 1){
                    promise_result({ valid: false, message: `El código de pais no es valido` });
                    sql_conn.end();
                    return;
                }
                //Username repetido
                //email repetido
                const query =
                    `SELECT email, username FROM User 
                    WHERE email=${sql_conn.escape(email)} 
                    OR username=${sql_conn.escape(username)}`;
                sql_conn.query(
                    query,
                    (sql_error_2, sql_results_2, sql_fields_2) => {

                        if(sql_results_2.length !== 0){
                            const sql_result_2 = sql_results_2[0];

                            if(sql_result_2.email === email){
                                promise_result({ valid: false, message: `El correo electrónico ya esta registrado` });
                                return;
                            }

                            promise_result({ valid: false, message: `El nombre de usuario ya esta registrado` });
                            return;
                        }

                        const query =
                            `INSERT INTO User(uuid, name, username, telephone, city, postal_code, email, hash, fk_country_id) 
                            VALUES (
                            ${sql_conn.escape(uuid.v4())},
                            ${sql_conn.escape(name)},
                            ${sql_conn.escape(username)},
                            ${sql_conn.escape(telephone === undefined ? '' : telephone)},
                            ${sql_conn.escape(city === undefined ? '' : city)},
                            ${sql_conn.escape(postal_code === undefined ? '' : postal_code)},
                            ${sql_conn.escape(email)},
                            ${sql_conn.escape(crypt_utils.bcrypt_encrypt(password))},
                            ${sql_conn.escape(sql_result.country_id)}
                            )`;
                        sql_conn.query(
                            query,
                            (sql_error_3, sql_results_3, sql_fields_3) => {
                                metrics_registerd_users.counter.inc();
                                promise_result({ valid: true }); //Volver al login
                                sql_conn.end();
                            }
                        );

                    }
                );
            }
        );
    });
};