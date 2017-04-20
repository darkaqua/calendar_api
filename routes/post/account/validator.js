/**
 * Created by pablo on 20/4/17.
 */
module.exports = (app, express, request, response, next) => {
    const body = request.body;


    if(body.client_id === undefined){
        response.json({ valid: false, message: "La id del cliente no puede estar vacia" });
        return;
    }
    if(body.client_token === undefined){
        response.json({ valid: false, message: "El token del cliente no puede estar vacio" });
        return;
    }
    const auth = {
        headers: {
            client_id: body.client_id,
            client_token: body.client_token
        }
    };

    global.functions.authRequest(auth).then(res => {
        response.json({ valid:res.valid });
    });
};