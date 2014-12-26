'use strict';

var ArrayField = require('../../src/fields/array');

describe('ArrayField', function() {

    it('should construct', function(done) {
        var field = new ArrayField();

        field.should.have.property('get');
        field.should.have.property('set');
        field.should.have.property('options');
        field.should.have.property('_value');

        done();
    });

});
