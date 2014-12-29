'use strict';

var ObjectField = require('../../src/fields/object'),
    bucket = require('../../lib/mocks/bucket'),
    cushion = require('../..');

describe('ObjectField', function() {
    cushion.options.bucket = bucket;
    if (!cushion._models.Test) {
        var schemaName = 'Test';
        var testSchema = {
            id: { field: 'Id', prefix: 'tst' },
            type: { field: 'constant', value: 'test' },
            text: String,
            anotherString: 'string',
            num: Number,
        };
        cushion.model(schemaName, testSchema);
    }


    var field;
    var schemaName = 'TestObj';
    var schema = {
        id: { field: 'Id', prefix: 'tst' },
        type: { field: 'constant', value: 'testObj' },
        text: 'string',
        num: 'number',
    };

    var modelSchemaName = 'Obj';
    var modelSchema = {
        id: { field: 'Id', prefix: 'obj' },
        type: { field: 'constant', value: 'obj' },
        model: 'model'
    };

    cushion.model(schemaName, schema);
    cushion.model(modelSchemaName, modelSchema);



    it('should construct', function(done) {
        field = new ObjectField();

        field.should.have.property('get');
        field.should.have.property('set');
        field.should.have.property('options');
        field.should.have.property('_value');

        done();
    });

    describe('#getValue', function() {
        beforeEach(function() {
            field = new ObjectField();
        });

        describe('when uninitialized', function() {
            it('should return null when uninitialized', function(done) {
                (field.getValue() === null).should.be.true;
                done();
            });
        });

        describe('when initialized', function() {
            var Model = cushion.model(schemaName);
            var model = new Model();

            beforeEach(function() {
                field.set(model);
            });

            it('should return an id by default', function(done) {
                field.getValue().should.equal(model.id);
                done();
            });

            it('should be able to return full object', function(done) {
                field.getValue(true).should.match(model.getValue(true));
                done();
            });

        });

    });

    describe('#save', function() {
        beforeEach(function() {
            field = new ObjectField();
        });
    });

    describe('#getModelType', function() {
        beforeEach(function() {
            field = new ObjectField();
        });

        it('should return a falsy value by default', function(done) {
            (field.getModelType() == undefined).should.be.true;
            done();
        });

    });

    describe('#setModelType', function() {
        beforeEach(function() {
            field = new ObjectField();
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

        it('should throw if object already initialized', function(done) {
            var model = cushion.model(schemaName);
            field._isInitialized = true;
            field.setModelType.bind(field, model).should.throw();

            done();
        });

    });

    describe('#get', function() {
        beforeEach(function() {
            field = new ObjectField();
        });

        it('should return itself', function(done) {
            field.get().should.match(field);
            done();
        });

    });

    describe('#set', function() {
        var Model = cushion.model(schemaName);
        var model = new Model();
        beforeEach(function() {
            field = new ObjectField();
        });

        it('should throw when trying to set an invalid value', function(done) {
            field.set.bind(field, undefined).should.throw();
            field.set.bind(field, null).should.throw();
            field.set.bind(field, 123.45).should.throw();

            done()
        });

        it('should call a cb', function(done) {
            function cb(err, obj, res) {
                done();
            }

            field.set(Model, cb);
        });

        describe('when initialized', function() {
            beforeEach(function() {
                field.setModelType(Model);
            });

            it('should throw when trying to set an invalid model', function(done) {
                var InvalidModel = cushion.model(modelSchemaName);
                var invalidModel = new InvalidModel
                field.set.bind(field, InvalidModel).should.throw();
                field.set.bind(field, invalidModel).should.throw();

                done();
            });

            describe('and when setting from an uninitialized model', function() {
                it('should throw', function(done) {
                    field.set.bind(field, Model).should.throw();
                    done();
                });
            });

            describe('and when setting from an initialized model', function() {

                it('should set', function(done) {
                    field.set(model);
                    field._value.should.match(model);

                    done();
                });

            });

            describe('and when setting from plain values', function() {
                var modelValue = {
                    id: 'tst::123456-1234-1234512-as2123',
                    type: 'testObj',
                    text: 'test string',
                    num: 12345
                }

                it('should set', function(done) {
                    field.set(modelValue);
                    field._value.should.match(modelValue);

                    done();
                });

            });

            describe('and when setting from an id', function() {
                var id = 'tst::1234-12341234-1234-12341';
                var Model = cushion.model('Test');

                it('should set', function(done) {

                    field.set(id, function(err, model, res) {
                        if (err) throw err;

                        // model._model.should.match(Model);
                        model._value.id.should.equal(id);
                        done();
                    });

                });
            });
        });

        describe('when uninitialized', function() {

            describe('and when setting from an uninitialized model', function() {

                it('should set', function(done) {
                    field.set(Model);
                    field._value.should.be.an.instanceof(Model);

                    done();
                });

                it('should initialize when setting', function(done) {
                    field.set(Model);
                    field._isInitialized.should.be.true;

                    done();
                });

                it('should set model type when setting', function(done) {
                    field.set(Model);
                    field._model.should.match(Model);

                    done();
                });

            });

            describe('and when setting from an initialized model', function() {

                it('should set', function(done) {
                    field.set(model);
                    field._value.should.match(model);

                    done();
                });

                it('should initialize when setting', function(done) {
                    field.set(model);
                    field._isInitialized.should.be.true;

                    done();
                });

                it('should set model type when setting', function(done) {
                    field.set(model);
                    field._model.should.match(Model);

                    done();
                });

            });

            describe('and when setting from plain values', function() {
                var modelValue = {
                    id: 'tst::123456-1234-1234512-as2123',
                    type: 'testObj',
                    text: 'test string',
                    num: 12345
                }

                it('should set', function(done) {
                    field.set(modelValue);
                    field._value.should.match(modelValue);

                    done();
                });

                it('should initialize when setting', function(done) {
                    field.set(modelValue);
                    field._isInitialized.should.be.true;

                    done();
                });

                it('should set model type when setting', function(done) {
                    field.set(modelValue);
                    field._model.should.match(Model);

                    done();
                });

            });

            describe('and when setting from an id', function() {
                var id = 'tst::1234-12341234-1234-12341';
                var Model = cushion.model('Test');


                it('should set', function(done) {
                    field.set(id, function(err, model, res) {
                        if (err) throw err;

                        model._model.should.match(Model);
                        model._value.id.should.equal(id);
                        done();
                    });
                });
            });

        });

    });

});

