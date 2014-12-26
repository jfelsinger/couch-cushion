'use strict';

var Field = require('../field');

function FieldEnum(options) {
    this.allowOptions('choices');
    Field.apply(this, arguments);

    if (options.choices)
        this.options.choices = this.options.choices;
    else
        throw new Error('Enum field used without supplying choices');
}

FieldEnum.prototype = Object.create(Field.prototype);
FieldEnum.prototype.constructor = FieldEnum;

FieldEnum.prototype.set = function(value) {
    if (this.validate(value) === false)
        throw new Error('Attempted to set invalid value in enumueration field');

    if (this.options.choices[value] !== undefined)
        this._value = this.options.choices[value];
    else
        this._value = value;
};

/**
 * Check to see if a value is valid and fits into the enum scheme
 */
FieldEnum.prototype.validate = function(value) {
    var isValid = false;

    for (var key in this.options.choices)
        if (value === this.options.choices[key] || 
            value === key
        ) {
            isValid = true;
            break;
        }

    return isValid;
};

module.exports = FieldEnum;
