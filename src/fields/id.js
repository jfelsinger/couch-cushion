'use strict';

var Field = require('../field'),
    uuid = require('node-uuid');


function FieldId(options) {
    Field.apply(this, arguments);

    if (options) {
        if (options.prefix) 
            this._prefix = 
            this.options.prefix = 
            options.prefix;
    }
}

FieldId.prototype = Object.create(Field.prototype);
FieldId.prototype.constructor = FieldId;


FieldId.prototype.generate = function(prefix) {
    prefix = prefix || this._prefix || this.options.prefix || '';
    if (prefix.length) prefix += '::';

    this._value = prefix + uuid.v4();
};

module.exports = FieldId;
