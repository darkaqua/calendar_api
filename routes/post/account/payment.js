/**
 * Created by Pablo on 21/05/17.
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

        //Comprobar que payment_id es valido
        if(body.payment_id === undefined){
            response.json({ valid: false, message: `La id del pago no puede estar vacia` });
            return;
        }
        if(isNaN(body.payment_id)){
            response.json({ valid: false, message: `La id del pago debe ser un número valido` });
            return;
        }

        //Comprobar que el usuario existe
        global.functions.isUserUUIDRegistered(auth.user_uuid).then((isUserUUIDRegistered) => {
            if (!isUserUUIDRegistered) {
                response.json({valid: false, message: `El usuario no esta registrado`});
                return;
            }
            //Comprobar que el payment_id existe
            global.functions.isPaymentOptionAvailable(body.payment_id).then(isPaymentOptionAvailable => {
                if(!isPaymentOptionAvailable){
                    response.json({valid: false, message: `No se ha seleccionado una opción valida de pago`});
                    return;
                }
                doPayment(auth.user_uuid, body.payment_id).then(res => response.json(res));
            });
        });
    });
};

const doPayment = (user_uuid, payment_id) => {
    return new Promise((promise_result, promise_error) => {
        const sql_conn = sql_source.connection();
        const sql_query =
            `INSERT INTO UserPayment 
            (fk_user_uuid, fk_payment_option_id)
            VALUES(
            ${sql_conn.escape(user_uuid)},
            ${sql_conn.escape(payment_id)}
            )`;
        sql_conn.query(sql_query, (sql_error, sql_results, sql_fields) => {
            promise_result({
                valid: true,
                message: `Se ha realizado el pago con éxito`
            });
            sql_conn.end();
        });
    });
};