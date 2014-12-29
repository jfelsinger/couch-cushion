'use strict';

var Schema = require('../src/schema'),
    cushion = require('..');

var should = require('should');

describe('Schema', function() {
    var schema;

    it('should construct', function(done) {
        schema = new Schema();

        schema.should.have.property('schema');
        schema.should.have.property('computed');
        schema.should.have.property('methods');

        done();
    });

    describe('#method', function() {
        beforeEach(function() {
            schema = new Schema();
        });

        var method = function testMethod() { return 'this is a test'; };

        it('should throw when invalid arguments are given', function(done) {
            // No function
            schema.method.bind(schema).should.throw();
            schema.method.bind(schema, 'test').should.throw();
            // Nameless function
            schema.method.bind(schema, function(){}).should.throw();

            done();
        });

        it('should add a method when given a name and method', function(done) {
            schema.method('test', method);
            schema.methods.should.have.property('test');
            schema.methods.test.should.match(method);
            done();
        });

        it('should add a method given a named function', function(done) {
            var name = method.name;
            schema.method(method);
            schema.methods.should.have.property(name);
            schema.methods[name].should.match(method);
            done();
        });
    });

    describe('#compute', function() {
        beforeEach(function() {
            schema = new Schema();
        });

        var getter = function() { return 'test'; };
        var setter = function() { };

        it('should throw when invalid arguments are given', function(done) {
            schema.compute.bind(schema).should.throw();
            schema.compute.bind(schema, null).should.throw();
            schema.compute.bind(schema, 'test', null).should.throw();
            schema.compute.bind(schema, 'test', null, function() {}).should.throw();

            done();
        });

        it('should add a getter', function(done) {
            schema.compute('test', getter);

            schema.computed.test.should.have.property('getter');
            schema.computed.test.getter.should.match(getter);

            done();
        });

        it('should add a setter', function(done) {
            schema.compute('test', getter, setter);

            schema.computed.test.should.have.property('getter');
            schema.computed.test.getter.should.match(getter);
            schema.computed.test.should.have.property('setter');
            schema.computed.test.setter.should.match(setter);

            done();
        });

    });
});
