var searchData = {};
var x = {};
var fetchedData = [];
$('document').ready(function () {
    makeTemplates();

})
bind('.button', function () {
    console.log("Submit");
    searchData.name = $('.restaurantName').val().trim();
    execute('fetchData', searchData, function (data) {
        x.dbData = data;
        console.log(x);
        rb('.mainContainer', 'restaurants', x);
        bind('.addButton', function () {
            $('.addRestaurantContainer').show();
            rb('.addRestaurantContainer', 'addRestaurant', {});
            bind('.add', function () {
                searchData.name = $('.addRestaurant').val().trim();
                execute('fetchData', searchData, function (data) {
                    x.dbData = data;
                    console.log(x);
                    rb('.mainContainer', 'restaurants', x);
                })
            })
        })
    })
    // requestdata(searchData);
    // bind('.addButton', function () {
    //     $('.addRestaurantContainer').show();
    //     rb('.addRestaurantContainer', 'addRestaurant', {});
    //     bind('.add', function () {
    //         searchData.name = $('.addRestaurant').val().trim();
    //         execute('fetchData', searchData, function (data) {
    //         x.dbData = data;
    //         console.log(x);
    //         rb('.mainContainer', 'restaurants', x);
    //     })
    //     })
    // })
})
// function requestdata(search) {

// }