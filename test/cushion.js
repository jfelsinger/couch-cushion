'use strict';

var Fields = require('../src/fields'),
    Couchbase = require('couchbase'),
    Model = require('../src/model'),
    cushion = require('../src'),
    bucket = require('../lib/mocks/bucket');

var should = require('should');

describe('Couch Cushion', function() {
    var schemaName = 'Test';
    var testSchema = {
        id: { field: 'Id', prefix: 'tst' },
        type: { field: 'constant', value: 'test' },
        text: String,
        anotherString: 'string',
        num: Number,
    };

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

    // TODO: mock up a *better* couchbase db for all of this...
    cushion.options.bucket = bucket;

    describe('#connect', function() {
    });

    describe('#save', function() {

        it('should save', function(done) {

            var Model = cushion.model('Test');
            var model = new Model();

            cushion.save(model, function(err, res) {
                done();
            });
        });

    });

    describe('#get', function() {

        it('should run a callback with a constructed model', function(done) {
            var cb = function(err, model, res) {
                var Model = cushion.model('Test');

                (model === undefined).should.false;
                model.should.be.an.instanceof(Model);

                done();
            };

            cushion.get('Test', cb);
        });

    });

    describe('#getOne', function() {

        it('should run a callback with a constructed model', function(done) {
            var cb = function(err, model, res) {
                var Model = cushion.model('Test');

                (model === undefined).should.false;
                model.should.be.an.instanceof(Model);

                done();
            };

            var search = Couchbase.ViewQuery.from('doc', 'view');

            cushion.getOne('Test', cb, search);
        });

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
