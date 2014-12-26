'use strict';

var Enum = require('../../src/fields/enum');

describe('EnumField', function() {
    var choices = { 'a':1 , 'b':2 };
    var options = { choices: choices };

    it('should construct', function(done) {
        var field = new Enum(options);

        field.should.have.property('get');
        field.should.have.property('set');
        field.should.have.property('_value');
        field.should.have.property('options');

        field.options.should.have.property('choices');

        done();
    });

    it('should construct with supplied choices', function(done) {
        var field = new Enum(options);

        field.options.should.have.property('choices');
        (field.options.choices === undefined).should.be.false;
        field.options.choices.should.match(choices);

        done();
    });

    it('should throw when `choices` not supplied in options', function(done) {
        (function() {
            new Enum();
        }).should.throw();

        done();
    });

    it('should construct with a default value', function(done) {
        var value = 'b';
        var field = new Enum(options, value);

        field.should.have.property('_value', choices[value]);
        field.get().should.equal(choices[value]);

        value = 1;
        field = new Enum(options, value);

        field.should.have.property('_value', value);
        field.get().should.equal(value);

        done();
    });

    describe('#validate', function() {

        it('should validate true valid values', function(done) {
            var field = new Enum(options);

            for (var key in choices) {

                field.validate(key).should.be.true;
                field.validate(choices[key]).should.be.true;

            }

            done();
        });

        it('should validate false for invalid values', function(done) {
            var field = new Enum(options);
            var value;
            
            value = 'x';
            field.validate(value).should.be.false;
            
            value = 9999;
            field.validate(value).should.be.false;
            
            value = false;
            field.validate(value).should.be.false;
            
            value = true;
            field.validate(value).should.be.false;

            done();
        });

    });

    describe('#get', function() {

        it('should return set value', function(done) {
            var field = new Enum(options);
            var value = 'a';

            (field.get() === undefined).should.be.true;
            field.set(value);
            field.get().should.match(choices[value]);

            done();
        });

    });

    describe('#set', function() {

        it('should set value when parameter is valid', function(done){
            var field = new Enum(options);

            for (var key in choices) {

                field.set(key);
                field._value.should.equal(choices[key]);

                field.set(choices[key]);
                field._value.should.equal(choices[key]);

            }

            done();
        });

        it('should throw when value is invalid', function(done){
            var field = new Enum(options);
            var value = Math.random();

            field.set.bind(field, value).should.throw();

            done();
        });

    });

});
