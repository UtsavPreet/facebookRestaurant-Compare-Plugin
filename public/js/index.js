var searchData = {};
var dbData =[];
$('document').ready(function () {
    makeTemplates();
})
bind('.mainContainer .topBar .addButton', function () {
    searchData.zomato = $('.zomato').val().trim();
    searchData.facebook = $('.facebook').val().trim();
    searchData.tripAdvisor = $('.tripadvisor').val().trim();
    searchData.instagram = $('.instagram').val().trim();
    searchData.google = $('.google').val().trim();
    $('.mainContainer .dataLoader').show();
    execute('fetchData', searchData, function (data) {
        console.log(data);
        rb('.mainContainer .card', 'data', data);
        $('.mainContainer .dataLoader').hide();
        for (var i = 0; i < data.length; i++) {
            dbData.push({name:data[i].facebook.name_with_location_descriptor});
        }
        console.log(dbData);
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

function screenBind() {
    bind('.overlay', function () {
        $('.overlay').hide();
        $('.eventPopup').hide();
    })
    bind('.event', function () {
        $('.overlay').show();
        $('.eventPopup').show();
        $('dataLoader').show();
        execute('getDetails',{dbData}, function (data) {
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