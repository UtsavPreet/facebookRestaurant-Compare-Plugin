var a = {};
var z = {};
z['restaurants'] = [];

$('document').ready(function() {
    makeTemplates();

})

bind('.button', function() {
    a.newRestaurant = $('.restaurantName').val();
    execute('restaurantDetail', a, function(re) {
        console.log(re);
        z.restaurants.push(re);
        displayData(z);

    })
})



function displayData(re) {

    rb('.mainContainer', 'restaurants', re, {}, '.userReview', function(el, data) {
        // console.log(z);
        // console.log(data.restaurant.id);
        a.restaurantId = data.name;
        execute('review', a, function(re) {

            console.log(re);
            $('.reviewContainerBlock').show();
            rb('.reviewContainerBlock', 'review', re, {}, '.overlay', function() {
                $('.reviewContainerBlock').hide();
            });
        })
    });


    bind('.addButton', function() {
        $('.addRestaurantContainer').show();
        rb('.addRestaurantContainer', 'addRestaurant', {}, {}, '.overlay', function() {
            $('.addRestaurantContainer').hide();
        });
        bind('.add', function() {
            a.newRestaurant = $('.addRestaurant').val();
            console.log(a);
            $('.addRestaurantContainer').hide();
            if (a.newRestaurant) {
                execute('restaurantDetail', a, function(result) {
                    console.log(result);
                    z.restaurants.push(result);
                    console.log(z);
                    displayData(z);

                })
            }
        })
    })
}