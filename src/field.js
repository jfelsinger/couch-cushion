'use strict';

/**
 * Represents a field on a model/document
 *
 * @param {Object.<string,*>} options
 * @param {*} value
 * @class
 */
function Field(options) {

    if (!this.options) this.options = {};

    // Set default options
    this
        .allowOptions([
                'allowedOptions', 
                'readonly',
                'name',
                'default',
            ])
        ._setOptions(options, {
                readonly: false
            });

    /** @access protected */
    this._value = undefined;

    if (arguments.length > 1 && arguments[1])
        this.set(arguments[1]);
    else if (this.options.default)
        this.set(this.options.default);
}

/**
 * Returns the field's value
 *
 * @returns {*}
 */
Field.prototype.get = function getter() {
    return this._value;
};

/**
 * Set the field's value
 *
 * @param {*} value
 * @returns null
 */
Field.prototype.set = function setter(value) {
    if (this.options.readonly) {
        throw new Error('attempted to set value on read-only field');
    }

    this._value = value;
};

/**
 * Returns a value representative of the field
 *
 * @returns {*}
 */
Field.prototype.getValue = function getValue() {
    return this.get();
};

/**
 * Allow options to be set on construction for the field
 *
 * @returns {Field}
 */
Field.prototype.allowOptions = function() {
    if (!this.options) this.options = {};

    if (!this.options.allowedOptions)
        this.options.allowedOptions = [];

    for (var i = 0; i < arguments.length; i++) {
        var values = arguments[i];
        if (!Array.isArray(values))
            values = [values];

        for (var j = 0; j < values.length; j++)
            if (values[j] && this.options.allowedOptions.indexOf(values[j]) === -1)
                this.options.allowedOptions.push(values[j]);
    }

    return this;
};



/**
 * Pseudo-protected fields
 */

/**
 * Set the options on the field
 *
 * @param {Array} values
 * @param {Array} defaults
 * @access protected
 * @returns {Field}
 */
Field.prototype._setOptions = function(values, defaults) {
    defaults = defaults || {};

    if (values) {
        // Adjust allowed options from those supplied
        if (values.allowedOptions && typeof(values.allowedOptions) === 'object')
            this.allowOptions(values.allowedOptions);

        // Add values to options array
        for (var i = 0; i < this.options.allowedOptions.length; ++i) {
            var option = this.options.allowedOptions[i];

            if (values[option])
                this.options[option] = values[option];

            else if (this.options[option] === undefined)
                this.options[option] = defaults[option];
        }
    }

    return this;
};



module.exports = Field;
