/**
 * Created by pablo on 17/3/17.
 */
module.exports = (app, express, request, response, next) => {
    const query = request.query;
    response.json(
        {
            valid: true,
            client_id: "c69effc00619d50fd735cb09721221b68c81f6b7bcb063df590d5bd7c68c0d7b",
            client_token: "471acf692b08612c2a9cb219491f4610c4af824adc391239f512105a83ec2312",

            debug: {
                email: query.email,
                password: query.password
            }
        }
    );
};