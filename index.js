var CouchCushion = require('./src'),
    walk = require('./lib/walk');

// require all included models here
walk(__dirname + '/src/models', require);

module.exports = exports = CouchCushion;
