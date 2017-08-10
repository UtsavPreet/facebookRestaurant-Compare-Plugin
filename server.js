 var express = require('express');
 var app = express();
 var port = process.env.PORT || 8080;
 var fb = require("fb")
 var bodyParser = require('body-parser');
 var mongo = require('mongodb').MongoClient;
 var async = require('async');
 var url = 'mongodb://localhost:27017/restaurent';
 app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({
     extended: true
 }));
 var path = require('path');
 app.use(express.static(path.join(__dirname, 'public')));
 app.get('/', function(req, res) {
     res.sendFile(__dirname + '/public/views/index.html');
 });
 mongo.connect(url, function(err, db) {
     if (err) {
         console.log(err);
     }
     console.log("connected");
     global.db = db;
 });
 fb.setAccessToken('778609825679453|i_EEmwEy9_ZLUxcmnafb4-IuPXM');
 // global.restaurantData;
 // global.findResult;
 // // global.posts;
 // global.eventIds = [];
 // global.eventData = [];
 global.pageID;
 // graph.setAccessToken('778609825679453|i_EEmwEy9_ZLUxcmnafb4-IuPXM');
 // var options = {
 //     timeout: 3000,
 //     pool: {
 //         maxSockets: Infinity
 //     },
 //     headers: {
 //         connection: "keep-alive"
 //     }
 // };
 // graph.setVersion("2.10");

 // app.post('/restaurantDetail', function(req, res) {
 //     var a = {};
 //     a['restaurants'] = [];
 //     global.db.collection('competitors').find({ restaurantName: req.body.name }).toArray(function(err, result) {
 //         if (err)
 //             throw err;
 //         else {
 //             async.forEachSeries(result[0].competitor, function(item, callback) {
 //                 if (item.facebookName != undefined) {
 //                     getDetail(item.facebookName, function(r1) {
 //                         a.restaurants.push(r1);
 //                         callback();
 //                     });
 //                 } else
 //                     callback();

 //             }, function() {
 //                 res.send(a);
 //             })
 //         }

 //     })

 //     function getDetail(competitorName, cb) {
 //         global.db.collection('facebookRestaurantData').find({ "restaurant.name": competitorName }).toArray(function(err, result) {
 //             return cb(result[0])
 //         })
 //     }



 //     // global.db.collection('facebookRestaurantData').find({}).toArray(function(err, result) {
 //     //     if (err)
 //     //         throw err;
 //     //     res.send(result);
 //     // })
 // })

 // app.post('/fetchData', function(req, resp) {
 //     global.pageID = req.body.name;


 //     // global.db.collection('facebookRestaurantData').find(function(error, cursor) {
 //     //     if (error || !cursor) {
 //     //         console.log("error getting items");
 //     //     } else {
 //     //         cursor.toArray(function(error, items) {
 //     //             if (error || !items) {
 //     //                 console.log("error getting items");
 //     //             } else {
 //     //                 resp.send(JSON.stringify(items));
 //     //             }
 //     //         });
 //     //     };
 //     // })
 app.post('/fetchData', function(req, resp) {
     global.pageID = req.body.name;
     fb.api('', 'post', {
         batch: [{
                 method: 'get',
                 relative_url: global.pageID + '?fields=name_with_location_descriptor,location,talking_about_count,checkins,fan_count,overall_star_rating,about,cover,feed{name,id,created_time,likes.limit(0).summary(true),comments.limit(0).summary(true),message.limit(0).summary(true),reactions.limit(0).summary(true),status_type},events.limit(10){name,attending_count,cover,declined_count,start_time,interested_count}&since=2017-08-06&until=2017-08-07'
             },

         ]
     }, function(res) {

         res0 = JSON.parse(res[0].body);
         res0.feed.totalPost = res0.feed.data.length;
         res0.events.totalEvents = res0.events.data.length;
         res0.restaurantId = global.pageID;
         global.db.collection('facebookRestaurantData').save({
             _id: req.body.name,
             restaurant: res0,
         })
         resp.send(res0)

     });





     //  fb.api(global.pageID, {
     //      fields: ['id', 'name', 'fan_count']
     //  }, function (res) {
     //      if (!res || res.error) {
     //          console.log(!res ? 'error occurred' : res.error);
     //          return;
     //      }
     //      console.log(res.id);
     //      console.log(res.name);
     //      console.log(res.fan_count);
     //  });
 })





 //     graph.get(req.body.name + "?fields=name,talking_about_count,checkins,engagement,fan_count,overall_star_rating", function(err, res) {
 //         global.restaurantData = res;

 //     });
 //     graph.get(req.body.name + "/posts?since= 2017-07-01&&until= now", function(err, res) {
 //         global.restaurantData.posts = res;
 //         // var b = {};
 //         // b['data'] = [];
 //         // async.forEachSeries(res.data, function(item, callback) {
 //         //     var postID = item.id;
 //         //     graph.get(postID + "?fields=likes.summary(true)", function(err, result) {
 //         //         //         b.data.push(result);
 //         //         res.data = result;
 //         //         // res.data
 //         //         callback();
 //         // })
 //         // }, function() {
 //         //     // global.db.collection('facebookRestaurantData').update({
 //         //     //     _id: req.body.name
 //         //     // }, {
 //         //     //     $set: {
 //         //     //         posts: global.postData
 //         //     //     }
 //         //     // })
 //         //     global.restaurantData.post = b;
 //         // global.restaurantData.posts = res;

 //         eventData();
 //         //     // res1.send(b);

 //         // })

 //     })

 //     function eventData() {
 //         graph.get(req.body.name + "/events?since= 2017-07-01&&until= now", function(err, res) {



 //             var a = {};
 //             a['eventDetail'] = [];
 //             async.forEachSeries(res.data, function(item, callback) {
 //                 var eventID = item.id;
 //                 graph.get(eventID + "?fields=name,description,attending_count,can_guests_invite,can_viewer_post,declined_count,interested_count,maybe_count,start_time", function(err, result) {
 //                     result.start_time = result.start_time.substr(0, 10);
 //                     result.restaurantId = global.pageID;
 //                     a.eventDetail.push(result);
 //                     callback();
 //                 })

 //             }, function() {
 //                 global.restaurantData.events = a;
 //                 global.restaurantData.totalEvent = res.data.length;


 //                 console.log(global.restaurantData.name);
 //                 global.db.collection('competitors').update({ 'restaurantName': req.body.competitor }, { '$push': { 'competitor': { 'facebookName': global.restaurantData.name } } });


 //                 global.db.collection('facebookRestaurantData').save({
 //                     _id: req.body.name,
 //                     restaurant: global.restaurantData
 //                 })
 //                 resp.send(global.restaurantData);

 //             })
 //         })

 //     }


 // })


 app.post('/eventDetails', function(req, res1) {

     global.db.collection('facebookRestaurantData').find({ _id: req.body.name }).toArray(function(err, result) {
         if (err)
             throw err;
         res1.send(result[0].restaurant.events);
     })

     //     // var eventsData = {};
     //     // graph.get(req.body.name + "/events?since= 2017-07-01&&until= now", function(err, res) {
     //     //     var a = {};
     //     //     a['eventDetail'] = [];
     //     //     async.forEachSeries(res.data, function(item, callback) {
     //     //         var eventID = item.id;
     //     //         graph.get(eventID + "?fields=name,description,attending_count,can_guests_invite,can_viewer_post,declined_count,interested_count,maybe_count,start_time", function(err, result) {
     //     //             a.eventDetail.push(result);
     //     //             callback();
     //     //         })

     //     //     }, function() {
     //     //         db.collection('facebookRestaurantData').update({
     //     //             _id: 'circuscyberhub'
     //     //         }, {
     //     //             '$push': { 'events.eventDetail': res }
     //     //         })
     //     //         res1.send(a);

     //     //     })
     //     // })


 })

 // app.post('/postDetails', function(req, res) {
 //     // graph.get(req.body.name + "/posts?since= 2017-07-01&until= now", function(error, result) {
 //     //     res.send(result);

 //     // })


 //     graph.get(req.body.name + "/posts?since= 2017-07-01&until= now", function(err, res) {
 //         // global.posts = res;
 //         var b = {};
 //         b['data'] = [];
 //         async.forEachSeries(res.data, function(item, callback) {
 //             var postID = item.id;
 //             graph.get(postID + "?fields=message,likes.summary(true)", function(err, result) {
 //                 b.data.push(result);
 //                 callback();
 //             })
 //         }, function() {
 //             // global.db.collection('facebookRestaurantData').update({
 //             //     _id: req.body.name
 //             // }, {
 //             //     $set: {
 //             //         posts: global.postData
 //             //     }
 //             // })
 //             // eventData();
 //             res1.send(b);
 //         })
 //     })
 // })

 // var pages = ['trendkitchen.in','circuscyberhub','cafedelhiheights'];

 // function doSomething(){
 //     getPosts(pages).then(function(res){
 //         console.log(res);
 //     });
 // }

 // this.getPosts = function (pages) {
 //         return new Promise(function (res, rej) {
 //             //get all settings for inventory
 //             // execute('getSettings', r).then(function (resp) {
 //             //      (resp) ? res(resp) : res(false);
 //             // });
 //             //trendkitchen.in/posts?fields=id,message,shares,likes.limit(0).summary(true),created_time,comments.limit(0).summary(true),reactions.limit(0).summary(true)&limit=2
 //             graph.get(postID + "?fields=message,likes.summary(true)", function(err, result) {
 //                 console.log(result)
 //                 res(result);
 //             })
 //         });

 //     }
 app.listen(port);
 console.log('Server started! At http://localhost:' + port);