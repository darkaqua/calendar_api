/**
 * Created by pablo on 5/5/17.
 */
const probe = require('pmx').probe();

module.exports.init = () => {
    module.exports.counter = probe.counter({
        name    : 'Total requests',
        value   : () => { return 0 }
    });
};