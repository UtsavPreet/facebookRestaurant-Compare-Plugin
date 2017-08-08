var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var graph = require('fbgraph');
var bodyParser = require('body-parser');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var async = require('async');
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
global.posts;
global.eventIds = [];
global.eventData = [];
global.pageID;
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
    global.pageID = req.body.name;
    graph.get(req.body.name + "?fields=name,talking_about_count,checkins,engagement,fan_count,overall_star_rating", function (err, res) {
        global.restaurantData = res;
        global.db.collection('restaurantData').save({
            _id: req.body.name,
            data: global.restaurantData
        });
    });
    graph.get(req.body.name + "/posts?since= 2017-07-01&&until= now", function (err, res) {
        global.posts = res;

        global.db.collection('restaurantData').update({
            _id: req.body.name
        }, {
            $set: {
                posts: res
            }
        })
        graph.get(req.body.name + "/events?since= 2017-07-01&&until= now", function (err, res) {
            global.posts = res;
            var counter = 0;
            var detail;
            // eventDetails(res);
            for (var i = 0; i < res.data.length; i++) {
                var eventID = res.data[i].id;
                console.log(eventID);
                graph.get(eventID + "?fields=name,description,attending_count,can_guests_invite,can_viewer_post,noreply_count,declined_count,interested_count,maybe_count", function (err, result) {
                    console.log(result);
                    global.eventData.push(result);
                    counter = 1;
                })
            }
            sendDBData(counter);
        })
    })
})
app.listen(port);
console.log('Server started! At http://localhost:' + port);

// function eventDetails(dataE) {

//     // async.forEachSeries(dataE.data,function(item,callback){
//     //     var eventID = item.id;
//     //         console.log(eventID);
//     //         graph.get(eventID + "?fields=name,description,attending_count,can_guests_invite,can_viewer_post,noreply_count,declined_count,interested_count,maybe_count", function (err, result) {
//     //             console.log(result);
//     //             global.eventData.push(result);
//     //         })
//     // },function(err, result) {
//     //     console.log(result);
//     //     // if result is true then every file exists
//     // });

//     for (var i = 0; i < dataE.data.length; i++) {
//         var eventID = dataE.data[i].id;
//         console.log(eventID);
//         graph.get(eventID + "?fields=name,description,attending_count,can_guests_invite,can_viewer_post,noreply_count,declined_count,interested_count,maybe_count", function (err, result) {
//             console.log(result);
//             global.eventData.push(result);
//         })
//     }
//     console.log(global.eventData);
// }
function sendDBData(count) {
    if (count == 1) {
        global.db.collection('restaurantData').update({
            _id: req.body.name
        }, {
            $set: {
                events: global.eventData
            }
        })
        global.db.collection('restaurantData').find({}).toArray(function (err, result) {
            if (err) throw err;
            global.findResult = result;
            resp.send(global.findResult);
        })
    } else if(count == 0){
        return false;
    }

}