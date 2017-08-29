var searchData = {};
var dbData = [];
var keyArr = [];
var existingKeys;
$('document').ready(function () {
    makeTemplates();
    getKeys();
    setValues();
})
bind('.mainContainer .topBar .optionsContainer .add .addRestaurant', function () {
    searchData.zomato = $('.zomato').val().trim();
    searchData.facebook = $('.facebook').val().trim();
    searchData.tripAdvisor = $('.tripadvisor').val().trim();
    searchData.instagram = $('.instagram').val().trim();
    $('.mainContainer .dataLoader').show();
    getKeys();
    execute('fetchData', searchData, function (data) {
        console.log(data);
        rb('.mainContainer .card', 'data', data);
        $('.mainContainer .dataLoader').hide();
        screenBind();
    })
    console.log(searchData);
})
var popupScroll = $('.mainContainer .eventPopup .eventContainer');

var scrollVar = $('.mainContainer .pageContainer');
lastY = scrollVar.scrollTop(),
    lastX = scrollVar.scrollLeft();

scrollVar.on('scroll', function () {
    var currY = scrollVar.scrollTop(),
        currX = scrollVar.scrollLeft(),

        // determine current scroll direction
        x = (currX > lastX) ? 'right' : ((currX === lastX) ? 'none' : 'left'),
        y = (currY > lastY) ? 'down' : ((currY === lastY) ? 'none' : 'up');

    if (x == 'right' || x == 'left') {
        $('.mainContainer .pageContainer .card').css("overflow-x",  "scroll");
        $('.mainContainer .pageContainer .card .columnContainer .pageTopContainer').css("position", "absolute");
    } else if (y == "top" || y == "down") {
        $('.mainContainer .pageContainer .card').css("overflow-x", "initial");
        $('.mainContainer .pageContainer .card .columnContainer .pageTopContainer').css("position", "fixed");
    }
    console.log(x + ', ' + y);
    lastY = currY;
    lastX = currX;
});

bind('.google', function () {
    console.log("Google");
    $('.mainContainer .mapPopup').show();
    initMap();
})

function screenBind() {
    bind('.mainContainer .topBar .optionsContainer .refreshData .refreshRestaurant', function () {
        $('.mainContainer .dataLoader').show();
        execute('fetchData', searchData, function (data) {
            console.log(data);
            rb('.mainContainer .card', 'data', data);
            $('.mainContainer .dataLoader').hide();
            screenBind();
        })
        console.log(searchData);
    })
    bind('.overlay', function () {
        $('.overlay').hide();
        $('.eventPopup').hide();
    })
    bind('.event', function () {
        $('.overlay').show();
        $('.eventPopup').show();
        $('dataLoader').show();
        execute('getDetails', {
            dbData
        }, function (data) {
            console.log(data);
            var x = {
                eventData: data,
                days: []
            };
            for (var i = 0; i < data.length; i++) {
                x.days.push({
                    day: data[i].day
                })
            }
            console.log(x);
            rb('.eventPopup', 'eventPopup', x, dbData);
        })
    })
    bind('.mainContainer .overlay', function () {
        $('.eventPopup').hide();
        $(this).hide();
    })
}

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 28.6139,
            lng: 77.2090
        },
        zoom: 13
    });

    var input = document.getElementById('google');

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);
    autocomplete.addListener('place_changed', function () {

        var place = autocomplete.getPlace();
        if (!place.geometry) {
            return;
        }
        searchData.google = place.place_id;
        console.log(searchData);
    });
}

function getKeys() {
    execute('existingKey',{}, function (keys) {

        for (var i = 0; i < keys.length; i++) {
            keyArr[keys[i]._id] = keys[i].data;
        }
        for (var key in keyArr) {
            console.log(key);
        }
        console.log(keyArr);
    })
}

function setValues() {
    $('.zomato').keypress(function (e) {
        if (e.which == 13) {
            $('.mainContainer .searchLoader').show();
            var key = $(this).val().trim();
            key = key.toLowerCase().replace(/\b[a-z]/g, function (letter) {
                return letter.toUpperCase();
            });
            var found = false;
            for (var i in keyArr) {
                if (key == i) {
                    $('.zomato').val(keyArr[i].zomato);
                    $('.facebook').val(keyArr[i].facebook);
                    $('.tripadvisor').val(keyArr[i].tripAdvisor);
                    $('.google').val(keyArr[i].google);
                    $('.instagram').val(keyArr[i].instagram);
                    $('.dineout').val(keyArr[i].dineout);
                    $('.mainContainer .searchLoader').hide();
                    found = true;
                }
            }
            if(!found){
                generatePopup();
                $('.zomato').val('');
                    $('.facebook').val('');
                    $('.tripadvisor').val('');
                    $('.google').val('');
                    $('.instagram').val('');
                    $('.dineout').val('');
                    $('.mainContainer .searchLoader').hide();
            }
            return false;
        }
    });
}
function generatePopup(){
    $('.mainContainer .searchLoader').hide();
    var popup = $('.mainContainer .topBar .detailsPopup');
    popup.show();
    setTimeout(function(){
        popup.hide();
    },1000)
}