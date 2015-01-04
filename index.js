var CouchCushion = require('./src'),
    walk = require('./lib/walk');

// require all included models here
walk(__dirname + '/src/models', function(file) {
    require(file)(CouchCushion);
});

module.exports = exports = CouchCushion;
