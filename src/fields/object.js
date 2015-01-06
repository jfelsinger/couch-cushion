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
function FieldObject(options, value, _cushion) {
    Field.apply(this, arguments);

    this._isInitialized = false;
    this._isLoaded = false;
    this._model = undefined;

    cushion = _cushion || require('couch-cushion');

    if (options) {

        if (options.modelType) this.setModelType(options.modelType);

    }
}

FieldObject.prototype = Object.create(Field.prototype);
FieldObject.prototype.constructor = FieldObject;

module.exports = FieldObject;



/**
 * Returns either a full object, or just an id based on the value of getAll
 */
FieldObject.prototype.getValue = function(getAll) {
    if (!this._isLoaded)
        return this._value;

    return getAll ?
        this._value.getValue(getAll) :
        this._value.id;
};


/**
 * Save the represented model
 */
FieldObject.prototype.save = function(cb, bucket) {
    if (this._isLoaded && this._value)
        this._value.save(cb, bucket);
    else if (cb && typeof(cb) === 'function')
        cb();

    return this;
};


/**
 * Get the model type that is currently being represented
 */
FieldObject.prototype.getModelType = function() {
    return cushion.getModel(this._model);
};

/**
 * Try to set the type of model the field represents, if it hasn't already been
 * set
 */
FieldObject.prototype.setModelType = function(value) {
    if (this._isInitialized)
        throw new Error('attempted to set model type on already initialized object field');
    if (this._model)
        throw new Error('attempted to change model type on object field');

    var RequestModel = cushion.getModel(value);

    if (!RequestModel)
        throw new Error('model type not found');

    this._model = RequestModel;
    this._isInitialized = true;

    return this;
};


FieldObject.prototype.get = function getter() {
    return this;
};

FieldObject.prototype.load = function load(cb, id) {
    if (!this._isLoaded) {
        var self = this;
        id = id || this._value;

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
FieldObject.prototype.set = function setter(value, cb) {
    var self = this;
    var err;

    // Why in the world do I have to do this? I don't have the slightest clue,
    // but it must be done... for now.
    // cushion = require('couch-cushion');
    // Model = require('../model');

    if (!this._isInitialized) {

        if (value && typeof(value) === 'function') {
            // assume that it's an uninitizlied model

            this.setModelType(value);
            /* jslint -W055 */
            this._value = new value();
            /* jslint +W055 */
            this._isInitialized = true;
            this._isLoaded = true;

            if (cb && typeof(cb) === 'function') cb(null, this);

        } else if (value && typeof(value) === 'object' && value.type) {

            if (!(value instanceof Model)) {
                // It's an object full of values to be set, get a model from it

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
            if (cb && typeof(cb) === 'function') cb(null, this);

        } else if (value && typeof(value) === 'string') {
            
            // Assume the value is an id, try to work from there
            this._value = value;
            if (cb && typeof(cb) === 'function') cb(null, this);

        } else {
            err = new Error('value can not be used to generate a new object on an un-initialized object field');
            if (!cb || typeof(cb) !== 'function' || cb(err, this) != true)
                throw err;
        }

    } else {

        if (value instanceof this._model) {

            // It's an actual model, set it
            this._value = value;
            this._isLoaded = true;
            if (cb && typeof(cb) === 'function') cb(null, this);

        } else if (typeof(value) === 'object') {

            // It's model data, create a new model and set it
            this._value = new this._model();
            this._value.set(value);
            this._isLoaded = true;
            if (cb && typeof(cb) === 'function') cb(null, this);

        } else if (typeof(value) === 'string') {
            // It's an id
            this._value = value;
            this._isLoaded = false;
            if (cb && typeof(cb) === 'function') cb(null, this);

        } else {
            err = new Error('attempted to set invalid value on object field');
            if (!cb || typeof(cb) !== 'function' || cb(err, this) != true)
                throw err;
        }

    }

    return this;
};
