'use strict';

var debug = require('debug')('couch-cushion');

var Couchbase = require('couchbase'),
    async = require('async');

/**
 * An ODM class for communicating with Couchbase
 *
 * @class
 */
function CouchCushion() {
    this._models = {};
    this._refmodels = {};
    this.options = {};

}

module.exports = exports = new CouchCushion();

var Model = require('./model'),
    Reference = require('./reference'),
    Schema = require('./schema');



// Expose the schema class
CouchCushion.prototype.Schema = Schema; 


/**
 * Connect to a Couchbase cluster and specified bucket
 *
 * @param {{host: string, bucket: string, bucketPassword: string}} options
 * @returns {CouchCushion}
 */
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


/**
 * Sets or gets an option
 *
 * @param {string} option
 * @param {*} [value]
 * @returns {*}
 */
CouchCushion.prototype.getOption =
CouchCushion.prototype.setOption = function(option, value) {
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
 * Create a reference model
 *
 * @param {*} type - the document type that will be referenced
 * @param {Model|string} reference - the type of reference
 * @returns {Model}
 */
CouchCushion.prototype.ref = 
CouchCushion.prototype.reference = 
function buildReference(name, schema, override) {
    // If the schema was supplied, that means we /should/ be adding a new model
    // to the list.
    if (schema) {
        debug('creating reference model: ' + name);

        if (this._refmodels[name] && !override)
            throw new Error('attempted to create already existing reference type: `'+name+'`');

        // Create the model, extending the base model class while doing so.
        
        var ref;

        // We're using eval here to make it easier to debug.
        /* jslint evil:true */
        eval('ref = function ' + name + '() { Reference.apply(this, arguments); }');

        ref.prototype = Object.create(Reference.prototype);
        ref.prototype.constructor = ref;
        ref.prototype.cushion = this;

        // TODO: validate the schema before applying it
        ref.prototype.schema = schema;

        this._refmodels[name] = ref;
    }

    // Make sure the model exists
    if (!this._refmodels[name])
        throw new Error('attempted to get non-existent model: `'+name+'`');

    debug('returning reference model: ' + name);
    return this._refmodels[name];
};


/**
 * Create a model that can be used, or return a model
 *
 * @param {string} name
 * @param {Object|Schema} [schema]
 * @returns {Model}
 */
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
 * Save a document/model to the database
 *
 * @param {Model}
 * @param {*} [cb]
 * @param {*} [bucket]
 * @returns {CouchCushion}
 */
CouchCushion.prototype.save = function(docs, cb, bucket) {
    bucket = bucket || this.options.bucket;

    if (!Array.isArray(docs))
        docs = [docs];

    // create a series of requests to save all of the supplied documents
    var requests = [];
    docs.forEach(function(doc) {
        if (doc && doc.save)
            requests.push(function(cb) {
                debug('saving:       ' + doc && doc.id);
                doc.save(cb, bucket);
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


/**
 * Gets a ref from the reference list
 *
 * @param {Reference|string} ref
 * @returns {Reference}
 */
CouchCushion.prototype.getReferenceType = function(ref) {
    var result;

    if (typeof(ref) === 'function' &&
        this._refmodels[ref.name])
    {
        result = ref;
    } else {
        result = this._refmodels[ref];
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
function(name, reference, cb, bucket) {
    bucket = bucket || this.options.bucket;
    var Ref = this.getReferenceType(reference);
    
    // If it has a type, use that, else assume that it is a string
    reference = new Ref(name);

    debug('getting reference:  ' + name);
    bucket.get(name, function(err, res) {
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
 * @param {*} bucket
 * @returns {CouchCushion}
 */
CouchCushion.prototype.get = function(id, cb, model, bucket) {
    bucket = bucket || this.options.bucket;
    var self = this,
        Model;

    if (model)
        Model = this.getModel(model);

    debug('getting doc:  ' + id);
    try {
        bucket.get(id, function(err, res) {
            if (err) return cb(err, null, res);

            if (!Model && res.value && res.value.type) {
                Model = self.getModel(res.value.type.capitalize(true));
            }

            if (Model) {
                model = new Model();
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

CouchCushion.prototype.getFromElasticsearch = function(es, cb, model, bucket) {
    bucket = bucket || this.options.bucket;
    var Model;

    if (model)
        Model = this.getModel(model);

    if (!(es && es.test))
        return cb(new Error('Malformed Elasticsearch Response'));

    var hits = es.hits;

    var docs = [];
    var requests = hits.map(function(val) {
        return function(cb) {
            var err;
            var doc = val._source.doc;

            if (!Model && doc && doc.type) {
                Model = self.getModel(doc.type.capitalize(true));
            }

            if (Model) {
                model = new Model();
                model.set(doc);
            } else {
                err = 'Could not get model: ' + (val && val.id) || val;
            }

            debug('received doc: ' + (val && val.id) || val);
            docs.push(model);
            cb(err);
        };
    });

    async.parallel(requests, function(err) {
        cb(err, docs, es);
    });
};

/**
 * Get a single document from a search
 *
 * @param {Model|string} model - The model type that will be returned
 * @param {*} cb
 * @param {*} search - A Couchbase query to be executed
 * @param {*} key
 * @param {string} doc - A document name, for a view query
 * @param {*} bucket
 * @returns {CouchCushion}
 */
CouchCushion.prototype.getOne = function(model, cb, search, key, doc, bucket) {
    if (search instanceof Couchbase.ViewQuery || 
       (search.keys && search.key && search.from)) {

        return this.oneFromQuery(model, cb, search, bucket);

    } else {

        return this.oneFromView(model, cb, search, key, doc, bucket);

    }
};

/**
 * Get an array of documents from a search
 *
 * @param {Model|string} model - The model type that will be returned
 * @param {*} cb
 * @param {*} search - A Couchbase query to be executed
 * @param {*} key
 * @param {string} doc - A document name, for a view query
 * @param {*} bucket
 * @returns {CouchCushion}
 */
CouchCushion.prototype.getMany = function(model, cb, search, key, doc, bucket) {
    
    if (search instanceof Couchbase.ViewQuery || 
       (search.keys && search.key && search.from)) {
		
        return this.fromQuery(model, cb, search, bucket);
    } else if(typeof search === 'object' && search.bbox) {
        var query = Couchbase.SpatialQuery.from(search.ddoc, search.name).bbox(search.bbox);
        return this.fromQuery(model, cb, query, bucket);
    } else {
		debug('calling fromView');
        return this.fromView(model, cb, search, key, doc, bucket);

    }
};


// Query

/**
 * Get a document from a query
 *
 * @param {Model|string} model - The model type that will be returned
 * @param {*} cb
 * @param {*} query - A Couchbase query to be executed
 * @param {*} bucket
 * @returns {CouchCushion}
 */
CouchCushion.prototype.fromQuery = function(model, cb, query, bucket) {
    bucket = bucket || this.options.bucket;
    var RequestModel = this.getModel(model);

    if (!(RequestModel && RequestModel.prototype instanceof Model)) {
        var err = new Error('requested model type `'+model+'` not found');
        return cb(err, null, null);
    }

    bucket.query(query, function(err, res) {
        debug('before err');
        if (err) return cb(err, null, res);
        debug('after err');
        var models = [];

        if (res) {
            
            var values = getResults(res);

            for (var i = 0; i < values.length; i++) {
                var resultModel = new RequestModel({ bucket: bucket });
                
               	var modelValue = values[i].value;
                if(typeof modelValue == "string")
                    modelValue = JSON.parse(modelValue);
                
                resultModel.set(modelValue);
                models.push(resultModel);
            }
        } else {
            err = new Error('could not get documents from bucket');
        }

        cb(err, models, res);
    });

    return this;
};

/**
 * Get a single document from a query
 *
 * @param {Model|string} model - The model type that will be returned
 * @param {*} cb
 * @param {*} query - A Couchbase query to be executed
 * @param {*} bucket
 * @returns {CouchCushion}
 */
CouchCushion.prototype.oneFromQuery = function(model, cb, query, bucket) {
    bucket = bucket || this.options.bucket;
    var RequestModel = this.getModel(model);

    if (!(RequestModel && RequestModel.prototype instanceof Model)) {
        var err = new Error('requested model type `'+model+'` not found');
        return cb(err, null, null);
    }

    bucket.query(query, function(err, res) {
        var resultModel = null;
        if (err) return cb(err, null, res);

        if (res) {
            var resultValue = getOneResult(res);
            if (resultValue) {
                resultModel = new RequestModel({ bucket: bucket });
                resultModel.set(getOneResult(res));
            }
        }

        // On second though, I can't think of a reason that we'd need to give an
        // error here, if there is no result model it'd just be null
        //
        // if (!res || !resultModel) {
        //     err = new Error('could not get document from bucket');
        // }

        return cb(err, resultModel, res);
    });

    return this;
};


// Views

/**
 * Build a view query
 */
function buildViewQuery(view, key, doc, isMultiKeyQuery) {
    if (!doc) {
        // Get the document name
    }

    var query = Couchbase.ViewQuery.from(doc, view);

    if (key) {
        if (isMultiKeyQuery && Array.isArray(key))
            query = query.keys(key);

        else if (key.id)
            query = query.key(key.id);

        else if (key._fields && key._fields.id)
            query = query.key(key._fields.id.get());

        else
            query = query.key(key);
    }

    return query;
}

/**
 * Get an array of documents from a view query
 *
 * @param {Model|string} model - The model type that will be returned
 * @param {*} cb
 * @param {string} view - The view's name
 * @param {*} key
 * @param {string} doc - A document name, for a view query
 * @param {*} bucket
 * @returns {CouchCushion}
 */
CouchCushion.prototype.fromView = function(model, cb, view, key, doc, bucket, isMultiKey) {
    var query = buildViewQuery(view, key, doc, isMultiKey);
    return this.fromQuery(model, cb, query, bucket);
};

/**
 * Get a single document from a view query
 *
 * @param {Model|string} model - The model type that will be returned
 * @param {*} cb
 * @param {string} view - The view's name
 * @param {*} key
 * @param {string} doc - A document name, for a view query
 * @param {*} bucket
 * @returns {CouchCushion}
 */
CouchCushion.prototype.oneFromView = function(model, cb, view, key, doc, bucket, isMultiKey) {
    var query = buildViewQuery(view, key, doc, isMultiKey);
    return this.oneFromQuery(model, cb, query, bucket);
};
