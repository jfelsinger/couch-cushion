# Couch Cushion ODM
## A Node.js ODM for Couchbase

#### Installation

```
npm install --save git@bitbucket.org:iconiqgmbh/couch-cushion-odm.git
```

---

### Usage

```
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

### Testing

If you're developing this project, make sure that you create tests for any new
features, and that all of your tests run smoothly before committing.

Tests are ran with gulp, along with linting. Just run:

```
gulp
```
