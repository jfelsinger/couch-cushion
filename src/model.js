'use strict';
/* jslint latedef:false */

var Fields = require('./fields');

function Model(options) {
    this.options = {};
    this._fields = {};

    if (options && typeof(options) !== 'object')
        throw new Error('Attempted to construct model with invalid options parameter');
    else
        this.options = options;

    if (options) {

        if (options.bucket) this.options.bucket = options.bucket;

    }

    _initFields(this);

    this._fields.id.generate(this._fields.type.get());
}

// Default Schema
Model.prototype.schema = {
    id: 'Id',
    type: 'Constant'
};


/**
 * Construct a fields array from the object's schema
 *
 * Fields are defined in two ways:
 * fieldName: 'Type'
 * fieldName: { field: 'Type', value: 'defaultValue, otherOption: true }
 *
 * @return mixed
 */
function _initFields(model) {
    var get = function(name) {
        return function getter() {
            return this._fields[name].get();
        };
    };

    var set = function(name) {
        return function setter(value) {
            this._fields[name].set(value);
        };
    };

    for (var name in model.schema) {
        var field = Fields.buildScheme(model.schema[name], name);
        model._fields[name] = field;

        Object.defineProperty(model, name, {
            get: get(name),
            set: set(name)
        });
    }
}


/**
 * Prime the field data from an object containing all the data values to set
 *
 * { fieldName: 'value' }
 *
 * @return this
 */
Model.prototype.set = 
Model.prototype.primeData = 
function(data) {
    if (typeof(data) !== 'object' && typeof(data) !== 'function')
        throw new Error('Invalid parameter `data` given');

    for (var key in data)
        if (this._fields[key] && 
           (this._fields[key] === undefined || !(this._fields[key] instanceof Fields.constant))) {
            this._fields[key].set(data[key]);
        }

    return this;
};

Model.prototype.save = function(cb, bucket) {
    bucket = bucket || this.options.bucket;

    // Update the updated date
    if (this._fields.updated)
        this._fields.updated.set(new Date());

    for (var key in this._fields)
        if (this._fields[key] instanceof Fields.object)
            this._fields[key].save();

    bucket.upsert(this._fields.id.get,this.getValue, cb);
    return this;
};

Model.prototype.getValue = function(getAll, asJson) {
    var result = {};

    for (var key in this._fields)
        result[key] = this._fields[key].getValue(getAll);

    if (asJson) result = JSON.stringify(result);

    return result;
};



module.exports = Model;
