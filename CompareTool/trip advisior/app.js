var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');

var request = require("request");

var async = require('async');

var bodyParser = require('body-parser');
var urlencodedParser = app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname + '/Public')))

var MongoClient = require('mongodb').MongoClient;
global.db;
MongoClient.connect("mongodb://localhost:27017/restaurent", function(err, db) {
    if (err) {
        throw (err);
    }
    console.log("connected");
    global.db = db;
});


app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/Public/view/index.html'));
})

var $;
const cheerio = require('cheerio');


app.post('/fetchData', function(req, res) {
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
    global.db.collection('newCompetitors').find({ "restaurantName": body.name }).toArray(function(err, item) {
        if (err)
            throw err;
        if (!item.length) {
            console.log(item.length);
            global.db.collection('newCompetitors').save({ restaurantName: body.name });
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


function getDetail(fname, cb) {
    global.db.collection('tripAdvisorRestaurantData').find(function(error, cursor) {
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




app.post('/restaurantDetail', function(req, resp) {
    var data;
    request(req.body.newRestaurant, function(err, res, html) { //url 
        if (!err && res.statusCode == 200) {
            console.log("successfully inserted");
            $ = cheerio.load(html);
            filterData($, function(data) {
                global.db.collection('tripAdvisorRestaurantData').save({
                    _id: data.name,
                    detail: data,
                });
                resp.send(data);
            });
        }
    })
})



function filterData($, cb) {
    var restaurant = {};
    var name;
    name = $('.heading_title ').text();
    restaurant.name = name.replace(/\n/gi, '');
    restaurant.ranking = $('.header_popularity.popIndexValidation').find('span').text();
    restaurant.totalReview = $('.rating .seeAllReviews').text();
    var restaurantDetail = $('.details_tab .table_section .row .content').text().split('\n\n');
    restaurant.cuisines = $('DIV.ppr_rup.ppr_priv_restaurants_detail_info_content .cuisines .text').text();
    var reviewDetail = $('DIV.prw_rup.prw_common_ratings_histogram_overview .row_count').text().split('%');
    restaurant.rating = $('DIV.ppr_rup.ppr_priv_location_detail_overview .rating').children('.overallRating').text()
    restaurant.reviewDetail = {};
    restaurant.reviewDetail.excellent = reviewDetail[0];
    restaurant.reviewDetail.veryGood = reviewDetail[1];
    restaurant.reviewDetail.average = reviewDetail[2];
    restaurant.reviewDetail.poor = reviewDetail[3];
    restaurant.reviewDetail.terrible = reviewDetail[4];

    var ratingSummaryArray = [];
    for (var i = 0; i < 3; i++) {
        ratingSummaryArray.push($('.details_tab .table_section .row .barChart .row.part').children('.ui_bubble_rating')[i].attribs.alt.replace(' of 5 bubbles', ''));
    }
    restaurant.ratingSummary = {};
    restaurant.ratingSummary.food = ratingSummaryArray[0];
    restaurant.ratingSummary.service = ratingSummaryArray[1];
    restaurant.ratingSummary.value = ratingSummaryArray[2];

    restaurant['userReviews'] = [];
    $('DIV.ppr_rup.ppr_priv_location_reviews_container .review.hsx_review').each(function(index, el, callback) {
        var userReview = {};
        var bg = $(el).find('DIV.prw_rup.prw_common_centered_image .imgWrap.fixedAspect .centeredImg').html();
        userReview.userName = $(el).find('DIV.prw_rup.prw_reviews_member_info_hsx .username .scrname').text();
        userReview.quote = $(el).find('.noQuotes').text();
        userReview.date = $(el).find('.ratingDate').attr('title');
        userReview.reviewText = $(el).find('DIV.prw_rup.prw_reviews_text_summary_hsx .entry .partial_entry').text();

        userReview.userId = $(el).find('.memberOverlayLink').attr('id').replace('UID_', '').split('-');
        // userReview.data = userDetail(userReview.userId[0], function(data) {
            // userReview.userProfile = data
        // });
        restaurant.userReviews.push(userReview);
    })

    cb(restaurant);
}

// function userDetail(id, callback) {
//     request('https://www.tripadvisor.in/MemberOverlay?Mode=owa&uid=' + id + '&c=&fus=false&partner=false&LsoId=&metaReferer=Restaurant_Review', function(error, response, html) {

//         $ = cheerio.load(html);
//         var member = {};
//         member['badgeText'] = [];
//         member['reviewDistribution'] = [];
//         member.name = $('.username.reviewsEnhancements').text();
//         member.level = $('.badgeinfo').text();
//         member.description = $('.memberdescriptionReviewEnhancements').text();
//         $('.badgeTextReviewEnhancements').each(function(index, el) {
//                 member.badgeText.push($(this).text());
//             })
//             // console.log(level);
//         $('.wrap.container.histogramReviewEnhancements').each(function(index, el) {
//             member.reviewDistribution.push($(el).find('.rowCountReviewEnhancements.rowCellReviewEnhancements').text());
//         })
//         callback(member);
//     })
// }


app.post('/review', function(req, res) {
    global.db.collection('tripAdvisorRestaurantData').find({ _id: req.body.restaurantId }).toArray(function(err, item) {
        if (err)
            throw err;
        else
            res.send(item[0].detail);
    })

})






http.listen(3000, function() {
    console.log("Server started at *3000");
})