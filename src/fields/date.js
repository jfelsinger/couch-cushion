'use strict';

var Field = require('../field');

function FieldDate() {
    Field.apply(this, arguments);

    // Make sure that the value is set correctly
    if (!this._value)
        this.set(new Date());
}

FieldDate.prototype = Object.create(Field.prototype);
FieldDate.prototype.constructor = FieldDate;

FieldDate.prototype.set = function set(value) {
    this._value = new Date(value);
};

FieldDate.prototype.getValue = function getValue() {
    return this._value.toISOString();
};

module.exports = FieldDate;
