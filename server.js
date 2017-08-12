 var express = require('express');
 var app = express();
 var port = process.env.PORT || 8080;
 var fb = require("fb")
 var bodyParser = require('body-parser');
 var mongo = require('mongodb').MongoClient;
 var async = require('async');
 var url = 'mongodb://localhost:27017/restaurant';
 app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({
     extended: true
 }));
 var path = require('path');
 app.use(express.static(path.join(__dirname, 'public')));
 app.get('/', function (req, res) {
     res.sendFile(__dirname + '/public/views/index.html');
 });
 mongo.connect(url, function (err, db) {
     if (err) {
         console.log(err);
     }
     console.log("connected");
     global.db = db;
 });
 fb.setAccessToken('778609825679453|i_EEmwEy9_ZLUxcmnafb4-IuPXM');
 global.pageID;

 app.post('/fetchData', function (req, resp) {
     global.pageID = req.body.name;
     fb.api('', 'post', {
         batch: [{
                 method: 'get',
                 relative_url: global.pageID + '?fields=name_with_location_descriptor,picture,location,talking_about_count,checkins,fan_count,overall_star_rating,about,cover,feed{name,id,created_time,likes.limit(0).summary(true),comments.limit(0).summary(true),message.limit(0).summary(true),reactions.limit(0).summary(true),status_type,shares},events.limit(10){name,description,attending_count,cover,declined_count,start_time,interested_count}&since=2017-08-06&until=2017-08-07'
             },
         ]
     }, function (res) {
         res0 = JSON.parse(res[0].body);
         res0.feed.totalPost = res0.feed.data.length;
         res0.events.totalEvent.count = res0.events.data.length;
         for (var i = 0; i < res0.feed.data.length; i++) {
             res0.feed.data[i].created_time = res0.feed.data[i].created_time.substr(0, 10);
         }
         for (var i = 0; i < res0.events.data.length; i++) {
             res0.events.data[i].start_time = res0.events.data[i].start_time.substr(0, 10);
             res0.events.data[i].date = res0.events.data[i].start_time.substr(8, 2);
             res0.events.data[i].month = res0.events.data[i].start_time.substr(5, 2);
             totalEvent.attendingCount = res0.events.data[i].attending_count

         }
         res0.restaurantId = global.pageID;
         global.db.collection('pages').save({
             _id: req.body.name,
             name: res0.name_with_location_descriptor,
             about: res0.about,
             location: res0.location
         })
         global.db.collection('events').save({
             _id: req.body.name,
             name: res0.name_with_location_descriptor,
             events: res0.events.data
         })
         global.db.collection('feed').save({
             _id: req.body.name,
             feed: res0.feed.data
         })
         resp.send(res0);
     });
 })
 app.post('/eventDetails', function (req, resp) {
     global.db.collection('events').find({}).toArray(function (err, result) {
         if (err)
             throw err;
         var x = {};
         x.data = result;
         resp.send(x);
     })
 })

 app.listen(port);
 console.log('Server started! At http://localhost:' + port);