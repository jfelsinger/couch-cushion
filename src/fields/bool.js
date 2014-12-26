'use strict';

var Field = require('../field');

function FieldBool() {
    Field.apply(this, arguments);
}

FieldBool.prototype = Object.create(Field.prototype);
FieldBool.prototype.constructor = FieldBool;

FieldBool.prototype.set = function set(value) {
    this._value = !!value;
};

module.exports = FieldBool;
