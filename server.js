var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var bodyParser = require('body-parser');
var request = require('request');
var router = express.Router();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
})); // support encoded bodies
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/views/index.html');
});
global.restaurantData;
app.post('/fetchData', function (req, res) {
    console.log(req.body);
    const pageFieldSet = 'name,posts.limit(2){name,actions,likes.summary(true),total_count},checkins,engagement,fan_count,restaurant_services,restaurant_specialties,overall_star_rating,events.limit(1){name,attending_count,declined_count,interested_count,description,cover}';
    var searchType = 'page';
    const options = {
        method: 'GET',
        uri: 'https://graph.facebook.com/v2.10/search',
        qs: {
            access_token: '778609825679453|i_EEmwEy9_ZLUxcmnafb4-IuPXM',
            q: req.body.name,
            type: 'page',
            fields: pageFieldSet
        }
    };

    request(options, function (err, resp, body) {
        global.restaurantData = JSON.parse(body);
        console.log(global.restaurantData);
        res.json(global.restaurantData);
    })

})
app.listen(port);
console.log('Server started! At http://localhost:' + port);