'use strict';

var Fields = require('../src/fields'),
    Model = require('../src/model'),
    cushion = require('../src');

var should = require('should');

describe('Couch Cushion', function() {

    it('should be', function(done) {

        cushion.should.have.property('connect');
        cushion.should.have.property('getOption');
        cushion.should.have.property('setOption');
        cushion.should.have.property('model');
        cushion.should.have.property('getModel');
        cushion.should.have.property('save');

        cushion.should.have.property('get');
        cushion.should.have.property('getOne');
        cushion.should.have.property('getMany');
        cushion.should.have.property('fromQuery');
        cushion.should.have.property('oneFromQuery');
        cushion.should.have.property('fromView');
        cushion.should.have.property('oneFromView');

        done();
    });

    it('should save options between requires', function(done) {
        var option = 'THIS TEST VALUE';
        cushion.options.test = option;

        var _cushion = require('../src');
        _cushion.options.should.have.property('test', option);

        done();
    });

    describe('#getOption', function() {

        it('should get options', function(done) {
            var option = ['a','b','c'];
            cushion.options.test = option;

            cushion.getOption('test').should.match(option);

            done();
        });

    });

    describe('#setOption', function() {

        it('should get options', function(done) {
            var option = ['a','b','c'];
            cushion.setOption('test', option);
            cushion.options.should.have.property('test', option);

            done();
        });

    });

    describe('#model', function() {
        var schemaName = 'Test';
        var testSchema = {
            id: { field: 'Id', prefix: 'tst' },
            type: { field: 'constant', value: 'test' },
            text: String,
            anotherString: 'string',
            num: Number,
        };

        it('should throw when a model does not exist', function(done) {

            cushion.model.bind(cushion, 'NonExistent').should.throw();

            done();
        });

        it('should create model from valid schema', function(done) {
            cushion.model(schemaName, testSchema);

            cushion._models.should.have.property(schemaName);

            done();
        });

        it('should return a constructable model', function(done) {
            var Model = cushion.model(schemaName);
            var model = new Model();

            done();
        });

        it('should return a model with all the schema fields', function(done) {
            var Model = cushion.model(schemaName);
            var model = new Model();

            for (var key in testSchema) {
                model._fields.should.have.property(key);
                model.should.have.property(key);
            }

            console.log(model.getValue());

            done();
        });
    });

    describe('#getModel', function() {

        it('should return a model from a string', function(done) {
            var Model = cushion.model('Test');
            var ReturnedModel = cushion.getModel('Test');
            
            ReturnedModel.should.match(Model);

            done();
        });

        it('should return a model from a model', function(done) {
            var Model = cushion.model('Test');
            var ReturnedModel = cushion.getModel(Model);
            
            ReturnedModel.should.match(Model);

            done();
        });

    });

    describe('#save', function() {
    });

    describe('#connect', function() {
    });

    describe('#get', function() {
    });

    describe('#getOne', function() {
    });

    describe('#getMany', function() {
    });

    describe('#fromQuery', function() {
    });

    describe('#oneFromQuery', function() {
    });

    describe('#fromView', function() {
    });

    describe('#oneFromView', function() {
    });

});
