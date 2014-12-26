'use strict';

var Field = require('../field');


function FieldArray() {
    Field.apply(this, arguments);
}

FieldArray.prototype = Object.create(Field.prototype);
FieldArray.prototype.constructor = FieldArray;

module.exports = FieldArray;
