var a = {};
var z = {};
z['restaurants'] = [];

$('document').ready(function() {
    makeTemplates();

})

bind('.button', function() {
    a.id = $('.key').val();
    a.name = $('.restaurantName').val();
    execute('restaurantDetail', a, function(re) {
        console.log(re);
        reviewCount(re);
        // execute('getRtsReviews', re, function(r) {
        //     console.log(r);
        //     z = r;
        //     displayData(r);
        // })
    })
})



function displayData(re) {

    rb('.mainContainer', 'restaurants', re, {}, '.userReview', function(el, data) {
        // console.log(z);
        console.log(data.restaurant.id);
        a.restaurantId = data.restaurant.id;
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
                execute('addRestaurant', a, function(result) {
                    console.log(result);



                    z.restaurants.push(result);

                    reviewCount(z)
                        // result = insertData(result.restaurants[0])
                        // z[0].restaurants.push(result);
                    console.log(z);
                    // console.log(result);
                    // displayData(z);

                })
            }
        })
    })
}

function reviewCount(re) {
    execute('getRtsReviews', re, function(r) {
        console.log(re);
        z = re;
        displayData(r);
    })
}