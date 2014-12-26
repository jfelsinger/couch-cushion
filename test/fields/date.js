
'use strict';

var DateField = require('../../src/fields/date');

describe('DateField', function() {

    it('should construct', function(done) {
        var field = new DateField();

        field.should.have.property('get');
        field.should.have.property('set');
        field.should.have.property('options');
        field.should.have.property('_value');

        done();
    });

    it('should construct with a default value', function(done) {
        var value = new Date();
        var field = new DateField(null, value);

        field.should.have.property('_value', value);
        field.get().should.match(value);

        done();
    });

    describe('#get', function() {

        it('should return set value', function(done) {
            var field = new DateField();
            var value = new Date();

            (field.get() === undefined).should.be.true;
            field.set(value);
            field.get().should.match(value);

            done();
        });

    });

    describe('#set', function() {

        it('should update `_value`', function(done) {
            var field = new DateField();
            var value = new Date();

            (field._value === undefined).should.be.true;
            field.set(value);
            field._value.should.match(value);

            done();
        });

        it('should convert set values', function(done) {
            var field = new DateField();
            var value;

            value = 12000000;
            field.set(value);
            field._value.should.match(new Date(value));

            value = null;
            field.set(value);
            field._value.should.match(new Date(value));

            done();
        });

    });

});
