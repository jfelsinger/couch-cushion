'use strict';
/* jslint latedef:false */

var Fields = require('./fields'),
    Schema = require('./schema');

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
    var schema = model.schema;

    if (schema instanceof Schema || schema.schema) {
        setSchema(schema.schema);

        if (schema.computed)
            setComputed(schema.computed);

        if (schema.methods)
            setMethods(schema.methods);
    } else {
        // Se assume that it is a basic object schema
        setSchema(schema);
    }

    function get(name) {
        return function getter() {
            return this._fields[name].get();
        };
    }

    function set(name) {
        return function setter(value) {
            this._fields[name].set(value);
        };
    }

    function setMethods(methods) {
        for (var methodName in methods) {
            var method = methods[methodName];
            model._methods[methodName] = method;

            Object.defineProperty(model, methodName, {
                value: method
            });
        }
    }

    function setComputed(computedProperties) {
        for (var name in computedProperties) {
            var computed = computedProperties[name];
            model._computed[name] = computed;

            if (computed.setter) {
                Object.defineProperty(model, name, {
                    get: computed.getter,
                    set: computed.setter,
                    enumerable: true
                });
            } else {
                Object.defineProperty(model, name, {
                    get: computed.getter,
                    enumerable: true
                });
            }
        }
    }

    function setSchema(schema) {
        for (var name in schema) {
            var field = Fields.buildScheme(schema[name], name);
            model._fields[name] = field;

            Object.defineProperty(model, name, {
                get: get(name),
                set: set(name),
                enumerable: true
            });
        }
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
        if (this._fields[key].save && typeof(this._fields[key].save) === 'function')
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
