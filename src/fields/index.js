'use strict';


var fields = {
    id:         require('./id'),
    bool:       require('./bool'),
    string:     require('./string'),
    number:     require('./number'),
    constant:   require('./constant'),
    date:       require('./date'),
    enum:       require('./enum'),
    array:      require('./array'),
    object:     require('./object'),
};

var FIELDALIASES = {
  'Id':         'id',

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

  'Array':      'array',

  'Object':     'object',
  'Model':      'object',
  'model':      'object',
};

module.exports.fields = fields;

for (var field in fields)
    module.exports[field] = fields[field];

module.exports.get = 
module.exports.getField = function getField(fieldName) {
    var field;

    if (fieldName === undefined) {
        throw new Error('Field name not specificied');
    }

    if (typeof(fieldName) === 'function')
        fieldName = fieldName.name;

    // Check for an alias
    if (FIELDALIASES[fieldName])
        fieldName = FIELDALIASES[fieldName];

    // Get the field from the list
    if (fields[fieldName])
        field = fields[fieldName];
    else
        throw new Error('Requested field `' + fieldName + '` not found');

    return field;
};

module.exports.buildScheme = function buildScheme(scheme, name) {
    if (typeof(scheme) === 'string' || typeof(scheme) === 'function') {
        scheme = {
            field: scheme
        };
    } else if (typeof(scheme) !== 'object') {
        throw new Error('expected schema fields to be strings or objects');
    }

    if (name && !scheme.name)
        scheme.name = name;

    var value = scheme.value;
    var field = this.getField(scheme.field);

    scheme = new field(scheme, value);

    return scheme;
};

