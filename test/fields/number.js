'use strict';

var Num = require('../../src/fields/number');

describe('NumberField', function() {

    it('should construct', function(done) {
        var field = new Num();

        field.should.have.property('get');
        field.should.have.property('set');
        field.should.have.property('options');
        field.should.have.property('_value');

        done();
    });

    it('should construct with a default value', function(done) {
        var value = 1234.5;
        var field = new Num(null, value);

        field.should.have.property('_value', value);
        field.get().should.equal(value);

        done();
    });

    describe('#get', function() {

        it('should return set value', function(done) {
            var field = new Num();
            var value = Math.random();

            (field.get() === undefined).should.be.true;
            field.set(value);
            field.get().should.match(value);

            done();
        });

    });

    describe('#set', function() {

        it('should update `_value`', function(done) {
            var field = new Num();
            var value = Math.random();

            (field._value === undefined).should.be.true;
            field.set(value);
            field._value.should.match(value);

            done();
        });

        it('should throw when value is NaN', function(done) {
            var field = new Num();
            var value;

            field.set.bind(field,value).should.throw();

            value = 'text string';
            field.set.bind(field,value).should.throw();

            value = {};
            field.set.bind(field,value).should.throw();

            value = ['a','b'];
            field.set.bind(field,value).should.throw();

            done();
        });

        it('should convert numeric values', function(done) {
            var field = new Num();
            var value;


            value = 0;
            field.set(value);
            field.get().should.equal(value * 1);

            value = 123;
            field.set(value);
            field.get().should.equal(value * 1);

            value = '0.343434';
            field.set(value);
            field.get().should.equal(value * 1);

            value = '0';
            field.set(value);
            field.get().should.equal(value * 1);

            value = '4321';
            field.set(value);
            field.get().should.equal(value * 1);

            done();
        });
    });
});

