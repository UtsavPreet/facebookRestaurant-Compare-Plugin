var searchData = {};
var dbData = [];
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
        screenBind();
    })
    console.log(searchData);
})

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
        $('.mainContainer .pageContainer .card').css("overflow-x", "scroll");
    }
    else if(y == "top" || y == "down"){
        $('.mainContainer .pageContainer .card').css("overflow-x","initial");
    }

    console.log(x + ', ' + y);

    // update last scroll position to current position
    lastY = currY;
    lastX = currX;
});

function screenBind() {
    bind('.event', function () {
        var data;
        data.id = $('.event').attr("data-id");
        console.log(data);
        // $('.overlay').show();
        // $('.eventPopup').show();

        // execute('getDetails', data, function (data) {
        //     console.log(data);
        //      rb('.eventPopup', 'eventPopup',data);
        // })
    })
}