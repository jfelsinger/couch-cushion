'use strict';

require('../../lib/capitalize');

var Field = require('../field'),
    Model = require('../model'),
    cushion;

/**
 * Represents an model or sub-model on a document
 *
 * @class
 */
function FieldModel(options, value, _cushion) {
    Field.apply(this, arguments);

    this._isInitialized = false;
    this._isLoaded = false;
    this._isInline = false;
    this._model = undefined;

    cushion = _cushion || require('couch-cushion');

    if (options) {

        if (options.modelType) this.setModelType(options.modelType);
        if (options.inline) this._isInline = !!options.inline;

    }
}

FieldModel.prototype = Object.create(Field.prototype);
FieldModel.prototype.constructor = FieldModel;

module.exports = FieldModel;



/**
 * Returns either a full model, or just an id based on the value of getAll
 */
FieldModel.prototype.getValue = function(getAll, inline) {
    if (!this._isLoaded)
        return this._value;

    // By default just supply an id as a value for the model
    var result = this._value.id;

    // Get the entire model if it is requests
    if (getAll)
        result = this._value.getValue(getAll);

    // Else, see about giving the value as an inline value
    else if ((this._isInline || inline) && this._value.getInline)
        result = this._value.getInline();

    return result;
};


/**
 * Save the represented model
 */
FieldModel.prototype.save = function(cb, bucket) {
    if (this._isLoaded && this._value)
        this._value.save(cb, bucket);
    else if (cb && typeof(cb) === 'function')
        cb();

    return this;
};


/**
 * Get the model type that is currently being represented
 */
FieldModel.prototype.getModelType = function() {
    return cushion.getModel(this._model);
};

/**
 * Try to set the type of model the field represents, if it hasn't already been
 * set
 */
FieldModel.prototype.setModelType = function(value) {
    if (this._isInitialized)
        throw new Error('attempted to set model type on already initialized model field');
    if (this._model)
        throw new Error('attempted to change model type on model field');

    var RequestModel = cushion.getModel(value);

    if (!RequestModel)
        throw new Error('model type not found');

    this._model = RequestModel;
    this._isInitialized = true;

    return this;
};


FieldModel.prototype.get = function getter() {
    return this;
};

/**
 * Load the full model from the db
 */
FieldModel.prototype.load = function load(cb, id) {
    if (!this._isLoaded) {
        var self = this;

        // Do your best to get a working id. You can do it!
        //
        // a. use a supplied id,
        // b. else use the id of an inline-like model
        // c. else just use the value (hopefully it's an id)
        id = id || this._value && this._value.id || this._value;

        cushion.get(this._value, function(err, model, res) {
            if (err) { return cb(err, model, res); }

            self.set(model, cb);

        }, this._model, this.options.bucket);
    }

    return this;
};

/**
 * Try and set the field, by evaluating the type of value that is given
 *
 * A cb can be used, and will be called when the initialization is complete
 */
FieldModel.prototype.set = function setter(value, cb) {
    var err;

    if (!this._isInitialized) {

        if (value && typeof(value) === 'function') {
            // assume that it's an uninitizlied model

            this.setModelType(value);
            /* jslint -W055 */
            this._value = new value();
            /* jslint +W055 */
            this._isInitialized = true;
            this._isLoaded = true;

            if (cb && typeof(cb) === 'function') cb(err, this);

        } else if (value && typeof(value) === 'object' && value.type) {

            if (!(value instanceof Model)) {
                // It's an model full of values to be set, get a model from it

                var ResultModel = cushion.getModel(value.type.capitalize());
                var model = new ResultModel();
                model.set(value);

                value = model;
            }

            // else:
            // an already initialized model is ready to be set

            this.setModelType(value.type.capitalize());
            this._value = value;
            this._isInitialized = true;
            this._isLoaded = true;
            if (cb && typeof(cb) === 'function') cb(err, this);

        } else if (value && typeof(value) === 'object' && value.id) {

            // Assume that it's a type of inline model
            this._value = value;
            if (cb && typeof(cb) === 'function') cb(err, this);

        } else if (value && typeof(value) === 'string') {

            // Assume the value is an id, try to work from there
            this._value = value;
            if (cb && typeof(cb) === 'function') cb(err, this);

        } else if (!value) {

            // Trying to set a falsey value, assume that it just isn't set
            if (cb && typeof(cb) === 'function') cb(err, this);

        } else {

            // Trying to set some type of invalid value
            err = new Error('value can not be used to generate a new model on an un-initialized moden field');
            if (!cb || typeof(cb) !== 'function' || cb(err, this) != true)
                throw err;

        }

    } else {

        if (value instanceof this._model) {

            // It's an actual model, set it
            this._value = value;
            this._isLoaded = true;
            if (cb && typeof(cb) === 'function') cb(err, this);

        } else if (typeof(value) === 'object') {

            // It's model data, create a new model and set it
            this._value = new this._model();
            this._value.set(value);
            this._isLoaded = true;
            if (cb && typeof(cb) === 'function') cb(err, this);

        } else if (typeof(value) === 'string') {
            // It's an id
            this._value = value;
            this._isLoaded = false;
            if (cb && typeof(cb) === 'function') cb(err, this);

        } else {
            err = new Error('attempted to set invalid value on model field');
            if (!cb || typeof(cb) !== 'function' || cb(err, this) != true)
                throw err;
        }

    }

    return this;
};


// Create a property for easier dealing with the array
Object.defineProperty(FieldModel.prototype, '_', {
    get: function() { return this._value; },
    set: FieldModel.prototype.set
});
