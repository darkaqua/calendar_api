/**
 * Created by pablo on 22/3/17.
 */
const validators = require('../../../utils/validators');
const crypt_utils = require('../../../utils/crypt-utils');
const sql_source = require('../../../utils/sql-source');

module.exports = (app, express, request, response, next) => {
    const query = request.query;

    getRegisterResponse(
        query.name,
        query.username,
        query.email,
        query.re_email,
        query.password,
        query.re_password,
        query.telephone,
        query.city,
        query.postal_code,
        query.country
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
        if(name === undefined){
            promise_result({ valid: false, message: `El campo del nombre no puede estar vacio` });
            return;
        }
        if(username === undefined){
            promise_result({ valid: false, message: `El campo del nombre de usuario no puede estar vacio` });
            return;
        }
        if(email === undefined){
            promise_result({ valid: false, message: `El campo del correo electrónico no puede estar vacio` });
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
        if(password === undefined){
            promise_result({ valid: false, message: `El campo del contraseña no puede estar vacia` });
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
        if(country === undefined){
            promise_result({ valid: false, message: `El campo del pais no puede estar vacio` });
            return;
        }
        //Username repetido

        //email repetido

        //

        promise_result({ valid: true }); //Volver al login
    });
};