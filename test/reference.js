'use strict';

var Reference = require('../src/model'),
    cushion = require('couch-cushion');

var should = require('should');

describe('Reference', function() {

    it('should construct', function(done) {
        var ref = new Reference({ name: 'doc::ref' });

        ref.should.have.property('name', 'doc::ref');

        done();
    });

    it('should construct a specific reference', function(done) {
        var List = cushion.ref('List');
        var ref = new List({ name: 'users::all' });

        ref.should.have.property('name', 'users::all');

        done();
    });

});
