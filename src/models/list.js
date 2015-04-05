'use strict';

var Cushion = require('../../index'),
    Schema = require('../schema');

var List = new Schema({
    limit: { field: Number, value: 0 },
    values: Array
});


/**
 * Adds an object to the end of the list,
 * removes and returns elements that are over the limit
 *
 * a,b <- [c,d,e,f] <- g,h
 */
List.method(function push() {
    Array.prototype.push.apply(this.values._, arguments);

    var overflow = [];
    if (this.limit > 0)
        while (this.values._.length > this.limit)
            overflow.push(this.values._.shift());

    return overflow;
});

/**
 * Proxy for the pop function
 */
List.method(function pop() {
    return Array.prototype.pop(this.values._, arguments);
});


/**
 * Adds an object to the start of the list,
 * removes and returns elements that are over the limit
 *
 * a,b -> [c,d,e,f] -> g,h
 */
List.method(function unshift() {
    Array.prototype.unshift.apply(this.values._, arguments);

    var overflow = [];
    if (this.limit > 0)
        while (this.values._.length > this.limit)
            overflow.unshift(this.values._.pop());

    return overflow;
});

/**
 * Proxy for the shift function
 */
List.method(function shift() {
    return Array.prototype.shift(this.values._, arguments);
});


module.exports = function(cushion) {
    cushion = cushion || Cushion;
    return cushion.ref('List', List);
};
