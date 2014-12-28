'use strict';


function MockBucket() {
}

MockBucket.prototype.query = function queryBucket(query, cb) {
    /* jslint camelcase: false */
    var res = {
        total_rows: 4,
        rows: [
            { id: 'tst::1234-12341234-1234-12341', key: null, value: {
              id: 'tst::1234-12341234-1234-12341', type: 'test', text: 'TEST',
              anotherString: 'enother', num: 1234 }},

            { id: 'tst::223a-12341234-1234-12341', key: null, value: { 
              id: 'tst::223a-12341234-1234-12341', type: 'tast', text: 'TESa',
              anotherString: 'anether', num: 2234 }},

            { id: 'tst::3234-12341234-1234-12341', key: null, value: {
              id: 'tst::3234-12341234-1234-12341', type: 'teat', text: 'TEaT',
              anotherString: 'anoteer', num: 3234 }},

            { id: 'tst::4234-12341234-1234-12341', key: null, value: {
              id: 'tst::4234-12341234-1234-12341', type: 'tesa', text: 'TaST',
              anotherString: 'anothee', num: 4234 }},
        ]
    };

    setTimeout(function() {
        cb(null, res);
    }, 500);

    return this;
};

MockBucket.prototype.upsert = function upsertDocument(docName, value, cb) {
    var res = { 'success': true };

    setTimeout(function() {
        cb(null, res);
    }, 500);

    return this;
};

MockBucket.prototype.get = function getDocument(docName, cb) {
    var res = {
        value: { 
          id: 'tst::1234-12341234-1234-12341', type: 'test', text: 'TEST',
          anotherString: 'enother', num: 1234 
        },
    };

    setTimeout(function() {
        cb(null, res);
    }, 500);

    return this;
};

module.exports = exports = new MockBucket();
