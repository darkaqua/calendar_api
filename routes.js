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

            let route_name  = (directory + /(.+)\.js/i.exec(name)[1]);
            let complete_route = `./routes/${route_name}`;

            //TODO Verificar al usuario, menos por el login y el registro

            if(route_name.indexOf(`get`) !== -1){
                app.get(`${route_name.replace('get', '')}`, (request, response, next) =>
                    require(complete_route)(app, express, request, response, next)
                );
                return;
            }
            app.post(`${route_name.replace('post', '')}`, (request, response, next) =>
                require(complete_route)(app, express, request, response, next)
            );
        });
    };
    readRoutes();

    const pkg = global.package;
    const basic_msg = { message:`${pkg.name} - versión ${pkg.version}`};
    app.get('*', (request, response, next) => response.json(basic_msg));
    app.post('*', (request, response, next) => response.json(basic_msg));
};