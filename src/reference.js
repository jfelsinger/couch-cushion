'use strict';

var debug = require('debug')('couch-cushion:reference');

var Model = require('./model');

/**
 * @class
 */
function Reference(name, options) {
    Model.call(this, options);

    this.name = name;

    debug('constructed ref: ' + name);
}

Reference.prototype = Object.create(Model.prototype);
Reference.prototype.constructor = Reference;

module.exports = Reference;


// Default Schema
Reference.prototype.schema = {};



Reference.prototype.save = 
function(cb, bucket) {
    var name = this.name;
    bucket = bucket || this.options.bucket;

    debug('saving ref:   ' + name);

    // Update the updated date
    if (this._fields.updated)
        this._fields.updated.set(new Date());

    for (var key in this._fields)
        if (this._fields[key].save && typeof(this._fields[key].save) === 'function')
            this._fields[key].save();

    bucket.upsert(name, this.getValue(), cb);
    return this;
};
