'use strict';

var Field = require('../field');

function FieldNumber() {
    Field.apply(this, arguments);
}

FieldNumber.prototype = Object.create(Field.prototype);
FieldNumber.prototype.constructor = FieldNumber;

FieldNumber.prototype.set = function set(value) {
    if (isNaN(value))
        throw new Error('attempted to set non-numeric value on property ' + this.options.name);

    // Convert value to number
    this._value = value * 1;
};

module.exports = FieldNumber;
