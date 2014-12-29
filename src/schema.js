'use strict';

/**
 * Represents the structure of a document
 *
 * @class
 */
function Schema(schema) {
    this.schema = schema || {};
    this.computed = {};
    this.methods = {};
}

/**
 * Add a field to the the computed properties object
 *
 * @param {string} name - name of the property
 * @param {function} getter
 * @param {function} setter
 * @returns {Schema}
 */
Schema.prototype.compute = function(name, getter, setter) {
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

/**
 * Add a method to the method object of the schema
 *
 * @returns {Schema}
 */
Schema.prototype.method = function() {
    var name, method;

    if (arguments.length === 1) {
        method = arguments[0];
        if (method && typeof(method) === 'function')
            name = method.name;
    } else if (arguments.length === 2) {
        name = arguments[0];
        method = arguments[1];
    }

    if (!name || typeof(name) !== 'string' || name === '')
        throw new Error('attempted to add a method with invalid name');

    if (!method || typeof(method) !== 'function')
        throw new Error('attempted to set invalid method');

    this.methods[name] = method;

    return this;
};



module.exports = Schema;
