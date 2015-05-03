'use strict';

var ModelField = require('../../src/fields/model'),
    cushion = require('../..');

var should = require('should'),
    sinon = require('sinon');

//
// TODO:
// Add tests for inline type fields
//

describe('ModelField', function() {
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
        field = new ModelField();

        field.should.have.property('get');
        field.should.have.property('set');
        field.should.have.property('options');
        field.should.have.property('_value');

        done();
    });

    it('should support more complex models', function(done) {
        field = new ModelField();
        var SimpleModel = cushion.model('Test');
        var ComplexModel = cushion.model('TestObj');

        var simple = new SimpleModel();
        var complex = new ComplexModel();

        complex.obj = simple;

        var complexCopy = new ComplexModel(complex.getValue());

        done();
    });

    describe('#save', function() {
        var db, spy;

        beforeEach(function() {
            db = {};
            db.save = sinon.stub().callsArg(2);

            field = new ModelField();
        })

        // it ('should throw without an adapter', function() {
        //     model.save.bind(model).should.throw();
        // });

        it('should return cb', function(done) {
            field.save(done, db);
        });

        it('should not call save by default', function(done) {
            field.save(function() {
                should(db.save.called).be.false;
                done();
            }, db);
        });

        it('should call save when loaded and has value', function(done) {
            field._isLoaded = true;
            field._value = {};
            field._value.save = function(done, _db) {
                _db.should.match(db);
                done();
            };

            field.save(done, db);
        });

    });

    describe('#getValue', function() {
        beforeEach(function() {
            field = new ModelField();
        });

        describe('when uninitialized', function() {
            it('should return null when uninitialized', function(done) {
                (field.getValue() === undefined).should.be.true;
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
                done();
                field.getValue().should.equal(model.id);
            });

            it('should be able to return full model', function(done) {
                field.getValue(true).should.match(model.getValue(true));
                done();
            });

        });

    });

    describe('#save', function() {
        beforeEach(function() {
            field = new ModelField();
        });
    });

    describe('#getModelType', function() {
        beforeEach(function() {
            field = new ModelField();
        });

        it('should return a falsy value by default', function(done) {
            (field.getModelType() == undefined).should.be.true;
            done();
        });

    });

    describe('#setModelType', function() {
        beforeEach(function() {
            field = new ModelField();
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

        it('should throw if model already initialized', function(done) {
            var model = cushion.model(schemaName);
            field._isInitialized = true;
            field.setModelType.bind(field, model).should.throw();

            done();
        });

    });

    describe('#get', function() {
        beforeEach(function() {
            field = new ModelField();
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
            field = new ModelField();
        });

        it('should throw when trying to set an invalid value', function(done) {
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

                it('should just set an id', function(done) {

                    field.set(id, function(err, model, res) {
                        if (err) throw err;

                        // model._model.should.match(Model);
                        model._value.should.equal(id);
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


                it('should only set id', function(done) {
                    field.set(id, function(err, model, res) {
                        if (err) throw err;

                        model._value.should.equal(id);
                        model._isLoaded.should.be.false;

                        done();
                    });
                });
            });

        });

    });

});

