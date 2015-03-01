'use strict';

var Fields = require('../src/fields');

var should = require('should');

describe('Fields', function() {

    it('should have fields', function(done) {
        Fields.should.have.property('fields');
        Fields.fields.should.be.an.Object;

        done();
    });

    describe('#getScheme', function() {


    });

    describe('#getField', function() {

        it('should throw when no field name is given', function(done) {
            Fields.getField.should.throw();

            done();
        });

        it('should return a field by name', function(done) {
            Fields.getField.bind(Fields, 'id').should.not.throw();

            var Id = Fields.getField('id');
            Id.should.be.a.Function;

            done();
        });

        it('should return a field by an aliased name', function(done) {
            Fields.getField.bind(Fields, 'Id').should.not.throw();

            var Id = Fields.getField('Id');
            Id.should.be.a.Function;

            done();
        });

        it('should return a field by a type', function(done) {
            Fields.getField.bind(Fields, String).should.not.throw();

            var stringField = Fields.getField(String);
            stringField.should.be.a.Function;

            done();
        });

        it('should return a the proper fields', function(done) {
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

            done();
        });
    });
});
