'use strict';

var Fields = require('../src/fields'),
    Model = require('../src/model'),
    Schema = require('../src/schema'),
    cushion = require('..');

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
    var advancedSchema = new Schema(testSchema);
    advancedSchema.compute('bothStrings', function() {
        return this.text + this.anotherString;
    });
    advancedSchema.method('greet', function() {
        this.text = 'HELLO';
    });

    it('should be', function(done) {

        cushion.should.have.property('getOption');
        cushion.should.have.property('setOption');

        cushion.should.have.property('model');
        cushion.should.have.property('getModel');

        cushion.should.have.property('save');
        cushion.should.have.property('get');

        cushion.should.have.property('Schema');
        cushion.Schema.should.match(Schema);

        done();
    });

    it('should save options between requires', function(done) {
        var option = 'THIS TEST VALUE';
        cushion.options.test = option;

        var _cushion = require('..');
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
            if (!cushion._models.Test)
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

        it('should create a model with computed properties', function(done) {
            var Model = cushion.model('Advanced', advancedSchema);
            var model = new Model();

            model._computed.should.have.property('bothStrings');
            model.should.have.property('bothStrings');

            model.text = 'Gree';
            model.anotherString = 'tings!';

            model.bothStrings.should.equal('Greetings!');

            done();
        });

        it('should create a model with methods', function(done) {
            var Model = cushion.model('Advanced');
            var model = new Model();

            model._methods.should.have.property('greet');
            model.should.have.property('greet');

            model.greet();
            model.text.should.equal('HELLO');

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

    describe('#connect', function() {
    });

    describe('#save', function() {
        return;

        it('should save', function(done) {
            return done();

            var Model = cushion.model('Test');
            var model = new Model();

            cushion.save(model, function(err, res) {
                done();
            });
        });

    });

    describe('#get', function() {
        return;

        it('should run a callback with a constructed model', function(done) {
            return done();

            var cb = function(err, model, res) {
                var Model = cushion.model('Test');

                (model === null).should.false;
                model.should.be.an.instanceof(Model);

                done();
            };

            cushion.get('Test', cb);
        });

    });
});
