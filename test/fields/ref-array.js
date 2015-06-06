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

    describe('#load', function() {
        it('should call load on values when available', function(done) {
            var data = [
                { load: sinon.stub().callsArg(0) },
                { load: sinon.stub().callsArg(0) },
                { load: sinon.stub().callsArg(0) },
            ];
            field = new RefField({}, data, cushion);
            field.load(function(err) {
                should(err).be.not.Ok;

                data.should.matchEach(function (row) {
                    should(row.load.calledOnce).be.true;
                });
                done();
            });
        });

        it('should not call load when not available', function(done) {
            var data = [ 'asd', 'asdf', 'asdfasdf' ];
            var Model = cushion.model(schemaName);
            cushion.get = function(id, cb) {
                return cb(null, new Model());
            };

            field = new RefField({
                referenceScheme: 'Model',
                modelType: schemaName
            }, data, cushion);
            field.load(function(err) {
                should(err).be.not.Ok;
                done();
            });
        });

        it('should load models from ids', function(done) {
            var data = [ 'asd', 'asdf', 'asdfasdf' ];
            field = new RefField({}, data, cushion);
            field.load(function(err) {
                should(err).be.not.Ok;
                done();
            });
        });
    });

    describe('#loadSlice', function() {
        it('should call load on sliced values', function(done) {
            var data = [
                { load: sinon.stub().callsArg(0) },
                { load: sinon.stub().callsArg(0) },
                { load: sinon.stub().callsArg(0) },
            ];
            field = new RefField({}, data, cushion);
            field.loadSlice(0,1,function(err) {
                should(err).be.not.Ok;

                should(data[0].load.calledOnce).be.true;
                should(data[1].load.called).be.false;
                should(data[2].load.called).be.false;

                done();
            });
        });

        it('should call load on single values', function(done) {
            var data = [
                { load: sinon.stub().callsArg(0) },
                { load: sinon.stub().callsArg(0) },
                { load: sinon.stub().callsArg(0) },
            ];
            field = new RefField({}, data, cushion);
            field.loadSlice(1,function(err) {
                should(err).be.not.Ok;

                should(data[0].load.called).be.false;
                should(data[1].load.calledOnce).be.true;
                should(data[2].load.calledOnce).be.true;

                done();
            });
        });
    });

    describe('#save', function() {
        it('should call save function on available entries', function(done) {
            var Model = cushion.model(schemaName);
            var models = [
                new Model(),
                new Model(),
                new Model(),
            ];

            models.forEach(function(val) {
                val.save = sinon.stub().callsArg(0);
            });

            field = new RefField({ referenceScheme: 'Model' }, models, cushion);
            field.save(function(err) {
                should(err).be.not.Ok;

                should(models[0].save.calledOnce).be.true;
                should(models[1].save.calledOnce).be.true;
                should(models[2].save.calledOnce).be.true;

                done();
            });
        });
    });

    describe('#getArray', function() {
        it('should the actual array value', function() {
            var arr = [1,2,3];
            field = new RefField({}, arr, cushion);
            field.getArray().should.match(arr);
            field.getArray().should.match(field._value);
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

    describe('#set', function() {
        beforeEach(function() {
            field = new RefField({}, undefined, cushion);
        });

        it('should set the field value', function() {
            var arr = [1,2,3];
            field.set(arr);
            field._value.should.match(arr);
        });

        it('should throw on non-array values', function() {
            field.set.bind(field, null).should.throw();
            field.set.bind(field, true).should.throw();
            field.set.bind(field, 'str').should.throw();
            field.set.bind(field, 1234).should.throw();
            field.set.bind(field, {}).should.throw();
        });
    });

    describe('#setModelType', function() {
        beforeEach(function() {
            field = new RefField({}, undefined, cushion);
        });

        it('should be able to be set from a model', function() {
            var model = cushion.model(schemaName);
            field.setModelType(model);
            field.getModelType().should.match(model);
        });

        it('should be able to be set from a model name', function() {
            var name = schemaName;
            var model = cushion.model(name);
            field.setModelType(name);
            field.getModelType().should.match(model);
        });

        it('should only be able to be ran once', function() {
            var model = cushion.model(schemaName);
            field.setModelType(model);
            field.setModelType.bind(field, model).should.throw();
        });

        it('should throw if a model is already set', function() {
            var model = cushion.model(schemaName);
            field._model = model;
            field.setModelType.bind(field, model).should.throw();
        });

        // it('should throw if given model not available', function() {
        //     field.setModelType.bind(field, 'asdflkjasdfljasdf').should.throw();
        // });

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
