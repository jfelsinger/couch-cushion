'use strict';

var debug = require('debug')('couch-cushion');
var async = require('async');

/**
 * An ODM class for modeling data
 *
 * @class
 */
function CouchCushion() {
    this._plugins = {};
    this._adapter = {};
    this._models = {};
    this._plugins = {};
    this.options = {};
}

module.exports = exports = CouchCushion;

var Model = require('./model'),
    Schema = require('./schema');


// Expose the schema class
CouchCushion.prototype.Schema = Schema;
CouchCushion.prototype._Model = Model;

// Expose the rdapter object that we use
Object.defineProperty(CouchCushion.prototype, 'Db', {
    get: function() { return this._adapter; }
});




/**
 * Install a database adapter for use
 */
CouchCushion.prototype.install =
CouchCushion.prototype.installAdapter =
function installAdapter(installer, options) {
    installer.install(this, options);

    return this;
};


CouchCushion.prototype.connect =
function connect() {
    if (this._adapter && this._adapter.connect)
        this._adapter.connect.apply(this._adapter, arguments);
    else
        throw new Error('No adapter installed that can be connected to');

    return this;
};


/**
 * Sets or gets an option
 *
 * @param {string} option
 * @param {*} [value]
 * @returns {*}
 */
CouchCushion.prototype.getOption =
CouchCushion.prototype.setOption =
function(option, value) {
    if (arguments.length === 2) {
        debug('setting option: ' + option + ' = ' + value);

        this.options[option] = value;

        return this;

    } else {
        debug('getting option: ' + option);

        return this.options[option];
    }
};


/**
 * Create a model that can be used, or return a model
 *
 * @param {string} name
 * @param {Object|Schema} [schema]
 * @returns {Model}
 */
CouchCushion.prototype.ref =
CouchCushion.prototype.reference =
CouchCushion.prototype.model =
function buildModel(name, schema, override) {

    // If the schema was supplied, that means we /should/ be adding a new model
    // to the list.
    if (schema) {
        debug('creating model: ' + name);

        if (this._models[name] && !override)
            throw new Error('attempted to create already existing model: `'+name+'`');

        // Create the model, extending the base model class while doing so.

        var model;

        // We're using eval here to make it easier to debug.
        /* jslint evil:true */
        eval('model = function ' + name + '() { Model.apply(this, arguments); }');

        model.prototype = Object.create(Model.prototype);
        model.prototype.constructor = model;
        model.prototype.cushion = this;

        // TODO: validate the schema before applying it
        model.prototype.schema = schema;

        this._models[name] = model;
    }

    // Make sure the model exists
    if (!this._models[name])
        throw new Error('attempted to get non-existent model: `'+name+'`');

    debug('returning model: ' + name);
    return this._models[name];
};


/**
 * Gets a model from the model list
 *
 * @param {Model|string} model
 * @returns {Model}
 */
CouchCushion.prototype.getModel = function(model) {
    var result;

    if (typeof(model) === 'function' &&
        this._models[model.name])
    {
        result = model;
    } else {
        result = this._models[model];
    }

    return result;
};


function getResults(response) {
    var value = response;

    if (value) {
        if (value.rows)
            return getResults(value.rows);

        if (value.value)
            return getResults(value.value);
    }

    return value;
}

function getOneResult(response) {
    var value = getResults(response);

    if (Array.isArray(value))
        return getOneResult(value[0]);

    return value;
}


/**
 * Get a reference document
 *
 */
CouchCushion.prototype.getReference =
CouchCushion.prototype.getRef =
function(name, reference, cb, db) {
    db = db || this._adapter;
    var Ref = this.getModel(reference);

    // If it has a type, use that, else assume that it is a string
    reference = new Ref({ name: name });

    debug('getting reference:  ' + name);
    db.get(name, function(err, res) {
        if (err) return cb(err, reference, res);

        reference.set(getOneResult(res));

        debug('received reference: ' + name);
        cb(err, reference, res);
    });

    return this;
};


/**
 * Get a document
 *
 * @param {string} id
 * @param {*} cb
 * @param {Model|string} model - The model type that will be returned
 * @param {*} adapter
 * @returns {CouchCushion}
 */
CouchCushion.prototype.get = function(id, cb, model, db) {
    db = db || this._adapter;
    var self = this,
        Model;

    if (model)
        Model = this.getModel(model);

    debug('getting doc:  ' + id);
    try {
        db.get(id, function(err, res) {
            if (err) return cb(err, null, res);

            if (!Model && res.value && res.value.type) {
                Model = self.getModel(res.value.type.capitalize(true));
            }

            if (Model) {
                model = new Model({ name: id });
                model.set(res.value);
            } else {
                err = 'could not get model';
            }

            debug('received doc: ' + id);
            cb(err, model, res);
        });
    }
    catch (e) {
        cb(e);
    }

    return this;
};


/**
 * Save a document/model to the database
 *
 * @param {Model}
 * @param {*} [cb]
 * @param {*} [adapter]
 * @returns {CouchCushion}
 */
CouchCushion.prototype.save = function(docs, cb, db) {
    db = db || this._adapter;

    if (!Array.isArray(docs))
        docs = [docs];

    // create a series of requests to save all of the supplied documents
    var requests = [];
    docs.forEach(function(doc) {
        if (doc && doc.save)
            requests.push(function(cb) {
                debug('saving:       ' + doc && doc.id);
                doc.save(cb, db);
            });
        else
            cb(new Error('invalid document supplied'));
    });

    // Run through and try to asynchronously run all the save requests
    async.each(requests, function(req, cb) {
        req(cb);
    }, function(err) {
        if (err) { debug('saving failed'); }
        else { debug('save complete'); }
        cb(err);
    });

    return this;
};
