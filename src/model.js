'use strict';
/* jslint latedef:false */

var debug = require('debug')('couch-cushion:model');
var debugSave = require('debug')('couch-cushion:model:save');

/**
 * @class
 */
function Model(options) {
    this.options = {};
    this._name = null;
    this._fields = {};
    this._computed = {};
    this._methods = {};

    debug('constructing');

    if (options) {
        if (typeof(options) !== 'object')
            throw new Error('Attempted to construct model with invalid options parameter');

        this.options = options;

        if (options.name) {
            this._name = options.name + '';
            if (this.options.name) delete this.options.name;
        }
    }

    _initFields(this);

    if (this._fields.id) {
        if (this._name) {
            // If there is a name set, use it for the id
            this._fields.id.set(this._name);
        } else {
            // Else, generate an id and set the name to it.
            var prefix = this._fields.id._prefix;
            if (!prefix && this._fields.type) prefix = this._fields.type.get();
            this._fields.id.generate(prefix);

            this._name = this._fields.id.get();
        }
    }
}

module.exports = Model;

var Fields = require('./fields'),
    Schema = require('./schema');



// Default Schema
Model.prototype.schema = {
    id: 'Id',
    type: 'Constant'
};

/**
 * Define the `name` property, used as the document name to get from the db
 */
Object.defineProperty(Model.prototype, '_id', {
    get: function() {
        if (this._fields.id)
            return this._fields.id.get();

        if (this._name)
            return this._name;
    },
    set: function(val) { this._name = val + ''; }
});


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

    debug('initializing model schema...');

    if (schema instanceof Schema || schema.schema) {
        setSchema(schema.schema, model.cushion);

        if (schema.computed)
            setComputed(schema.computed);

        if (schema.methods)
            setMethods(schema.methods);
    } else {
        // We assume that it is a basic object schema
        setSchema(schema, model.cushion);
    }

    debug('model schema initialized');

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
        debug('initializing schema methods');
        for (var methodName in methods) {
            var method = methods[methodName];
            model._methods[methodName] = method;

            debug('adding method `'+methodName+'` to model: ', model);
            Object.defineProperty(model, methodName, {
                value: method
            });
        }
    }

    function setComputed(computedProperties) {
        debug('initializing schema computed properties');
        for (var name in computedProperties) {
            var computed = computedProperties[name],
                propertyOptions = {
                    get: computed.getter,
                    enumberable: true
                };

            model._computed[name] = computed;

            if (computed.setter)
                propertyOptions.set = computed.setter;

            Object.defineProperty(model, name, propertyOptions);
        }
    }

    function setSchema(schema, cushion) {
        debug('initializing schema fields');
        for (var name in schema) {
            var field = Fields.buildScheme(schema[name], name, cushion);

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
 * @return {Model}
 */
Model.prototype.set =
Model.prototype.primeData =
function(data, cb) {
    if (typeof(data) !== 'object' && typeof(data) !== 'function')
        throw new Error('Invalid parameter `data` given');

    debug('setting model data...');

    cb = cb || function() {
        debug('model data set');
        return true;
    };

    // Just a bunch of potential logging stuff to replace the above
    // if we so desired
    //
    // cb = cb || function(name, value) {
    //     return true;

    //     return function(err, obj, res) {
    //         /*
    //         console.log();
    //         console.log('name: ' + name);
    //         console.log('value: ', value);
    //         console.log('---------------------------------');

    //         console.log(err);
    //         console.log(obj);
    //         console.log(res);
    //         */

    //         return true;
    //     };
    // };

    for (var key in data)
        if (this._fields[key] && this._fields[key] !== undefined &&
          !(this._fields[key] instanceof Fields.constant)) {
            this._fields[key].set(data[key], cb(key, data[key]));
        }

    if (data.id && this._fields.id &&
        this._fields.id instanceof Fields.id) {
        this._name = this._fields.id.get();
    }

    return this;
};

/**
 * Save's the model to the db
 *
 * @param {*} cb
 * @param {*} [db]
 * @returns {*}
 */
Model.prototype.save = function(cb, db) {
    db = db || this.options.adapter;
    if (!db)
        return cb(new Error('No available adapter'));

    // Update the updated date
    if (this._fields.updated)
        this._fields.updated.set(new Date());

    // Save all of the fields that support saving themselves
    var saves = [];
    for (var key in this._fields)
        if (this._fields[key].save && typeof(this._fields[key].save) === 'function')
            saves.push(this._fields[key].save.bind(this));

    require('async').each(saves, function(save, cb) {
        save(cb, db);
    }, (function (err) {
        if (err) return cb(err);

        debugSave('saving model: ' + this._id + ' \r\n', this.getValue());

        if (!db) { return cb(new Error('Database has gone missing')); }

        // Start the save
        db.save(this._id, this.getValue(), cb);

    }).bind(this));

    return this;
};

/**
 * Get a value representative of the entire model
 *
 * @param {boolean} getAll - whether or not to return full objects
 * @param {boolean} asJson - whether or not to return a json string
 * @param {boolean} withComputed - whether or not to include computed props
 * @param {boolean} withMethods - whether or not to include schema methods
 * @returns {*}
 */
Model.prototype.getValue = function(getAll, asJson, withComputed, withMethods) {
    var key;
    var result = {};

    if (withComputed)
        for (key in this._computed) {
            var computed = this._computed[key];
            if (computed.setter)
                Object.defineProperty(result, key, {
                    enumerable: true,
                    get: computed.getter,
                    set: computed.setter,
                });
            else
                Object.defineProperty(result, key, {
                    enumerable: true,
                    get: computed.getter,
                });
        }

    if (withMethods)
        for (key in this._methods)
            Object.defineProperty(result, key, {
                value: this._methods[key]
            });

    // This adds all of the fields and their values to the result, which will
    // then go to the db. Question:
    //
    // We don't have to, but should we include fields that have a non-set or
    // falsy values? undefined, null, and '' are all pretty much equvalent to no
    // value being there at all. We could save some space by filtering out these
    // values when saving to the db.
    //
    // pros:
    //  - saves space
    // cons:
    //  - might cause issues with implementations on other systems
    //  - logic to filter out the values might slow things down
    //      if (value != false || value === false)
    for (key in this._fields)
        try {
            result[key] = this._fields[key].getValue(getAll);
        } catch(e) {
            debug('error on field, %s : %s', key, this._fields[key]._value, this);
            throw e;
        }

    if (asJson) result = JSON.stringify(result);

    return result;
};
