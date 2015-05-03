'use strict';

var cushion = require('../..');

var should = require('should');

describe('List', function() {
    var list;

    beforeEach(function() {
        var List = cushion.model('List');
        list = new List();
    });

    it('should have methods', function() {
        should(list.push).be.a.Function;
        should(list.pop).be.a.Function;
        should(list.shift).be.a.Function;
        should(list.unshift).be.a.Function;
    });

    describe('#push', function() {
        it('should return an array', function() {
            list.push('a').should.match([]);
        });

        it('should push an element to the end of the list', function() {
            list.values = ['a','b','c'];
            list.push('d').should.match([]);
            list.values._.length.should.equal(4);
            list.values._[3].should.equal('d');
        });

        it('should respect the list limit', function() {
            list.limit = 3;
            list.values = ['a','b','c'];
            list.push('d').should.match(['a']);
            list.values._.length.should.equal(3);
            list.values._.should.match(['b','c','d']);
        });
    });

    describe('#unshift', function() {
        it('should return an array', function() {
            list.unshift('a').should.match([]);
        });

        it('should shift an element to the front of the list', function() {
            list.values = ['b','c','d'];
            list.unshift('a').should.match([]);
            list.values._.length.should.equal(4);
            list.values._.should.match(['a','b','c','d']);
        });

        it('should respect the list limit', function() {
            list.limit = 3;
            list.values = ['b','c','d'];
            list.unshift('a').should.match(['d']);
            list.values._.length.should.equal(3);
            list.values._.should.match(['a','b','c']);
        });
    });

    describe('#shift', function() {
        it('should return value from the front of the array', function() {
            list.values = ['a','b','c'];
            should(list.shift()).match('a');
        });
    });

    describe('#pop', function() {
        it('should return value from the end of the array', function() {
            list.values = ['a','b','c'];
            should(list.pop()).match('c');
        });
    });


});
