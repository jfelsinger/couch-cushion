'use strict';

var Model = require('../src/model');
var Fields = require('../src/fields');

var should = require('should');

describe('Model', function() {

    it('should construct', function(done) {
        var model = new Model();

        model.should.have.property('options');
        model.should.have.property('_fields');
        model.should.have.property('schema');

        done();
    });

    it('should have a type and id', function(done) {
        var model = new Model();

        model._fields.should.have.property('id');
        model._fields.id.should.be.an.instanceof(Fields.id);

        model._fields.should.have.property('type');
        model._fields.type.should.be.an.instanceof(Fields.constant);

        done();
    });

    it('should have schema fields defined', function(done) {
        var model = new Model();

        model.should.have.property('id');
        model.should.have.property('type');

        (model.id === undefined).should.be.false;

        done();
    });

    describe('#getValue', function() {

        it('should return an object by default', function(done) {
            var model = new Model();

            model.getValue().should.be.an.Object;

            done();
        });

        it('should return an object with all fields', function(done) {
            var model = new Model();
            var value = model.getValue();

            for (var key in model._fields) {
                value.should.have.property(key);
            }

            done();
        });

        it('should be able to return a valid json string', function(done) {
            var model = new Model();

            model.getValue(null, true).should.be.an.String;

            JSON.parse(model.getValue(null, true)).should.be.an.Object;

            done();
        });

    });

    describe('#set', function() {

        it('should set all of the given values', function(done) {
            var model = new Model();
            var value = { id: 'prf::asdf-asdfg-asdfg-adsf' }

            model.set(value);

            model._fields.id.get().should.equal(value.id);

            done();
        });

        it('should not set constant values', function(done) {
            var model = new Model();
            var value = { type: 'Test' };

            model.set(value);

            (value.type === model._fields.type.get()).should.be.false;

            done();
        });

    });
});
