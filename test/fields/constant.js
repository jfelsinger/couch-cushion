'use strict';

var Constant = require('../../src/fields/constant');

describe('ConstantField', function() {

    it('should construct', function(done) {
        var field = new Constant();

        field.should.have.property('get');
        field.should.have.property('set');
        field.should.have.property('options');
        field.should.have.property('_value');

        done();
    });

    it('should construct with a default value', function(done) {
        var value = 'test';
        var field = new Constant(null, value);

        field.should.have.property('_value', value);
        field.get().should.equal(value);

        done();
    });

    describe('#get', function() {

        it('should return set value', function(done) {
            var field = new Constant();
            var value = 'string value';

            (field.get() === undefined).should.be.true;
            field.set(value);
            field.get().should.equal(value);

            done();
        });

    });

    describe('#set', function() {

        it('should update `_value`', function(done) {
            var field = new Constant();
            var value = 'string value';

            (field._value === undefined).should.be.true;
            field.set(value);
            field._value.should.equal(value);

            done();
        });

        it('should only allow setting once', function(done) {
            var a = 'abc';
            var b = 12345;
            var field = new Constant();

            field.set(a);
            field.set.bind(field,b).should.throw();
            field.set.bind(field,b).should.throw();

            field = new Constant(null, a);

            field.set.bind(field,b).should.throw();
            field.set.bind(field,b).should.throw();

            done();
        });

    });
});



