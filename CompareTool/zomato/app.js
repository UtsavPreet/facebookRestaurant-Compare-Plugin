var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');

var request = require("request");
var Promise = require('promise');
var async = require('async');

var bodyParser = require('body-parser');
var urlencodedParser = app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname + '/Public')))

var key = '64a15965a23b35c5f3bcd258c4b75e56';
var Zomato = require('node-zomato');
var api = new Zomato(key);

var MongoClient = require('mongodb').MongoClient;


app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/Public/view/index.html'));
})

var restaurantId;
global.db;


MongoClient.connect("mongodb://localhost:27017/restaurent", function(err, db) {
    if (err) {
        console.log(err);
    }
    console.log("connected");
    global.db = db;
});


app.post('/restaurantDetail', function(req, res) {

    api.verify(function(isVerified) {
        console.log(isVerified);
        if (isVerified === false) {
            process.exit();
        }
    });

    findCompetitor(req.body, (r) => {
        // res.json(r)
        console.log(r);
        res.send(r);
    });
})

function findCompetitor(body, cb) {
    var resultDb;
    var a = {};
    a['restaurants'] = [];
    global.db.collection('competitors').find({ "restaurantName": body.name }).toArray(function(err, item) {
        if (err)
            throw err;
        if (!item.length) {
            console.log(item.length);
            global.db.collection('competitors').save({ restaurantName: body.name });
            cb(a);
        } else {
            async.forEachSeries(item[0].competitor, function(item1, callback1) {
                var fname = item1.name;
                if (fname !== undefined) {
                    getDetail(fname, function(r1) {
                        a.restaurants.push(r1);
                        callback1();
                    })
                } else
                    callback1();
            }, function() {
                cb(a);
            })
        }
    })
}


// global.db.collection('competitors').find(function(error, cursor) {
//     if (error)
//         console.log("error in fetching items");
//     else {
//         a['restaurants'] = [];
//         cursor.toArray(function(error, data) {




//         });
//     }
// })
// }

function getDetail(fname, cb) {
    global.db.collection('zomatoRestaurantData').find(function(error, cursor) {
        {
            cursor.toArray(function(error, items) {
                for (var k in items[0].restaurants) {
                    if (items[0].restaurants[k].restaurant.name == fname) {
                        return cb(items[0].restaurants[k]);
                    }
                }
            });
        };
    })
}


app.post('/getRtsReviews', function(req, res) {
    var r = req.body;
    var arr = [];
    async.forEachSeries(r.restaurants, function(rt, callback) {
        request({
            headers: {
                'user-key': key,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            url: addUrlParam('reviews', "res_id", rt.restaurant.id),
            method: 'GET'
        }, function(err, resp1, body) {
            if (err)
                throw (err);
            else
                rt.restaurant.reviewCount = JSON.parse(body).reviews_count;
            callback();

        })
    }, function(err) {
        res.json(r);
    })
})


app.post('/review', function(req, res) {
    console.log(req.body.restaurantId);
    request({
        headers: {
            'user-key': key,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        url: addUrlParam('reviews', "res_id", req.body.restaurantId),
        method: 'GET'
    }, function(err, resp1) {
        if (err)
            throw (err);
        else
            res.send(resp1.body);

    })
})

app.post('/addRestaurant', function(req, res) {

    request({
        headers: {
            'user-key': req.body.id,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        url: addUrlParam('search', "q", req.body.newRestaurant),
        method: 'GET',
    }, function(err, resp) {
        if (err)
            throw (err);
        else {
            // console.log(url);
            var x = JSON.parse(resp.body);
            // restaurantId = (x.restaurants[0].restaurant.id);
            var z = filterData(x.restaurants[0]);
            console.log(z);
            res.send(z);

            global.db.collection('zomatoRestaurantData').update({}, { $push: { 'restaurants': z } });

            global.db.collection('competitors').update({ 'restaurantName': req.body.name }, { '$push': { 'competitor': { 'name': z.restaurant.name } } });

        }
    })
})


function addUrlParam(search, key, value) {
    var url = 'https://developers.zomato.com/api/v2.1/' + search;
    var newParam = key + "=" + value;
    var result = url.replace(new RegExp("(&|\\?)" + key + "=[^\&|#]*"), '$1' + newParam);
    if (result === url) {
        result = (url.indexOf("?") != -1 ? url.split("?")[0] + "?" + newParam + "&" + url.split("?")[1] :
            (url.indexOf("#") != -1 ? url.split("#")[0] + "?" + newParam + "#" + url.split("#")[1] :
                url + '?' + newParam));
    }
    if (result == ("https://developers.zomato.com/api/v2.1/search?q=" + value))
        result = result + '&count=1&entity_id=1';
    return result;
}

function filterData(data) {
    result = {
        "restaurant": {
            "average_cost_for_two": data.restaurant.average_cost_for_two,
            "cuisines": data.restaurant.cuisines,
            "id": data.restaurant.id,
            "name": data.restaurant.name,
            "price_range": data.restaurant.price_range,
            "user_rating": {
                "aggregate_rating": data.restaurant.user_rating.aggregate_rating,
                "rating_text": data.restaurant.user_rating.rating_text,
                "votes": data.restaurant.user_rating.votes,
            }
        }
    };
    return result;
}

http.listen(4000, function() {
    console.log('listening on *:4000');
});




// db.collection('zomatoRestaurantData').find(function(error, cursor) {
//     if (error || !cursor) {
//         console.log("error getting items");
//     } else {
//         cursor.toArray(function(error, items) {
//             if (error || !items) {
//                 console.log("error getting items");
//             } else {
//                 res.send(JSON.stringify(items));
//             }
//         });
//     };
// })