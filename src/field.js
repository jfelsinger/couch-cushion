'use strict';



function Field(options, value) {

    if (!this.options) this.options = {};

    // Set default options
    this
        .allowOptions([
                'allowedOptions', 
                'readonly',
                'name',
            ])
        ._setOptions(options, {
                readonly: false
            });

    if (value !== undefined) this.set(value);
    else this._value = undefined;
}

Field.prototype.get = function getter() {
    return this._value;
};

Field.prototype.set = function setter(value) {
    if (this.options.readonly) {
        throw new Error('attempted to set value on read-only field');
    }

    this._value = value;
};

Field.prototype.getValue = function getValue() {
    return this.get();
};

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



/**
 * Exports
 */

module.exports = Field;
