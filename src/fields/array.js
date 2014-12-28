'use strict';

var Field = require('../field');


function FieldArray() {
    this.allowOptions('isObject');
    Field.apply(this, arguments);


}

FieldArray.prototype = Object.create(Field.prototype);
FieldArray.prototype.constructor = FieldArray;

FieldArray.prototype._ = 
FieldArray.prototype.array = 
FieldArray.prototype.getArray = 
function getArray() {
    return this._value;
};

FieldArray.prototype.get = function get() {
    return this;
};

FieldArray.prototype.set = function set(value) {
    if (!value || typeof(value) !== 'object')
        throw new Error('attempted to set a non-array-like value on array field');

    if (Array.isArray(value))
        this.options.isObject = false;
    else
        this.options.isObject = true;

    this._value = value;
};


FieldArray.prototype.save = function saveArray() {
    for (var key in this._value) {
        var value = this._value[key];
        if (value.save && typeof(value.save) === 'function')
            value.save();
    }

    return this;
};


FieldArray.prototype.getValue = function getValue(getAll) {
    var results = this.options.isObject ?
        {} :
        [] ;

    for (var key in this._value) {
        var value = this._value[key];

        if (value.getValue)
            results[key] = (value.getValue(getAll));
        else
            results[key] = (value);
    }

    return results;
};



module.exports = FieldArray;
