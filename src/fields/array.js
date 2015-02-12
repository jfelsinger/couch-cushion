'use strict';

var debug = require('debug')('couch-cushion:fields:array');

var Field = require('../field');


function FieldArray() {
    this.allowOptions('isObject');
    Field.apply(this, arguments);

    if (!this._value) this.set([]);
}

FieldArray.prototype = Object.create(Field.prototype);
FieldArray.prototype.constructor = FieldArray;

/**
 * Returns the actual value so we can manipulate it directly
 */
FieldArray.prototype.array = 
FieldArray.prototype.getArray = 
function getArray() {
    return this._value;
};

/**
 * Returns this, so that we can have access to all of our functions and such
 */
FieldArray.prototype.get = function get() {
    return this;
};

/**
 * Sets the value, updates any extra properties
 */
FieldArray.prototype.set = function set(value) {
    if (!value || typeof(value) !== 'object')
        throw new Error('attempted to set a non-array-like value on array field');

    if (Array.isArray(value))
        this.options.isObject = false;
    else
        this.options.isObject = true;

    this._value = value;
};


/**
 * Try and save all of the elements of the array
 */
FieldArray.prototype.save = function saveArray(cb, bucket) {
    var saves = [];
    for (var key in this._value) {
        var value = this._value[key];
        if (value && value.save && typeof(value.save) === 'function')
            saves.push(value.save.bind(value));
    }

    require('async').each(saves, function(save, cb) {
        save(cb, bucket);
    }, function (err) {
        if (cb && typeof(cb) === 'function') cb(err);
    });

    debug('saving field: array', this.getValue());

    return this;
};


FieldArray.prototype.getValue = function getValue(getAll) {
    var results = this.options.isObject ?
        {} :
        [] ;

    for (var key in this._value) {
        var value = this._value[key];

        if (value && typeof(value.getInline) === 'function')
            results[key] = value.getInline();
        else if (value && typeof(value.getValue) === 'function')
            results[key] = (value.getValue(getAll));
        else
            results[key] = (value);
    }

    return results;
};


// Create a property for easier dealing with the array
Object.defineProperty(FieldArray.prototype, '_', {
    get: FieldArray.prototype.getArray,
    set: FieldArray.prototype.set
});

module.exports = FieldArray;
