require('./helpers');

describe('Mocha MongoDB', function () {
  describe('by default', function () {
    db.connect('mongodb://localhost/mocha-mongodb');
    db.dropDb();
    describe('when the host exists', function () {
      describe('#create', function () {
        db.create('users', {
          firstName: 'Tom',
          lastName: 'Jones'
        });
        it('contains the user', function (done) {
          this.db.collection('users')
          .find({ firstName: 'Tom'}).toArray(function (err, users) {
            expect(users.length).to.equal(1);
            done();
          });
        });
      });
      describe('#add', function () {
        db.create('users', {
          firstName: 'Mike',
          lastName: 'Roberts'
        });
        it('contains the user', function (done) {
          this.db.collection('users')
          .find({ firstName: 'Mike'}).toArray(function (err, users) {
            expect(users.length).to.equal(1);
            done();
          });
        });
      });
      describe('#remove', function () {
        db.create('users', {
          firstName: 'Sam',
          lastName: 'Smith'
        });
        db.remove('users', { firstName: 'Sam' });
        it('return an empty object', function (done) {
          this.db.collection('users')
          .find({ firstName: 'Sam'}).toArray(function (err, users) {
            expect(users.length).to.equal(0);
            done();
          });
        });
      });
      describe('#delete', function () {
        db.create('users', {
          firstName: 'Alice',
          lastName: 'McDonald'
        });
        db.delete('users', { firstName: 'Alice' });
        it('return an empty object', function (done) {
          this.db.collection('users')
          .find({ firstName: 'Alice'}).toArray(function (err, users) {
            expect(users.length).to.equal(0);
            done();
          });
        });
      });
    });
  });
  describe('using `mongodb`', function () {
    var url = 'mongodb://localhost/mocha-mongodb';
    db.connect(url, { lib: 'mongodb' });
    before(function (done) {
      require('mongodb').MongoClient
      .connect(url, function (err, db) {
        this.expectedDb = db;
        done();
      }.bind(this));
    });
    it('returns a `mongodb` database object', function () {
      expect(Object.getOwnPropertyNames(this.db))
      .to.deep.equal(Object.getOwnPropertyNames(this.expectedDb));
    });
  });
  describe('using `mongojs`', function () {
    var url = 'mongodb://localhost/mocha-mongodb';
    db.connect(url, { lib: 'mongojs' });
    before(function () {
      this.expectedDb = require('mongojs')(url);
    });
    it('returns a `mongojs` database object', function () {
      expect(Object.getOwnPropertyNames(this.db))
      .to.deep.equal(Object.getOwnPropertyNames(this.expectedDb));
    });
  });
});
