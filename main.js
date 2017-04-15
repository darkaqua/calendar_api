/**
 * Created by pablo on 16/3/17.
 */
const fs = require('fs');
const express = require('express');
const body_parser = require("body-parser");

const app = express();

app.use(body_parser.json());

require(`./functions`);

global.package = require('./package.json');
try{
    global.config = require('./private/config.json');

    const port = global.config.api.port;

    app.listen(port, () => {
        console.log(`REST API server started at http://localhost:${port}`)
    });

    require('./routes')(app, express);
} catch(e){
    console.log(`No se encuentra el archivo de configuración... :(`);
}