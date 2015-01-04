'use strict';

var Reference = require('../src/reference'),
    cushion = require('couch-cushion');

var should = require('should');

describe('Reference', function() {

    it('should construct', function(done) {
        var ref = new Reference('doc::ref');

        ref.should.have.property('name', 'doc::ref');

        done();
    });

    it('should construct a specific reference', function(done) {
        var List = cushion.ref('List');
        var ref = new List('users::all');

        ref.should.have.property('name', 'users::all');

        done();
    });

});
