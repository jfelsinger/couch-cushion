'use strict';

var ArrayField = require('../../src/fields/array');
var should = require('should');

describe('ArrayField', function() {
    var field;
    var test;
    var arr = ['a','b','c'],
        obj = {'a':1, 'b':2};

    it('should construct', function(done) {
        field = new ArrayField();

        field.should.have.property('get');
        field.should.have.property('set');
        field.should.have.property('options');
        field.should.have.property('_value');

        done();
    });

    describe('#set', function() {
        beforeEach(function() {
            field = new ArrayField();
        })

        it('should throw when not an object or an array', function(done) {
            field.set.bind(field, null).should.throw();
            field.set.bind(field, undefined).should.throw();
            field.set.bind(field, 'string').should.throw();
            field.set.bind(field, 1234).should.throw();
            done();
        });

        it('should set from arrays', function(done) {
            field.set.bind(field, arr).should.not.throw();
            field._value.should.match(arr);
            done();
        });

        it('should set from objects', function(done) {
            field.set.bind(field, obj).should.not.throw();
            field._value.should.match(obj);
            done();
        });

        it('should set `isObject` value', function(done) {
            field.set(obj);
            field.options.isObject.should.be.true;

            field.set(arr);
            field.options.isObject.should.be.false;

            done();
        });
        
    });

    describe('#getValue', function() {
        beforeEach(function() {
            field = new ArrayField();
        })

        it('should return an empty array by default', function(done) {
            field.getValue().should.match([]);
            field.getValue().length.should.be.exactly(0);
            done();
        });

        it ('should return a representation of the given object', function(done) {
            var value;

            field.set(obj);
            value = field.getValue();
            value.should.match(obj);
            value.should.be.an.Object;

            field.set(arr);
            value = field.getValue();
            value.should.match(arr);
            value.should.be.an.Array;

            done();
        });
    });

});
