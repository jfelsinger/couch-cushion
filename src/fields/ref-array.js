'use strict';

var debug = require('debug')('couch-cushion:fields:ref-array');

var Field = require('../field'),
    fieldHelper = require('./index'),
    async = require('async'),
    cushion;

function FieldRefArray(options, value, _cushion) {
    Field.apply(this, arguments);

    this._referenceScheme = undefined;
    this._model = undefined;

    cushion = _cushion || require('../..');

    if (options) {

        if (options.modelType) this.setModelType(options.modelType);
        if (options.referenceScheme)
            this._referenceScheme = options.referenceScheme;
    }

    if (!this._value) this.set([]);
}

FieldRefArray.prototype = Object.create(Field.prototype);
FieldRefArray.prototype.constructor = FieldRefArray;

/**
 * Returns the actual value so we can manipulate it directly
 */
FieldRefArray.prototype.object =
FieldRefArray.prototype.getObject =
FieldRefArray.prototype.array =
FieldRefArray.prototype.getArray =
function getArray() {
    return this._value;
};

/**
 * Returns this, so that we have access to all of our helper functions and such
 */
FieldRefArray.prototype.get = function get() {
    return this;
};

/**
 * Sets the value
 */
FieldRefArray.prototype.set = function set(value) {
    if (!Array.isArray(value))
        throw new Error('attempted to set a non-array value on reference-array field');

    // Just do this for now, not sure if we need the below
    this._value = value;

    // // Make sure we have an empty array to work with
    // if (!this._value) this._value = [];

    // while(value.length) this.push(value.shift());
};

/**
 * get the model that is set for the array, if there is one
 */
FieldRefArray.prototype.getModelType = function() {
    return cushion.getModel(this._model);
};

/**
 * Try to set the type of model the field represents an array of
 */
FieldRefArray.prototype.setModelType = function(value) {
    if (this._model)
        throw new Error('attempted to change model type on model field');

    var RequestModel = cushion.getModel(value);

    if (!RequestModel) throw new Error('model type not found');

    this._model = RequestModel;
    return this;
};


FieldRefArray.prototype.load =
function load(cb) {
    this.loadSlice(cb);
};

FieldRefArray.prototype.loadSlice =
function loadSlice() {
    var self = this;
    var cb = arguments[arguments.length - 1];
    var slice;

    if (arguments.length === 2)
        slice = this._value.slice(arguments[0]);
    else if (arguments.length === 3)
        slice = this._value.slice(arguments[0], arguments[1]);
    else
        slice = this._value.slice();

    var requests = [];

    slice.forEach(function(val, index) {
        if (val && val.load && typeof(val.load === 'function'))
            requests.push(val.load.bind(val));

        // If all we've been given is a string, and their is a model set, we
        // can assume the string is an id, and load the model based on it
        else if (typeof(val) === 'string' && self._model) {
            requests.push(function(cb) {
                cushion.get(val, function(err, model, res) {
                    if (!err) self._value[index] = model;
                    cb(err, model, res);
                }, self._model, self.options.bucket);
            });
        }
    });

    //
    // NOTE:
    // This will load models that are already created and set,
    // but it doesn't specify and create new models like expected.
    // If this is a model field of some sort, the base model that
    // is going to be used needs to be supplied, probably in the
    // schema.
    //

    async.parallel(requests, function(err) {
        cb(err, slice);
    });
};


FieldRefArray.prototype.save = function saveArray(cb, db) {
    var saves = [];

    this._value.forEach(function(row) {
        if (row && row.save && typeof(row.save) === 'function')
            saves.push(row.save.bind(row));
    });

    async.each(saves, function(save, cb) {
        save(cb, db);
    }, function (err) {
        if (cb && typeof(cb) === 'function') cb(err);
    });

    debug('saving field: ref array', this.getValue());

    return this;
};

FieldRefArray.prototype.getValue = function getValue() {
    var args = arguments;

    return this._value.map(function(row, index) {
        // var value = row;

        var field = fieldHelper.buildScheme(this._referenceScheme, index, cushion);
        field.set(row);

        return field.getValue.apply(field, args);

        // It's a model that has a getInline function defined, use that
        // if (row && typeof(row.getInline === 'function')
        //     value = row.getInline();

        // It's itself a model, might as well
    }.bind(this));
};


// Proxy a number of Array.prototype functions to our field
[
    'push', 'pop', 'shift', 'unshift',
    'concat', 'every', 'filter', 'forEach',
    'indexOf', 'join', 'lastIndexOf', 'map',
    'reduce', 'reduceRight', 'reverse',
    'shift', 'slice', 'some', 'sort', 'splice',
].forEach(function(func) {
    if (Array.prototype[func])
        FieldRefArray.prototype[func] = function() {
            // return Array.prototype[funcs[i]].apply(this._value, arguments);
            return Array.prototype[func].apply(this._value, arguments);
        };
});


Object.defineProperty(FieldRefArray.prototype, 'length', {
    get: function() {
        return this._value.length;
    }
});


// Create a property for easier dealing with the array
Object.defineProperty(FieldRefArray.prototype, '_', {
    get: FieldRefArray.prototype.getObject,
    set: FieldRefArray.prototype.set
});


module.exports = FieldRefArray;
