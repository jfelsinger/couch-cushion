var CouchCushion = require('./src'),
    walk = require('./lib/walk');

// Initialize a global CC object
CouchCushion = new CouchCushion();

// require all included models here
walk(__dirname + '/src/models', function(file) {
    require(file)(CouchCushion);
});

module.exports = exports = CouchCushion;
