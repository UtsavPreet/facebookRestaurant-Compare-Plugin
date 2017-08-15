var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var bodyParser = require('body-parser');
const Instagram = require('node-instagram').default;
const insta = new Instagram({
    clientId: '01168d11fa19484caf96adf0e57e539d',
    clientSecret: '7334c875b68047bf848dc1227b7ef534',
    accessToken: '5878424501.01168d1.986f3aba49744a3bb74ec8472bd717f6',
});

var googleKey = 'AIzaSyDrCOoCxVK5kjPvkwZFYXbVzYgqXmyzWfo';
var fb = require("fb")
fb.setAccessToken('778609825679453|i_EEmwEy9_ZLUxcmnafb4-IuPXM');
var mongo = require('mongodb').MongoClient;
var async = require('async');
var moment = require('moment');
var url = 'mongodb://localhost:27017/restaurant';
const cheerio = require('cheerio');
var request = require("request");
var key = "64a15965a23b35c5f3bcd258c4b75e56";
var Zomato = require('node-zomato');
var api = new Zomato(key);
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
var date = getDate();
global.totalEvent = {};
global.totalPost = {};
var facebookData;
var zomatoData;
var tripAdvisorData;
app.post('/fetchData', function (req, resp) {
    var arr = [];
    for (var key in req.body) {
        if (key != '' && req.body[key] != '')
            arr.push({
                key: key,
                id: req.body[key]
            });
    }

    async.forEachSeries(arr, function (item, cb) {
        eval(item.key)(item.id).then(function (r1) {
            cb();
        })
    }, function () {
        saveToDB(function () {
            console.log('All Data Saved');
        });

    })

});

function zomato(id) {
    return new Promise(function (res, rej) {
        api.verify(function (isVerified) {
            console.log(isVerified);
            if (isVerified === false) {
                process.exit();
            }
        });
        request({
            headers: {
                'user-key': key,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            url: addUrlParam('search', "q", id),
            method: 'GET',
        }, function (err, response) {
            if (err)
                throw (err);
            else {
                var x = JSON.parse(response.body);
                // restaurantId = (x.restaurants[0].restaurant.id);

                request({
                    headers: {
                        'user-key': key,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    url: addUrlParam('reviews', "res_id", id),
                    method: 'GET'
                }, function (err, resp1) {
                    if (err)
                        throw (err);

                    x.restaurants[0].restaurant.userReview = JSON.parse(resp1.body);
                    zomatoData = x.restaurants[0].restaurant;
                    res();
                })
            }
        })
    })
}

function facebook(facebookID) {
    return new Promise(function (res, rej) {
        fb.api('', 'post', {
            batch: [{
                method: 'get',
                relative_url: facebookID + '?fields=name_with_location_descriptor,picture,location,talking_about_count,checkins,fan_count,overall_star_rating,about,cover,feed{name,id,created_time,shares,likes.limit(0).summary(true),comments.limit(0).summary(true),message.limit(0).summary(true),reactions.limit(0).summary(true),status_type},events.limit(10){name,description,attending_count,cover,declined_count,start_time,interested_count}&since=2017-08-06&until=2017-08-07'
            }, ]
        }, function (res1) {
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
            facebookData = res0;
            res(facebookData);

        });
    })
}

function tripAdvisor(url) {
    return new Promise(function (res, rej) {
        var selector;
        request(url, function (err, res1, html) { //url 
            if (!err && res1.statusCode == 200) {
                selector = cheerio.load(html);
                filterData(selector, function (r1) {
                    tripAdvisorData = r1;
                    res(tripAdvisorData);
                });

            }
        })
    })
}



function google(pageId) {

}

function instagram(id) {}


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

    var ratingSummaryArray = [];
    for (var i = 0; i < 3; i++) {
        ratingSummaryArray.push(selector('.details_tab .table_section .row .barChart .row.part').children('.ui_bubble_rating')[i].attribs.alt.replace(' of 5 bubbles', ''));
    }
    restaurant.ratingSummary = {};
    restaurant.ratingSummary.food = ratingSummaryArray[0];
    restaurant.ratingSummary.service = ratingSummaryArray[1];
    restaurant.ratingSummary.value = ratingSummaryArray[2];

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

function getDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    today = yyyy + '/' + mm + '/' + dd;
    return today;
}

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

function saveToDB(cb) {

    var obj = {
        _id: new Date().getTime(),
        nDay: parseInt(moment().format('YYYYMMDD')),
        fetchedAt: new Date().getTime()
    };

    facebookData != undefined ? obj.fb = facebookData : '';
    zomatoData != undefined ? obj.zomato = zomatoData : '';
    tripAdvisorData != undefined ? obj.trip = tripAdvisorData : '';

    global.db.collection("restaurantData").save(obj, function (r) {
        cb(r);
    });
}

app.listen(port);
console.log('Server started! At http://localhost:' + port);