'use strict';

var debug = require('debug')('couch-cushion:fields:object');

var Field = require('../field');


function FieldObject() {
    this.allowOptions('isArray');
    Field.apply(this, arguments);

    if (!this._value) this.set([]);
}

FieldObject.prototype = Object.create(Field.prototype);
FieldObject.prototype.constructor = FieldObject;

/**
 * Returns the actual value so we can manipulate it directly
 */
FieldObject.prototype.object =
FieldObject.prototype.getObject =
function getObject() {
    return this._value;
};

/**
 * Returns this, so that we can have access to all of our functions and such
 */
FieldObject.prototype.get = function get() {
    return this;
};

/**
 * Sets the value, updates any extra properties
 */
FieldObject.prototype.set = function set(value) {
    if (!value || typeof(value) !== 'object')
        throw new Error('attempted to set a non-object-like value on object field');

    if (Array.isArray(value))
        this.options.isArray = true;
    else
        this.options.isArray = false;

    this._value = value;
};


/**
 * Try and save all of the elements of the object
 */
FieldObject.prototype.save = function saveObject(cb, bucket) {
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

    debug('saving field: object', this.getValue());

    return this;
};


FieldObject.prototype.getValue = function getValue(getAll) {
    var results = this.options.isArray ?
        [] :
        {} ;

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


// Create a property for easier dealing with the object
Object.defineProperty(FieldObject.prototype, '_', {
    get: FieldObject.prototype.getObject,
    set: FieldObject.prototype.set
});

module.exports = FieldObject;
