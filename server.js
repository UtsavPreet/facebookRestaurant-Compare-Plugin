var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var graph = require('fbgraph');
var bodyParser = require('body-parser');
var request = require('request');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/restaurant';
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
})); // support encoded bodies
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
global.restaurantData;
global.findResult;
graph.setAccessToken('778609825679453|i_EEmwEy9_ZLUxcmnafb4-IuPXM');
var options = {
    timeout: 3000,
    pool: {
        maxSockets: Infinity
    },
    headers: {
        connection: "keep-alive"
    }
};
graph.setVersion("2.10");
app.post('/fetchData', function (req, resp) {
    graph.get(req.body.name + "?fields=name,talking_about_count", function (err, res) {
        console.log(res);
    });
    // res.json(JSON.parse(body));
    console.log(res);
    global.db.collection('restaurantData').insert({
        data: JSON.parse(res)
    });
})
// app.post('/fetchData', function (req, res) {
//     console.log(req.body);
//     const pageFieldSet = 'talking_about_count,name,posts.limit(1){name,likes.summary(true),total_count},checkins,engagement,fan_count,overall_star_rating,events.limit(1){name,attending_count,declined_count,interested_count,description,cover}';
//     var searchType = 'page';
//     const options = {
//         method: 'GET',
//         uri: 'https://graph.facebook.com/v2.10/search/',
//         qs: {
//             access_token: '778609825679453|i_EEmwEy9_ZLUxcmnafb4-IuPXM',
//             q: req.body.name,
//             type: 'page',
//             fields: pageFieldSet
//         }
//     };

//     request(options, function (err, resp, body) {
//         // global.restaurantData = JSON.parse(body);
//         // console.log(global.restaurantData);
//         // res.json(global.restaurantData);
//         res.json(JSON.parse(body));
//         global.db.collection('restaurantData').insert({
//             data: JSON.parse(body)
//         });

//     })

// })
// app.post('/posts',function(req,res){
//     const pageFieldSet = 'posts?since= 2017-07-01&&until= now';
//     var searchType = 'page'
//     const options = {
//         method: 'GET',
//         uri: 'https://graph.facebook.com/v2.10/${req.body.name}',
//         qs: {
//             access_token: '778609825679453|i_EEmwEy9_ZLUxcmnafb4-IuPXM',
//             fields: pageFieldSet
//         }
//     };
//     request(options, function (err, resp, body) {
//         // global.restaurantData = JSON.parse(body);
//         // console.log(global.restaurantData);
//         // res.json(global.restaurantData);
//         res.json(JSON.parse(body));
//         global.db.collection('restaurantData').insert({
//             data: JSON.parse(body)
//         });
// })
// })
app.post('/dbData', function (req, res) {
    global.db.collection('restaurantData').find({}).toArray(function (err, result) {
        if (err) throw err;
        global.findResult = result;
        res.send(global.findResult);
    })

})
app.listen(port);
console.log('Server started! At http://localhost:' + port);