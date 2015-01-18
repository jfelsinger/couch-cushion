'use strict';

var Field = require('../field');

function FieldString() {
    Field.apply(this, arguments);
}

FieldString.prototype = Object.create(Field.prototype);
FieldString.prototype.constructor = FieldString;

FieldString.prototype.set = function(value) {
    
    // Try and convert any non-string types
    if (typeof(value) !== 'string') {
        // Convert falsy values to an empty string, but preserve numerics
        if (!value && value !== 0) value = '';

        // Convert values to a string type
        value += '';
    }

    // Convert value to string
    this._value = value;
};

module.exports = FieldString;
