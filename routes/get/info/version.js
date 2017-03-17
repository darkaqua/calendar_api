/**
 * Created by pablo on 16/3/17.
 */
module.exports = (app, express, request, response, next) => {
    response.json({ version: global.package.version });
};