/**
 * Created by pablo on 16/3/17.
 */
const fs = require('fs');
const express = require('express');

const app = express();

global.package = require('./package.json');
global.config = require('./private/config.json');

const port = global.config.api.port;

app.listen(port, () => {
    console.log(`REST API server started at http://localhost:${port}`)
});

require('./routes')(app, express);