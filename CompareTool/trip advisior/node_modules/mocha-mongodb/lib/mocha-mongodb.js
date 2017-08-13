(function () {

  'use strict';

  module.exports = (function () {

    var db, lib;

    after(function () {
      db.close();
    });

    var mochaMongodb = {
      connect: function (url, opts) {
        if (!opts) opts = {};
        before(function (done) {
          var mongodb;
          if(opts.lib === 'mongodb' || !opts.lib) {
            mongodb = require('mongodb').MongoClient;
            mongodb.connect(url, function (err, connection) {
              if (err) return done(err);
              this.db = db = connection;
              done();
            }.bind(this));
          } else if (opts.lib === 'mongojs'){
            mongodb = require('mongojs');
            var connection = mongodb(url);
            this.db = db = connection;
            done();
          }

        });
      },
      create: function (collection, query) {
        exec('save', collection, query);
      },
      remove: function (collection, query) {
        exec('remove', collection, query);
      },
      dropDb: function () {
        beforeEach(function (done) {
          db.dropDatabase(dbCallback(done));
        });
      }
    };

    mochaMongodb.add = mochaMongodb.create;
    mochaMongodb.delete = mochaMongodb.remove;

    return mochaMongodb;

    function exec (method, collection, query) {
      return beforeEach(function (done) {
        db.collection(collection)[method](query, dbCallback(done).bind(this));
      });
    }

    function dbCallback (done) {
      return function (err, res) {
        if (err) return done(err);
        done();
      };
    }

  })();

})();
