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

            switch (route_name.split(`/`)[0]){
                case `get`:
                    app.get(`${route_name.replace('get', '')}`, (request, response, next) =>
                        require(complete_route)(app, express, request, response, next)
                    );
                    break;
                case `post`:
                    app.post(`${route_name.replace('post', '')}`, (request, response, next) =>
                        require(complete_route)(app, express, request, response, next)
                    );
                    break;
                case `delete`:
                    app.delete(`${route_name.replace('delete', '')}`, (request, response, next) =>
                        require(complete_route)(app, express, request, response, next)
                    );
                    break;
                case `put`:
                    app.put(`${route_name.replace('put', '')}`, (request, response, next) =>
                        require(complete_route)(app, express, request, response, next)
                    );
                    break;
            }

        });
    };
    readRoutes();

    const pkg = global.package;
    const basic_msg = { message:`${pkg.name} - versión ${pkg.version}`};
    app.get('*', (request, response, next) => response.json(basic_msg));
    app.post('*', (request, response, next) => response.json(basic_msg));
};