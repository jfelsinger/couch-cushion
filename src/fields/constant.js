'use strict';

var Field = require('../field');

function FieldConstant() {
    Field.apply(this, arguments);

    this.options.readonly = true;
}

FieldConstant.prototype = Object.create(Field.prototype);
FieldConstant.prototype.constructor = FieldConstant;

FieldConstant.prototype.set = function set(value) {
    if (this._value !== undefined) {
        throw new Error('attempted to set value on read-only field');
    }

    this._value = value;
};

module.exports = FieldConstant;
