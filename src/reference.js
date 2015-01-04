'use strict';

var Model = require('./model');

/**
 * @class
 */
function Reference(name, options) {
    Model.call(this, options);

    this.name = name;
}

Reference.prototype = Object.create(Model.prototype);
Reference.prototype.constructor = Reference;

module.exports = Reference;


// Default Schema
Reference.prototype.schema = {};



Reference.prototype.save = 
function(cb, bucket) {
    bucket = bucket || this.options.bucket;

    // Update the updated date
    if (this._fields.updated)
        this._fields.updated.set(new Date());

    for (var key in this._fields)
        if (this._fields[key].save && typeof(this._fields[key].save) === 'function')
            this._fields[key].save();

    bucket.upsert(this.name, this.getValue(), cb);
    return this;
};
