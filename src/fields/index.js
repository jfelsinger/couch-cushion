'use strict';

var debug = require('debug')('couch-cushion:fields');

var fields = {
    id:         require('./id'),
    bool:       require('./bool'),
    string:     require('./string'),
    number:     require('./number'),
    constant:   require('./constant'),
    date:       require('./date'),
    enum:       require('./enum'),
    object:     require('./object'),
    model:      require('./model'),
    refArray:   require('./ref-array'),
};

var FIELDALIASES = {
  'Id':         'id',

  'Bool':       'bool',
  'Boolean':    'bool',
  'boolean':    'bool',

  'String':     'string',

  'Number':     'number',

  'Constant':   'constant',
  'Const':      'constant',
  'const':      'constant',

  'Date':       'date',
  'Time':       'date',
  'time':       'date',

  'Enum':       'enum',
  'Enumerable': 'enum',
  'enumerable': 'enum',

  'Object':     'object',
  'Array':      'object',
  'array':      'object',

  'Model':      'model',
  'model':      'model',

  'Reference':        'refArray',
  'reference':        'refArray',
  'References':       'refArray',
  'references':       'refArray',
  'RefArray':         'refArray',
  'Ref-Array':        'refArray',
  'Ref-array':        'refArray',
  'ref-array':        'refArray',
  'Reference-array':  'refArray',
  'reference-array':  'refArray',
};

module.exports.fields = fields;

for (var field in fields)
    module.exports[field] = fields[field];

/**
 * Returns a name for a field based on a schema stricture
 *
 * @returns {String}
 */
module.exports.getFieldName = function getFieldName(fieldName) {

    if (fieldName === undefined) {
        throw new Error('Field name not specificied');
    }

    if (typeof(fieldName) === 'function')
        fieldName = fieldName.name;

    return fieldName;
};

/**
 * Return a particuler field based on a schema structure
 *
 * @returns {Field}
 */
module.exports.get =
module.exports.getField = function getField(fieldName) {
    var field;

    fieldName = this.getFieldName(fieldName);

    // Check for an alias
    if (FIELDALIASES[fieldName])
        fieldName = FIELDALIASES[fieldName];

    // Get the field from the list
    if (fields[fieldName])
        field = fields[fieldName];
    else
        throw new Error('Requested field type `' + fieldName + '` not found');

    return field;
};

/**
 * Build a schema structure and return a field based off of it
 *
 * @returns {Field}
 */
module.exports.buildScheme = function buildScheme(scheme, name, cushion) {
    if (typeof(scheme) === 'string' || typeof(scheme) === 'function') {
        scheme = {
            field: scheme
        };
    } else if (typeof(scheme) !== 'object') {
        throw new Error('expected schema fields to be strings or objects');
    }

    if (Array.isArray(scheme) && scheme[0]) {
        scheme = {
            field: 'refArray',
            referenceScheme: scheme[0],
        };

        if (typeof(scheme.referenceScheme) === 'object')
            scheme.modelType = (
                scheme.referenceScheme.modelType ||
                scheme.referenceScheme.model
            );
    }

    if (name && !scheme.name)
        scheme.name = name;

    debug('building field: ' + name + ', ' + scheme.field);

    var value = scheme.value;
    var field = this.getField(scheme.field);

    // A special case for Object fields that are set to actually be Arrays.
    // Arrays and generic objects share the same type of field, but if the
    // schema was explicitly said to be an array we want to default it to a
    // value that is also an array `[]`. This simplifies schema definitions.
    if (this.getFieldName(scheme.field).toLowerCase() === 'array' &&
        scheme.default == undefined)
        scheme.default = [];

    scheme = new field(scheme, value, cushion);

    return scheme;
};

