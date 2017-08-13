# mocha-mongodb

[![Build Status](https://travis-ci.org/jpstevens/mocha-mongodb.svg)](https://travis-ci.org/jpstevens/mocha-mongodb)

MongoDB helper for Mocha. Useful for seeding data for API tests.

## Installation

```bash
npm install mocha-mongodb --save-dev
```

## Example Usage

```javascript
var db = require('mocha-mongodb');

describe('some test', function () {
  db.connect('mongodb://localhost/test');
  db.dropDb();
  db.create('users', {
    name: 'Name Goes Here'
  });
  it('works', function () {
    // do stuff here
  });
});
```
## Methods

### connect(mongoUrl, [options={}])

  **Description**
  Connect to the specified database. Runs in a "before" block. Assigns the database connection instance to `this.db`. Can take an optional `options` object (see below).

  **Example**
  ```javascript
  db.connect(process.env.MONGO_URL, { lib: 'mongojs' })
  before(function () {
    this.db.users.find({}, function (err, users) {
      // do stuff here
    });
  });
  ```

  **Options**

  - `lib` - Which library to use for MongoDB, either [`mongojs`](https://www.npmjs.com/package/mongojs) or [`mongodb`](https://www.npmjs.com/package/mongodb) (default `mongodb`)

  ### create(collection, query)

  **Alias**
  `add`, `create`

  **Description**
  Create a new object in a collection. Runs in a "beforeEach" block.

  **Example**
  ```javascript
  db.create('user', { firstName: 'John', lastName: 'Smith' });
  // db.add('user', { firstName: 'John', lastName: 'Smith' });
  ```

  ### remove(collection, query)

  **Alias**
  `delete`, `remove`

  **Description**
  Remove objects from a collection. Runs in a "beforeEach" block.

  **Example**
  ```javascript
  db.remove('user', { firstName: 'John' });
  // db.delete('user', { firstName: 'John' });
  ```

  ## dropDb()

  **Description**
  Drops the current database. Runs in a "beforeEach" block.

  **Example**
  ```javascript
  db.dropDb();
  ```
  
