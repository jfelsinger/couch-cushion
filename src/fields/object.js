'use strict';

var Field = require('../field');

function FieldObject() {
    Field.apply(this, arguments);
}

FieldObject.prototype = Object.create(Field.prototype);
FieldObject.prototype.constructor = FieldObject;


module.exports = FieldObject;
