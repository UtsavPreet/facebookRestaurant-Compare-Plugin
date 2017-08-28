<<<<<<< HEAD
var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var bodyParser = require('body-parser');
var getAccountStats = require('instagram-scrape-account-stats').getAccountStats;
var googleKey = 'AIzaSyDrCOoCxVK5kjPvkwZFYXbVzYgqXmyzWfo';
var GOOGLE_PLACES_OUTPUT_FORMAT = "json";
var PlaceDetailsRequest = require('./node_modules/googleplaces/lib/PlaceDetailsRequest.js');
var placeDetailsRequest = new PlaceDetailsRequest(googleKey, GOOGLE_PLACES_OUTPUT_FORMAT);
var fb = require("fb")
fb.setAccessToken('778609825679453|i_EEmwEy9_ZLUxcmnafb4-IuPXM');
var mongo = require('mongodb').MongoClient;
var async = require('async');
var asyncP = require('async-promises');
var moment = require('moment');
var url = 'mongodb://localhost:27017/restaurant';
const cheerio = require('cheerio');
var request = require("request");
var zomatoJs = require("zomato.js");
var z = new zomatoJs('64a15965a23b35c5f3bcd258c4b75e56');
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
global.totalEvent = {};
global.totalPost = {};
var restaurantObj = {};
global.dbData;
app.post('/fetchData', function (req, resp) {

    if (req.body.zomato == '' || req.body.facebook == '' || req.body.tripAdvisor == '' || req.body.google == '' || req.body.instagram == '') {
        global.db.collection('restaurantData').find({}).toArray(function (err, result) {
            global.dbData = result;
            resp.send(result);
        })
    } else {
        async.parallel(
            [
                zomato.bind(null, req.body.zomato), facebook.bind(null, req.body.facebook), tripAdvisor.bind(null, req.body.tripAdvisor), google.bind(null, req.body.google), instagram.bind(null, req.body.instagram)
            ],
            // optional callback
            function (err, results) {
                global.dbData = [];
                global.db.collection('restaurantData').save(restaurantObj);
                global.db.collection('restaurantData').find({}).toArray(function (err, result) {
                    if (err) throw err;
                    resp.send(result);
                    console.log(result);
                })
                console.log("data saved");
            });
    }
});

app.post('/getDetails', function (req, resp) {

    var dates = [];
    for (var i = 1; i < 32; i++) {
        dates.push({
            day: i
        })
    }
    // global.names.forEach(function(element){
    //     dates.push({
    //         name: element.name
    //     })
    // })
    var data;
    global.db.collection('restaurantData').find({}).toArray(function (err, result) {
        if (err) throw err;
        var eventData = [];
        var eventsArray = [];
        for (var i = 0; i < result.length; i++) {
            eventsArray[result[i].facebook.name_with_location_descriptor] = {
                allEvents: result[i].facebook.events.data
            };
        }

        dates.forEach(function (element) {
            eventData.push({
                day: element.day,
                rts: []
            })
        })
        for (var i = 0; i < eventData.length; i++) {
            for (var key in eventsArray) {
                eventsArray[key].allEvents.forEach(function (detail) {
                    if (eventData[i].day == detail.date && detail.month == "08") {
                        eventData[i].rts.push({
                            name: key,
                            events: detail
                        })
                    }
                });
            };
        };
        for (var i = 0; i < eventData.length; i++) {
            if (eventData[i].rts.length !== global.names.length) {
                eventData[i].rts.push({
                    events: []
                })
            }
        }
        resp.json(eventData);
        console.log(eventData);
    })
})

function zomato(name, res) {
    setTimeout(function () {
        var resID;
        var x;
        z
            .search({
                entity_id: 1,
                entity_type: 'city',
                q: name,
                count: 1
            })
            .then(function (data) {
                console.log(data);
                x = data[0];
                resID = data[0].R.res_id
                z
                    .reviews({
                        res_id: resID
                    })
                    .then(function (data) {
                        x.userReview = data;
                        console.log(data);
                        restaurantObj = {
                            _id: resID,
                            nDay: parseInt(moment().format('YYYYMMDD')),
                            fetchedAt: new Date().getTime(),
                            zomato: x
                        }
                        res(null, restaurantObj.zomato);
                    })
            })
    }, 5000);
}

function facebook(id, res) {
    setTimeout(function () {
        fb.api('', 'post', {
            batch: [{
                method: 'get',
                relative_url: id + '?fields=name_with_location_descriptor,picture,location,talking_about_count,checkins,fan_count,overall_star_rating,about,cover,feed{name,id,created_time,shares,likes.limit(0).summary(true),comments.limit(0).summary(true),message.limit(0).summary(true),reactions.limit(0).summary(true),status_type},events.limit(10){name,description,attending_count,cover,declined_count,start_time,interested_count}&since=2017-08-06&until=2017-08-07'
            }, ]
        }, function (res1) {
            try {
                res0 = JSON.parse(res1[0].body);
                global.totalPost.count = res0.feed.data.length;
                res0.feed.totalPost = res0.feed.data.length;
                totalEvent.count = res0.events.data.length;
                totalPost.likes = 0;
                totalPost.comments = 0;
                totalPost.reactions = 0;
                for (var i = 0; i < res0.feed.data.length; i++) {
                    res0.feed.data[i].created_time = res0.feed.data[i].created_time.substr(0, 10);
                    global.totalPost.likes += res0.feed.data[i].likes.summary.total_count;
                    global.totalPost.comments += res0.feed.data[i].comments.summary.total_count;
                    global.totalPost.reactions += res0.feed.data[i].reactions.summary.total_count;

                }
                res0.totalPost = totalPost;
                totalEvent.attendingCount = 0;
                for (var i = 0; i < res0.events.data.length; i++) {
                    res0.events.data[i].start_time = res0.events.data[i].start_time.substr(0, 10);
                    res0.events.data[i].date = res0.events.data[i].start_time.substr(8, 2);
                    res0.events.data[i].month = res0.events.data[i].start_time.substr(5, 2);
                    global.totalEvent.attendingCount += res0.events.data[i].attending_count;
                }
                res0.totalEvent = totalEvent;
                restaurantObj.facebook = res0;
            } catch (e) {
                console.log('Unable to get FB data ' + e);
                restaurantObj.facebook = {};
            }
            res(null, restaurantObj.facebook);
        });
    }, 5000);


}

function tripAdvisor(url, res) {
    setTimeout(function () {
        var selector;
        request(url, function (err, res1, html) { //url 
            if (!err && res1.statusCode == 200) {
                selector = cheerio.load(html);
                filterData(selector, function (r1) {
                    restaurantObj.tripAdvisor = r1;
                    res(null, restaurantObj.tripAdvisor);
                });

            }
        })
    }, 5000);

}

function google(placeId, res) {
    var googleData;
    setTimeout(function () {
        var $;
        placeDetailsRequest({
            placeid: placeId
        }, function (error, response) {
            if (error) {
                console.log('Unable to get Google data');
                console.log(error);
                restaurantObj.google = {};
            } else {
                if (response.result) {
                    googleData = response.result;
                    request(googleData.url, function (err, res1, html) {
                        if (!err && res1.statusCode == 200) {
                            googlefilterData(html, function (r1) {
                                googleData.userReviewCount = r1;
                                restaurantObj.google = googleData;
                            });

                        }
                    })
                } else {
                    restaurantObj.google = {};
                }
                res(null, restaurantObj.google);
            }
        });

    }, 5000);


}

function instagram(userName, res) {
    setTimeout(function (err) {
        if (err) throw err;
        getAccountStats({
            username: userName
        }).then(function (account) {
            restaurantObj.instagram = account;
            res(null, restaurantObj.instagram);
        });

    }, 5000);
};

function googlefilterData(html, cb) {
    var reviewCount;
    html = html.toString();
    var ii = html.indexOf(' reviews');
    var ss = html.substring(ii - 6, ii + 7);
    ss = ss.replace('"', '').split(',');
    if (ss.length > 1)
        reviewCount = parseInt(ss[ss.length - 1].split(' ')[0]);
    else
        reviewCount = parseInt(ss[0].split(' ')[0]);
    cb(reviewCount);
}

function filterData(selector, cb) {
    var restaurant = {};
    var name;
    name = selector('.heading_title ').text();
    restaurant.name = name.replace(/\n/gi, '');
    restaurant.ranking = selector('.header_popularity.popIndexValidation').find('span').text();
    restaurant.totalReview = selector('.rating .seeAllReviews').text();
    var restaurantDetail = selector('.details_tab .table_section .row .content').text().split('\n\n');
    restaurant.cuisines = selector('DIV.ppr_rup.ppr_priv_restaurants_detail_info_content .cuisines .text').text();
    var reviewDetail = selector('DIV.prw_rup.prw_common_ratings_histogram_overview .row_count').text().split('%');
    restaurant.rating = selector('DIV.ppr_rup.ppr_priv_location_detail_overview .rating').children('.overallRating').text()
    restaurant.reviewDetail = {};
    restaurant.reviewDetail.excellent = reviewDetail[0];
    restaurant.reviewDetail.veryGood = reviewDetail[1];
    restaurant.reviewDetail.average = reviewDetail[2];
    restaurant.reviewDetail.poor = reviewDetail[3];
    restaurant.reviewDetail.terrible = reviewDetail[4];

    // var ratingSummaryArray = [];
    // for (var i = 0; i < 3; i++) {
    //     ratingSummaryArray.push(selector('.details_tab .table_section .row .barChart .row.part').children('.ui_bubble_rating')[i].attribs.alt.replace(' of 5 bubbles', ''));
    // }
    // restaurant.ratingSummary = {};
    // restaurant.ratingSummary.food = ratingSummaryArray[0];
    // restaurant.ratingSummary.service = ratingSummaryArray[1];
    // restaurant.ratingSummary.value = ratingSummaryArray[2];

    restaurant['userReviews'] = [];
    selector('DIV.ppr_rup.ppr_priv_location_reviews_container .review.hsx_review').each(function (index, el, callback) {
        var userReview = {};
        var bg = selector(el).find('DIV.prw_rup.prw_common_centered_image .imgWrap.fixedAspect .centeredImg').html();
        userReview.userName = selector(el).find('DIV.prw_rup.prw_reviews_member_info_hsx .username .scrname').text();
        userReview.quote = selector(el).find('.noQuotes').text();
        userReview.date = selector(el).find('.ratingDate').attr('title');
        userReview.reviewText = selector(el).find('DIV.prw_rup.prw_reviews_text_summary_hsx .entry .partial_entry').text();

        userReview.userId = selector(el).find('.memberOverlayLink').attr('id').replace('UID_', '').split('-');
        // userReview.data = userDetail(userReview.userId[0], function(data) {
        // userReview.userProfile = data
        // });
        restaurant.userReviews.push(userReview);
    })
    tripAdvisorData = restaurant;
    cb(restaurant);
}
app.listen(port);
=======
var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var bodyParser = require('body-parser');
var getAccountStats = require('instagram-scrape-account-stats').getAccountStats;
var googleKey = 'AIzaSyDrCOoCxVK5kjPvkwZFYXbVzYgqXmyzWfo';
var GOOGLE_PLACES_OUTPUT_FORMAT = "json";
var PlaceDetailsRequest = require('./node_modules/googleplaces/lib/PlaceDetailsRequest.js');
var placeDetailsRequest = new PlaceDetailsRequest(googleKey, GOOGLE_PLACES_OUTPUT_FORMAT);
var fb = require("fb")
fb.setAccessToken('778609825679453|i_EEmwEy9_ZLUxcmnafb4-IuPXM');
var mongo = require('mongodb').MongoClient;
var async = require('async');
var asyncP = require('async-promises');
var moment = require('moment');
var url = 'mongodb://localhost:27017/restaurant';
const cheerio = require('cheerio');
var request = require("request");
var zomatoJs = require("zomato.js");
var z = new zomatoJs('64a15965a23b35c5f3bcd258c4b75e56');
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
global.totalEvent = {};
global.totalPost = {};
var restaurantObj = {};
global.dbData;
app.post('/fetchData', function (req, resp) {

    if (req.body.zomato == "" || req.body.facebook == "" || req.body.google == "" || req.body.tripAdvisor == "" || req.body.instagram == "") {
        global.db.collection('restaurantData').find({}).toArray(function (err, result) {
            global.dbData = result;
            resp.send(result);
        })
    } else {
        async.parallel(
            [
                zomato.bind(null, req.body.zomato), facebook.bind(null, req.body.facebook), tripAdvisor.bind(null, req.body.tripAdvisor), google.bind(null, req.body.google), instagram.bind(null, req.body.instagram)
            ],
            // optional callback
            function (err, results) {
                global.dbData = [];
                global.db.collection('restaurantData').save(restaurantObj,function(){
                    global.db.collection('restaurantData').find({}).toArray(function (err, result) {
                        if (err) throw err;
                        resp.send(result);
                        console.log(result);
                    })
                });
               
                console.log("data saved");
            });
    }
});

app.post('/getDetails', function (req, resp) {

    var dates = [];
    for (var i = 1; i < 32; i++) {
        dates.push({
            day: i
        })
    }
    // global.names.forEach(function(element){
    //     dates.push({
    //         name: element.name
    //     })
    // })
    var data;
    global.db.collection('restaurantData').find({}).toArray(function (err, result) {
        if (err) throw err;
        var eventData = [];
        var eventsArray = [];
        for (var i = 0; i < result.length; i++) {
            eventsArray[result[i].facebook.name_with_location_descriptor] = {
                allEvents: result[i].facebook.events.data
            };
        }

        dates.forEach(function (element) {
            eventData.push({
                day: element.day,
                rts: []
            })
        })
        for (var i = 0; i < eventData.length; i++) {
            for (var key in eventsArray) {
                eventsArray[key].allEvents.forEach(function (detail) {
                    if (eventData[i].day == detail.date && detail.month == "08") {
                        eventData[i].rts.push({
                            name: key,
                            events: detail
                        })
                    }
                });
            };
        };
        resp.json(eventData);
        console.log(eventData);
    })
})

function zomato(name, res) {
    setTimeout(function () {
        var resID;
        var x;
        z
            .search({
                entity_id: 1,
                entity_type: 'city',
                q: name,
                count: 1
            })
            .then(function (data) {
                console.log(data);
                x = data[0];
                resID = data[0].R.res_id
                z
                    .reviews({
                        res_id: resID
                    })
                    .then(function (data) {
                        x.userReview = data;
                        console.log(data);
                        restaurantObj = {
                            _id: resID,
                            nDay: parseInt(moment().format('YYYYMMDD')),
                            fetchedAt: new Date().getTime(),
                            zomato: x
                        }
                        res(null, restaurantObj.zomato);
                    })
            })
    }, 5000);
}

function facebook(id, res) {
    setTimeout(function () {
        fb.api('', 'post', {
            batch: [{
                method: 'get',
                relative_url: id + '?fields=name_with_location_descriptor,picture,location,talking_about_count,checkins,fan_count,overall_star_rating,about,cover,feed{name,id,created_time,shares,likes.limit(0).summary(true),comments.limit(0).summary(true),message.limit(0).summary(true),reactions.limit(0).summary(true),status_type},events.limit(10){name,description,attending_count,cover,declined_count,start_time,interested_count}&since=2017-08-06&until=2017-08-07'
            }, ]
        }, function (res1) {
            try {
                res0 = JSON.parse(res1[0].body);
                global.totalPost.count = res0.feed.data.length;
                res0.feed.totalPost = res0.feed.data.length;
                totalEvent.count = res0.events.data.length;
                totalPost.likes = 0;
                totalPost.comments = 0;
                totalPost.reactions = 0;
                for (var i = 0; i < res0.feed.data.length; i++) {
                    res0.feed.data[i].created_time = res0.feed.data[i].created_time.substr(0, 10);
                    global.totalPost.likes += res0.feed.data[i].likes.summary.total_count;
                    global.totalPost.comments += res0.feed.data[i].comments.summary.total_count;
                    global.totalPost.reactions += res0.feed.data[i].reactions.summary.total_count;

                }
                res0.totalPost = totalPost;
                totalEvent.attendingCount = 0;
                for (var i = 0; i < res0.events.data.length; i++) {
                    res0.events.data[i].start_time = res0.events.data[i].start_time.substr(0, 10);
                    res0.events.data[i].date = res0.events.data[i].start_time.substr(8, 2);
                    res0.events.data[i].month = res0.events.data[i].start_time.substr(5, 2);
                    global.totalEvent.attendingCount += res0.events.data[i].attending_count;
                }
                res0.totalEvent = totalEvent;
                restaurantObj.facebook = res0;
            } catch (e) {
                console.log('Unable to get FB data ' + e);
                restaurantObj.facebook = {};
            }
            res(null, restaurantObj.facebook);
        });
    }, 5000);


}

function tripAdvisor(url, res) {
    setTimeout(function () {
        var selector;
        request(url, function (err, res1, html) { //url 
            if (!err && res1.statusCode == 200) {
                selector = cheerio.load(html);
                filterData(selector, function (r1) {
                    restaurantObj.tripAdvisor = r1;
                    res(null, restaurantObj.tripAdvisor);
                });

            }
        })
    }, 5000);

}

function google(placeId, res) {
    var googleData;
    setTimeout(function () {
        var $;
        placeDetailsRequest({
            placeid: placeId
        }, function (error, response) {
            if (error) {
                console.log('Unable to get Google data');
                console.log(error);
                restaurantObj.google = {};
            } else {
                if (response.result) {
                    googleData = response.result;
                    request(googleData.url, function (err, res1, html) {
                        if (!err && res1.statusCode == 200) {
                            googlefilterData(html, function (r1) {
                                googleData.userReviewCount = r1;
                                restaurantObj.google = googleData;
                            });

                        }
                    })
                } else {
                    restaurantObj.google = {};
                }
                res(null, restaurantObj.google);
            }
        });

    }, 5000);


}

function instagram(userName, res) {
    setTimeout(function (err) {
        if (err) throw err;
        getAccountStats({
            username: userName
        }).then(function (account) {
            restaurantObj.instagram = account;
            res(null, restaurantObj.instagram);
        });

    }, 5000);
};

function googlefilterData(html, cb) {
    var reviewCount;
    html = html.toString();
    var ii = html.indexOf(' reviews');
    var ss = html.substring(ii - 6, ii + 7);
    ss = ss.replace('"', '').split(',');
    if (ss.length > 1)
        reviewCount = parseInt(ss[ss.length - 1].split(' ')[0]);
    else
        reviewCount = parseInt(ss[0].split(' ')[0]);
    cb(reviewCount);
}

function filterData(selector, cb) {
    var restaurant = {};
    var name;
    name = selector('.heading_title ').text();
    restaurant.name = name.replace(/\n/gi, '');
    restaurant.ranking = selector('.header_popularity.popIndexValidation').find('span').text();
    restaurant.totalReview = selector('.rating .seeAllReviews').text();
    var restaurantDetail = selector('.details_tab .table_section .row .content').text().split('\n\n');
    restaurant.cuisines = selector('DIV.ppr_rup.ppr_priv_restaurants_detail_info_content .cuisines .text').text();
    var reviewDetail = selector('DIV.prw_rup.prw_common_ratings_histogram_overview .row_count').text().split('%');
    restaurant.rating = selector('DIV.ppr_rup.ppr_priv_location_detail_overview .rating').children('.overallRating').text()
    restaurant.reviewDetail = {};
    restaurant.reviewDetail.excellent = reviewDetail[0];
    restaurant.reviewDetail.veryGood = reviewDetail[1];
    restaurant.reviewDetail.average = reviewDetail[2];
    restaurant.reviewDetail.poor = reviewDetail[3];
    restaurant.reviewDetail.terrible = reviewDetail[4];

    // var ratingSummaryArray = [];
    // for (var i = 0; i < 3; i++) {
    //     ratingSummaryArray.push(selector('.details_tab .table_section .row .barChart .row.part').children('.ui_bubble_rating')[i].attribs.alt.replace(' of 5 bubbles', ''));
    // }
    // restaurant.ratingSummary = {};
    // restaurant.ratingSummary.food = ratingSummaryArray[0];
    // restaurant.ratingSummary.service = ratingSummaryArray[1];
    // restaurant.ratingSummary.value = ratingSummaryArray[2];

    restaurant['userReviews'] = [];
    selector('DIV.ppr_rup.ppr_priv_location_reviews_container .review.hsx_review').each(function (index, el, callback) {
        var userReview = {};
        var bg = selector(el).find('DIV.prw_rup.prw_common_centered_image .imgWrap.fixedAspect .centeredImg').html();
        userReview.userName = selector(el).find('DIV.prw_rup.prw_reviews_member_info_hsx .username .scrname').text();
        userReview.quote = selector(el).find('.noQuotes').text();
        userReview.date = selector(el).find('.ratingDate').attr('title');
        userReview.reviewText = selector(el).find('DIV.prw_rup.prw_reviews_text_summary_hsx .entry .partial_entry').text();

        userReview.userId = selector(el).find('.memberOverlayLink').attr('id').replace('UID_', '').split('-');
        // userReview.data = userDetail(userReview.userId[0], function(data) {
        // userReview.userProfile = data
        // });
        restaurant.userReviews.push(userReview);
    })
    tripAdvisorData = restaurant;
    cb(restaurant);
}
app.listen(port);
>>>>>>> d35e78ab2d8cfe2c7a30621aad9986ab7f86f9c5
console.log('Server started! At http://localhost:' + port);