'use strict';

var Field = require('../field');

function FieldDate() {
    Field.apply(this, arguments);
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
