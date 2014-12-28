'use strict';

function Schema(schema) {
    this.schema = schema || {};
    this.computed = {};
    this.methods = {};
}

Schema.prototype.computed = function(name, getter, setter) {
    var computed = {};

    if (!name || typeof(name) !== 'string')
        throw new Error('attempted to add computed property without invalid name');

    if (!getter || typeof(getter) !== 'function')
        throw new Error('attempted to add invalid getter on computed property, `'+name+'`');

    computed.getter = getter;

    if (setter) {
        if (typeof(setter) !== 'function')
            throw new Error('attempted to add invalid setter on computed property, `'+name+'`');

        computed.setter = setter;
    }

    this.computed[name] = computed;

    return this;
};



module.exports = Schema;
