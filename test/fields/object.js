'use strict';

var ObjectField = require('../../src/fields/object');

describe('ObjectField', function() {

    it('should construct', function(done) {
        var field = new ObjectField();

        field.should.have.property('get');
        field.should.have.property('set');
        field.should.have.property('options');
        field.should.have.property('_value');

        done();
    });

});

