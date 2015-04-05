'use strict';

var Reference = require('../src/model'),
    cushion = require('..');

var should = require('should');

describe('Reference', function() {
    var TRef = new cushion.Schema({
        id: { field: 'id', prefix: 'trf' },
        title: String
    });

    cushion.model('TRef', TRef);

    it('should construct', function() {
        var ref = new Reference({ name: 'doc::ref' });

        ref.should.have.property('_name', 'doc::ref');
        ref.should.have.property('_id', 'doc::ref');
    });

    it('should set id to name', function() {
        var ref, Ref;
        Ref = cushion.ref('TRef');

        ref = new Ref({ name: 'trf::test' });
        ref.should.have.property('_name', 'trf::test');
        ref.should.have.property('_id', 'trf::test');
        ref._fields.id.get().should.equal('trf::test');

        ref = new Ref();
        ref._fields.id.get().should.not.equal('trf::test');
    });

    it('should construct a specific reference', function() {
        var List = cushion.ref('List');
        var ref = new List({ name: 'users::all' });

        ref.should.have.property('_name', 'users::all');
        ref.should.have.property('_id', 'users::all');
    });

});
