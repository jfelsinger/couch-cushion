# Couch Cushion ODM
## A Node.js ODM for Couchbase

### Installation

```
npm install --save git+ssh://git@bitbucket.org:iconiqgmbh/couch-cushion-odm.git
```

### Basic Usage

```javascript
var cushion = require('couch-cushion');
cushion.options.bucket = bucket; // Set the bucket for it to use

var User = cushion.model('User', {
    id: { field: 'id', prefix: 'usr' },
    type: { field: 'constant', value: 'user' },
    username: String,
    name: String,
});

var test = new User();
test.username = 'jDoe24';
test.name = 'John Doe';
test.email = 'jdoe@gmail.com';

cushion.save(test, function(err) {
    if (err) throw err;

    cushion.get(test.id, function(err, obj) {
        if (err) throw err;

        console.log(obj.name); // => 'John Doe'
    });
});
```

---

# Models and Schemas

Documents in couch-cushion are represented as an instance of a model. Models are
defined via a schema. The schema setup is loosely based off of that in mongoose.

### Defining a schema and creating a model

Models can be defined with plain objects as their schemas, as demonstrated in
the *Basic Usage* example, however much more robust functionality can be had by
defining a full-fledged Schema object instead.

```javascript
var Cushion = require('couch-cushion'),
    crypto = require('crypto');

// Define the base scheme for a user
var User = new Cushion.Schema({
    id:     { field: 'id', prefix: 'usr' },
    type:   { field: 'constant', value: 'user' },
    created: Date,
    updated: Date,

    email: String,
    firstName: String,
    lastName: String,

    password: String,
});

// Add computed properties
User.compute('fullName', function() {
    return this.firstName + ' ' + this.lastName;
});

// Add methods

User.method('setPassword', function setPassword(pw) {
    this.password = crypto.createHash('md5').update(pw).digest('hex');
});


// If a name isn't supplied, the name of the supplied function will be used
// instead
User.method(function checkPassword(pw) {
    var hash = crypto.createHash('md5').update(pw).digest('hex');
    return hash === this.password;
});


// Name and create a model from the schema we just defined
cushion.model('User', User);
```

Our model then becomes available wherever we use couch-cushion.

```javascript
var User = cushion.model('User');

var user = new User();
user.firstName = 'John';
user.lastName = 'Doe';

user.fullName;  // => 'John Doe'

user.setPassword('password');
user.checkPassword('nope');     // => false
```

### Schema Fields

A number of fields are available to be defined in a schema, as well as aliases
for more user-informative schemas.

- id - For generating a unique id for a model
- bool - For storing boolean values
- string
- number
- date
- constant - For storing values that aren't meant to be changed
- enum - For storing a value that can only be one of a set number of choices
- object - For storing javascript objects. Both arrays and plain objects.
- model - For storing another couch-cushion model as a child.

All the generic object types are aliased so that a schema can be defined using
the type itself, rather than a string. Ex:

```javascript
schema = { 'followers': Array }
// vs.
schema = { 'followers': 'array' };
```

#### Objects, Arrays, and Models

Most values types can be accessed directly from the property of their respective
field. Models and objects (also subsequently arrays), because of their
complexity cannot have their values accessed directly, instead the value must be
accessed via a helper property (`_`).

```javascript
var User = cushion.model('User', {
    id: 'id',
    username: String,
    followers: Array,
    options: Object,
});

var user = new User();

// A string value can be accessed directly
user.username = 'jDoe';

// An object field can be set directly, and this is preferable.
user.followers = ['tim','tom','tona'];

// But, other cases require the use of the helper property, `_`.
user.followers._[2] = 'tina';
user.follower._.push('tiffany');

var followersCopy = user.followers._.slice();

// This is also true for object properties.
user.options._.status = 'online';
```


# Document Naming

In most cases documents modeled by couch-cushion will require an id field. The
id field is required and will be used by couch-cushion as the document's name in
Couchbase.





---

# Testing

If you're developing this project, make sure that you create tests for any new
features, and that all of your tests run smoothly before committing.

Tests are ran with gulp, along with linting. Just run:

```
gulp
```
