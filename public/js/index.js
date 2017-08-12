var searchData = {};
var x = {};
var fetchedData = [];
var z = {};
z['restaurants'] = [];
$('document').ready(function () {
    makeTemplates();

})
bind('.button', function () {
    console.log("Submit");
    searchData.name = $('.restaurantName').val().trim();

    execute('fetchData', searchData, function (data) {
        // if (data.length != 0)
        // data.totalEvent = (data.events.eventDetail.length);
        console.log(data);
        z.restaurants.push(data);
        displayData(z)
    })


    // execute('restaurantDetail', searchData, function(data) {
    //     // data.totalEvent = (data.events.eventDetail.length);

    //     // z.restaurants.push(data);
    //     // console.log(z);
    //     var y = {};
    //     y.restaurants = data;
    //     displayData(y)
    // })
})

function displayData(data) {
    console.log(data);


    z = (data);


    rb('.mainContainer', 'restaurants', z, {}, '.events', function (el, x) {
        console.log(x.restaurantId);
        var y = {};
        y.name = x.restaurantId
        execute('eventDetails', y, function (eventsData) {
            console.log(eventsData);
            var days = [];
            for (var i = 0; i < 31; i++) {
                days.push({
                    day: i + 1
                });
            }
            eventsData.days = days;
            $('.eventContainerBlock').show();
            rb('.eventContainerBlock', 'event', eventsData, {}, '.eventOverlay', function () {
                $('.eventContainerBlock').hide();
            })
        })
    });

    bind('.post', function (data) {
        var y = {};
        // y.name = '';
        if (typeof $(this).data('id') != "string")
            y.name = JSON.stringify($(this).data('id'));
        else
            y.name = $(this).data('id')
        console.log(y);
        execute('postDetails', y, function (postDetails) {
            // console.log(postDetails);
            $('.eventContainerBlock').show();
            rb('.eventContainerBlock', 'post', postDetails, {}, '.eventOverlay', function () {
                $('.eventContainerBlock').hide();
            })

        })
    })



    bind('.addButton', function () {
        $('.addRestaurantContainer').show();
        rb('.addRestaurantContainer', 'addRestaurant', {}, {}, '.overlay', function () {
            $('.addRestaurantContainer').hide();
        });
        bind('.add', function () {
            $('.addRestaurantContainer').hide();

            searchData.name = $('.addRestaurant').val().trim();
            if (searchData.name) {
                execute('fetchData', searchData, function (data) {
                    // var p = {};
                    // p.restaurant = data
                    z.restaurants.push(data);
                    console.log(data);
                    displayData(z);
                })
            }
        })
    })
}