/**
 * Created by pablo on 16/3/17.
 */
const fs = require('fs');
const path = require("path");

module.exports = (app, express) => {

    const readRoutes = (directory = '') => {
        fs.readdirSync(path.join(__dirname, `routes/${directory}`)).forEach((name) =>{
            if(name.indexOf('.js') === -1){
                readRoutes(directory + name + "/");
                return;
            }

            let route_name = (directory+ /(.+)\.js/i.exec(name)[1]).replace(/\//g, ' ');
            let route_file = route_name.replace(/ /g, '/');

            app.get(`/${route_file}`, (request, response, next) => {
                //TODO Verificar al usuario, menos por el login y el registro
                require(`./routes/${route_file}`)(app, express, request, response, next);
            });
        });
    };
    readRoutes();

    const pkg = global.package;
    const basic_msg = { message:`${pkg.name} - versión ${pkg.version}`};
    app.get('*', (request, response, next) => response.json(basic_msg));
};