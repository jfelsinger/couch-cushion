'use strict';

var Couchbase = require('couchbase');

var Model = require('./model');

function CouchCushion() {
    this._models = {};
    this.options = {};

}


CouchCushion.prototype.connect = function connect(options) {
    if (typeof(options.host) !== 'string' ||
        typeof(options.bucket) !== 'string')
        throw new Error('invalid options given for connection');

    var cluster = new Couchbase.Cluster(options.host);
    var bucket = options.bucketPassword ?
        cluster.openBucket(options.bucket, options.bucketPassword) :
        cluster.openBucket(options.bucket);

    this.options.cluster = cluster;
    this.options.bucket = bucket;

    return this;
};


CouchCushion.prototype.getOption =
CouchCushion.prototype.setOption = function(option, value) {
    if (arguments.length === 2) {

        this.options[option] = value;

        return this;

    } else {

        return this.options[option];

    }
};


/**
 * Create a model that can be used
 */
CouchCushion.prototype.model = function buildModel(name, schema) {

    // If the schema was supplied, that means we /should/ be adding a new model
    // to the list.
    if (schema) {
        if (this._models[name])
            throw new Error('attempted to create already existing model: `'+name+'`');

        // Create the model, extending the base model class while doing so.
        
        var model;

        // We're using eval here to make it easier to debug.
        /* jslint evil:true */
        eval('model = function ' + name + '() { Model.apply(this, arguments); }');

        model.prototype = Object.create(Model.prototype);
        model.prototype.constructor = model;

        // TODO: validate the schema before applying it
        model.prototype.schema = schema;

        this._models[name] = model;
    }

    // Make sure the model exists
    if (!this._models[name])
        throw new Error('attempted to get non-existent model: `'+name+'`');

    return this._models[name];
};


CouchCushion.prototype.save = function(docs, cb, bucket) {
    bucket = bucket || this.options.bucket;

    if (!Array.isArray(docs))
        docs = [docs];

    for (var i = 0; i < docs.length; i++) {
        docs[i].save(cb, bucket);
    }

    return this;
};


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


CouchCushion.prototype.get = function(model, cb, id, bucket) {
    bucket = bucket || this.options.bucket;
    var Model = this.getModel(model);

    bucket.get(id, function(err, res) {
        if (err) {
            cb(err, null, res);
            return;
        }

        var model = new Model();
        model.set(res.value);

        cb(err, model, res);
    });
};

CouchCushion.prototype.getOne = function(model, cb, search, key, doc, bucket) {
    if (search instanceof Couchbase.ViewQuery || 
       (search.keys && search.key && search.from)) {

        return this.oneFromQuery(model, cb, search, bucket);

    } else {

        return this.oneFromView(model, cb, search, key, doc, bucket);

    }
};

CouchCushion.prototype.getMany = function(model, cb, search, key, doc, bucket) {
    if (search instanceof Couchbase.ViewQuery || 
       (search.keys && search.key && search.from)) {

        return this.fromQuery(model, cb, search, bucket);

    } else {

        return this.fromView(model, cb, search, key, doc, bucket);

    }
};


// Query

CouchCushion.prototype.fromQuery = function(model, cb, query, bucket) {
    bucket = bucket || this.options.bucket;
    var Model = this.getModel(model);

    bucket.query(query, function(err, res) {
        if (err) return cb(err, null, res);
        var models = [];

        if (res && res.rows) {
            for (var i = 0; i < res.rows.length; i++) {
                var resultModel = new Model({ bucket: bucket });
                resultModel.set(res.rows[i].value);
                models.push(resultModel);
            }
        }

        cb(err, models, res);
    });

    return this;
};

CouchCushion.prototype.oneFromQuery = function(model, cb, query, bucket) {
    bucket = bucket || this.options.bucket;
    var Model = this.getModel(model);

    bucket.query(query, function(err, res) {
        if (err) return cb(err, null, res);

        if (res && res.rows && res.rows.length) {
            var resultModel = new Model({ bucket: bucket });
            resultModel.set(res.rows[0].value);

            cb(err, resultModel, res);
        }
    });

    return this;
};


// Views

function buildViewQuery(view, key, doc) {
    if (!doc) {
        // Get the document name
    }

    var query = Couchbase.ViewQuery.from(doc, view);

    if (Array.isArray(key))
        query = query.keys(key);
    else if (key.id)
        query = query.key(key.id);
    else if (key._fields && key._fields.id)
        query = query.key(key._fields.id.get());
    else
        query = query.key(key);

    return query;
}

CouchCushion.prototype.fromView = function(model, cb, view, key, doc, bucket) {
    var query = buildViewQuery(view, key, doc);
    return this.fromQuery(model, cb, query, bucket);
};

CouchCushion.prototype.oneFromView = function(model, cb, view, key, doc, bucket) {
    var query = buildViewQuery(view, key, doc);
    return this.oneFromQuery(model, cb, query, bucket);
};





module.exports = exports = new CouchCushion();
