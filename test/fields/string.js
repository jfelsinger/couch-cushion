'use strict';

var Str = require('../../src/fields/string');

describe('StringField', function() {

    it('should construct', function(done) {
        var field = new Str();

        field.should.have.property('get');
        field.should.have.property('set');
        field.should.have.property('options');
        field.should.have.property('_value');

        done();
    });

    it('should construct with a default value', function(done) {
        var value = 'Test string value';
        var field = new Str(null, value);

        field.should.have.property('_value', value);
        field.get().should.equal(value);

        done();
    });

    describe('#get', function() {

        it('should return set value', function(done) {
            var field = new Str();
            var value = 'string value';

            (field.get() === undefined).should.be.true;
            field.set(value);
            field.get().should.equal(value);

            done();
        });

    });

    describe('#set', function() {

        it('should update `_value`', function(done) {
            var field = new Str();
            var value = 'string value';

            (field._value === undefined).should.be.true;
            field.set(value);
            field._value.should.equal(value);

            done();
        });

        it('should convert set values', function(done) {
            var field = new Str();
            var value;

            value = null;
            field.set(value);
            field.get().should.equal(value + '');

            value = undefined;
            field.set(value);
            field.get().should.equal(value + '');

            value = {};
            field.set(value);
            field.get().should.equal(value + '');

            value = true;
            field.set(value);
            field.get().should.equal(value + '');

            value = false;
            field.set(value);
            field.get().should.equal(value + '');

            value = 0;
            field.set(value);
            field.get().should.equal(value + '');

            value = 123;
            field.set(value);
            field.get().should.equal(value + '');

            value = 'string';
            field.set(value);
            field.get().should.equal(value + '');

            done();
        });

    });
});
