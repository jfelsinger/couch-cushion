'use strict';

var Id = require('../../src/fields/id');

describe('Id', function() {

    it('should construct', function(done) {
        var field = new Id();

        field.should.have.property('get');
        field.should.have.property('set');
        field.should.have.property('generate');
        field.should.have.property('options');
        field.should.have.property('_value');

        done();
    });

    it('should construct with options and default value', function(done) {
        var value = 'id::this-value-here';
        var options = { prefix: 'pre' };
        var field = new Id(options, value);

        field.should.have.property('_value', value);
        field.get().should.equal(value);

        for (var key in options) {
            field.options.should.have.property(key, options[key]);
        }

        done();
    });

    describe('#get', function() {

        it('should return set value', function(done) {
            var field = new Id();
            var value = 'qwfd-aqsdf-asdf-asd';

            (field.get() === undefined).should.be.true;
            field.set(value);
            field.get().should.equal(value);

            done();
        });

    });

    describe('#set', function() {

        it('should update `_value`', function(done) {
            var field = new Id();
            var value = 'qwfd-aqsdf-asdf-asd';

            (field._value === undefined).should.be.true;
            field.set(value);
            field._value.should.equal(value);

            done();
        });

    });

    describe('#generate', function() {

        it('should set the value to a new id', function(done) {
            var field = new Id();

            (field.get() === undefined).should.be.true;
            field.generate();
            (field.get() === undefined).should.be.false;

            done();
        });


        it('should only start with `::` when there is a prefix', function(done) {
            var field = new Id();

            (field.get() === undefined).should.be.true;
            field.generate();
            (field.get() === undefined).should.be.false;
            field.get().should.not.startWith('::');

            done();
        });


        it('should use a supplied prefix', function(done) {
            var prefix = 'pfx';
            var field = new Id();

            (field.get() === undefined).should.be.true;
            field.generate(prefix);
            (field.get() === undefined).should.be.false;
            field.get().should.startWith(prefix + '::');

            // From supplied options
            prefix = 'xxf';
            field = new Id({ prefix: prefix});

            (field.get() === undefined).should.be.true;
            field.generate();
            (field.get() === undefined).should.be.false;
            field.get().should.startWith(prefix + '::');

            done();
        });

    });
});
