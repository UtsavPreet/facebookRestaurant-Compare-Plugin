var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
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
app.post('/fetchData', function (req, res) {
    console.log(req.body);
    const pageFieldSet = 'name,talking_about_count,posts.limit(1){name,likes.summary(true),total_count,},checkins,engagement,fan_count,overall_star_rating,events.limit(1){name,attending_count,declined_count,interested_count,description,cover}';
    var searchType = 'page';
    const options = {
        method: 'GET',
        uri: 'https://graph.facebook.com/v2.10/search/',
        qs: {
            access_token: '778609825679453|i_EEmwEy9_ZLUxcmnafb4-IuPXM',
            q: req.body.name,
            type: 'page',
            fields: pageFieldSet
        }
    };

    request(options, function (err, resp, body) {
        // global.restaurantData = JSON.parse(body);
        // console.log(global.restaurantData);
        // res.json(global.restaurantData);
        res.json(JSON.parse(body));
        global.db.collection('restaurantData').insert({
            data: JSON.parse(body)
        });

    })

})
app.post('/dbData', function (req, res) {
    global.db.collection('restaurantData').find({}).toArray(function (err, result) {
        if (err) throw err;
        global.findResult = result;
        res.send(global.findResult);
    })
    
})
app.listen(port);
console.log('Server started! At http://localhost:' + port);