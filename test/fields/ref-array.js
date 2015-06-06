'use strict';

var RefField = require('../../src/fields/ref-array'),
    CouchCushion = require('../../src');

var should = require('should'),
    sinon = require('sinon');

describe('FieldRefArray', function() {
    var field, cushion;
    var schemaName, schema;

    beforeEach(function() {
        cushion = new CouchCushion();
        field = null;

        schemaName = 'TestObj';
        schema = {
            id: { field: 'Id', prefix: 'tst' },
            type: { field: 'constant', value: 'testObj' },
            text: 'string',
        };

        cushion.model(schemaName, schema);
    });

    it('should construct', function() {
        field = new RefField();

        field.should.have.property('get');
        field.should.have.property('set');
        field.should.have.property('options');
        field.should.have.property('_value');
        field.should.have.property('_referenceScheme');
        field.should.have.property('_model');
    });

    it('should construct with given options', function() {
        var rs = String;
        field = new RefField({
            referenceScheme: rs,
            modelType: schemaName
        }, null, cushion);

        field.should.have.property('_referenceScheme', rs);

        var Model = cushion.getModel(schemaName);
        field.should.have.property('_model');
        field._model.should.match(Model);
    });

    describe('#getValue', function() {
        it('should return values through the field schema', function() {
            var val;

            // Strings
            field = new RefField({ referenceScheme: String });
            field._value = [ 'string', 1234, null, undefined, ];

            val = field.getValue();
            val.should.be.an.Array;
            val.should.matchEach(function (row) { row.should.be.a.String; });

            // Numbers
            field = new RefField({ referenceScheme: Number });
            field._value = [ '000', 1234, '1.20' ];

            val = field.getValue();
            val.should.be.an.Array;
            val.should.matchEach(function (row) { row.should.be.a.Number; });

            // Bool
            field = new RefField({ referenceScheme: Boolean });
            field._value = [ undefined, 1234, '1.20', 'sdljk', true, {} ];

            val = field.getValue();
            val.should.be.an.Array;
            val.should.matchEach(function (row) { row.should.be.a.Boolean; });

            // Date
            field = new RefField({ referenceScheme: Date });
            field._value = [ new Date(), Date.now(), '12-12-2015', ];

            val = field.getValue();
            val.should.be.an.Array;
            val.should.matchEach(function (row) { row.should.be.a.Date; });

            // Models
            var Model = cushion.model(schemaName);

            field = new RefField({ referenceScheme: 'Model' }, null, cushion);
            field._value = [ new Model(), (new Model()).getValue(), (new Model()).id ];

            val = field.getValue();
            val.should.be.an.Array;
            val.should.matchEach(/^\w+::\w{8}(-\w{4}){3}-\w{12}$/i);
        });

        it('should return the full object values when requested', function() {
            var val;
            var Model = cushion.model(schemaName);

            field = new RefField({ referenceScheme: 'Model' }, null, cushion);
            field._value = [ new Model(), (new Model()).getValue(), (new Model()).id ];

            val = field.getValue(true);
            val.should.be.an.Array;
            val[0].should.be.an.Object;
            val[1].should.be.an.Object;
            val[2].should.match(/^\w+::\w{8}(-\w{4}){3}-\w{12}$/i);
        });
    });

    describe('#getModelType', function() {
        beforeEach(function() {
            field = new RefField({}, undefined, cushion);
        });

        it('should return a falsy value by default', function(done) {
            (field.getModelType() == undefined).should.be.true;
            done();
        });

    });

    describe('#setModelType', function() {
        beforeEach(function() {
            field = new RefField({}, undefined, cushion);
        });

        it('should be able to be set from a model', function(done) {
            var model = cushion.model(schemaName);
            field.setModelType(model);
            field.getModelType().should.match(model);

            done();
        });

        it('should be able to be set from a model name', function(done) {
            var name = schemaName;
            var model = cushion.model(name);
            field.setModelType(name);
            field.getModelType().should.match(model);

            done();
        });

        it('should only be able to be ran once', function(done) {
            var model = cushion.model(schemaName);
            field.setModelType(model);
            field.setModelType.bind(field, model).should.throw();

            done();
        });

        it('should throw if a model is already set', function(done) {
            var model = cushion.model(schemaName);
            field._model = model;
            field.setModelType.bind(field, model).should.throw();

            done();
        });

    });

    describe('/array aliases', function() {
        it('should have a number of array functions available', function() {
            field = new RefField({ referenceScheme: Number });

            [
                'push', 'pop', 'shift', 'unshift',
                'concat', 'every', 'filter', 'forEach',
                'indexOf', 'join', 'lastIndexOf', 'map',
                'reduce', 'reduceRight', 'reverse',
                'shift', 'slice', 'some', 'sort', 'splice',
            ].forEach(function(func) {
                should(field[func]).be.a.Function;
            });
        });

        it('should perform array functions on array value', function() {
            field = new RefField({ referenceScheme: Number });

            field.push(1);
            field._value.should.match([1]);
            field.pop().should.equal(1);
            field._value.should.match([]);

            field.push(3);
            field.push(2);
            field.push(1);
            field.sort().should.match([1,2,3]);

        });

        it('should have a length property', function() {
            field = new RefField({ referenceScheme: Number }, [9,9,0]);
            field.length.should.equal(3);
        });
    });

});
