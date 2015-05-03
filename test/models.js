'use strict';

var Model = require('../src/model');
var Fields = require('../src/fields');

var should = require('should'),
    sinon = require('sinon');

//
// TODO:
// Add tests for inline type fields
//

describe('Model', function() {
    var model;

    beforeEach(function() {
        model = new Model();
    });

    it('should construct', function() {
        model.should.have.property('options');
        model.should.have.property('_fields');
        model.should.have.property('schema');
    });

    it('should only construct with valid options parameter', function() {
        (function() { new Model('---'); }).should.throw(Error);
    });

    it('should have a type and id', function() {
        model._fields.should.have.property('id');
        model._fields.id.should.be.an.instanceof(Fields.id);

        model._fields.should.have.property('type');
        model._fields.type.should.be.an.instanceof(Fields.constant);
    });

    it('should have schema fields defined', function() {
        model.should.have.property('id');
        model.should.have.property('type');

        (model.id === undefined).should.be.false;
    });

    describe('._id', function() {

        it('should return the id by default', function() {
            model._id.should.equal(model.id);
        });

        it('should set the name field', function() {
            var name = 'test';

            should(model._name).not.be.Ok;

            model._id = name;
            should(model._name).equal(name);
        });

    });

    describe('#getValue', function() {

        it('should return an object by default', function() {
            model.getValue().should.be.an.Object;
        });

        it('should return an object with all fields', function() {
            var value = model.getValue();

            for (var key in model._fields) {
                value.should.have.property(key);
            }
        });

        it('should be able to return a valid json string', function() {
            model.getValue(null, true).should.be.an.String;

            JSON.parse(model.getValue(null, true)).should.be.an.Object;
        });

    });

    describe('#save', function() {
        var db = {};
        db.save = sinon.stub().callsArg(2);

        it ('should throw without an adapter', function() {
            model.save.bind(model).should.throw();
        });

        it('should call save function on db', function(done) {
            model.save(done, db);
        });

    });

    describe('#set', function() {

        it('should set all of the given values', function() {
            var value = { id: 'prf::asdf-asdfg-asdfg-adsf' }

            model.set(value);

            model._fields.id.get().should.equal(value.id);
        });

        it('should throw on invalid values', function() {
            model.set.bind(model, null).should.throw(Error);
            model.set.bind(model, undefined).should.throw(Error);
            model.set.bind(model, 10).should.throw(Error);
            model.set.bind(model, '---').should.throw(Error);
        });

        it('should not set constant values', function() {
            var value = { type: 'Test' };

            model.set(value);

            (value.type === model._fields.type.get()).should.be.false;
        });

    });
});
