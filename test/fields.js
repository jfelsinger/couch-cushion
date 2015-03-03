'use strict';

var Fields = require('../src/fields');

var should = require('should');

describe('Fields', function() {

    it('should have fields', function() {
        Fields.should.have.property('fields');
        Fields.fields.should.be.an.Object;
    });

    describe('#buildScheme', function() {
        it('should return an appropriate fields based on scheme', function() {
            var scheme,field;

            scheme = Object;
            field = Fields.buildScheme(scheme, 'test');
            should(field.options.default).be.undefined;
            should(field._).be.an.Object;

            scheme = { field: Object };
            field = Fields.buildScheme(scheme, 'test');
            should(field.options.default).be.undefined;
            should(field._).be.an.Object;

            scheme = { field: Object, default: [] };
            field = Fields.buildScheme(scheme, 'test');
            should(field.options.default).be.an.Array;
            should(field._).be.an.Array;

            scheme = Array,
            field = Fields.buildScheme(scheme, 'test');
            should(field.options.default).be.an.Array;
            should(field._).be.an.Array;

            scheme = { field: Array };
            field = Fields.buildScheme(scheme, 'test');
            should(field.options.default).be.an.Array;
            should(field._).be.an.Array;
        });
    });

    describe('#getField', function() {

        it('should throw when no field name is given', function() {
            Fields.getField.should.throw();
        });

        it('should return a field by name', function() {
            Fields.getField.bind(Fields, 'id').should.not.throw();

            var Id = Fields.getField('id');
            Id.should.be.a.Function;
        });

        it('should return a field by an aliased name', function() {
            Fields.getField.bind(Fields, 'Id').should.not.throw();

            var Id = Fields.getField('Id');
            Id.should.be.a.Function;
        });

        it('should return a field by a type', function() {
            Fields.getField.bind(Fields, String).should.not.throw();

            var stringField = Fields.getField(String);
            stringField.should.be.a.Function;
        });

        it('should return a the proper fields', function() {
            var field;

            Fields.getField.bind(Fields, 'id').should.not.throw();
            Fields.getField('id').name.should.equal('FieldId');

            Fields.getField.bind(Fields, 'bool').should.not.throw();
            Fields.getField('bool').name.should.equal('FieldBool');

            Fields.getField.bind(Fields, 'string').should.not.throw();
            Fields.getField('string').name.should.equal('FieldString');

            Fields.getField.bind(Fields, 'number').should.not.throw();
            Fields.getField('number').name.should.equal('FieldNumber');

            Fields.getField.bind(Fields, 'constant').should.not.throw();
            Fields.getField('constant').name.should.equal('FieldConstant');

            Fields.getField.bind(Fields, 'date').should.not.throw();
            Fields.getField('date').name.should.equal('FieldDate');

            Fields.getField.bind(Fields, 'enum').should.not.throw();
            Fields.getField('enum').name.should.equal('FieldEnum');

            Fields.getField.bind(Fields, 'array').should.not.throw();
            Fields.getField('array').name.should.equal('FieldObject');

            Fields.getField.bind(Fields, 'object').should.not.throw();
            Fields.getField('object').name.should.equal('FieldObject');

            Fields.getField.bind(Fields, 'model').should.not.throw();
            Fields.getField('model').name.should.equal('FieldModel');
        });
    });
});
