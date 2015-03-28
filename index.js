var CouchCushion = require('./src');

// Initialize a global CC object
CouchCushion = new CouchCushion();

// manually require included models here
require('./src/models/list')(CouchCushion);


module.exports = exports = CouchCushion;
