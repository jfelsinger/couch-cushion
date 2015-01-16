'use strict';

var Field = require('../field');

function FieldString() {
    Field.apply(this, arguments);
}

FieldString.prototype = Object.create(Field.prototype);
FieldString.prototype.constructor = FieldString;

FieldString.prototype.set = function(value) {
    
    // Make falsy values equal an empty string
    if (!value) value = '';

    // Convert value to string
    this._value = value + '';
};

module.exports = FieldString;
