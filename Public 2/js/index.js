var a = {};
$('document').ready(function() {
    makeTemplates();

})

bind('.button', function() {
    a.id = $('.key').val();
    a.name = $('.restaurantName').val();
    execute('restaurantDetail', a, function(re) {
        re["restaurantName"] = a.name;
        console.log(re);
        // a.restaurantId = re.restaurants[0].restaurant.id;
        rb('.mainContainer', 'restaurants', re, {}, '.userReview', function(el, data) {
            console.log(data);
            // execute('review', a, function(re) {
            //     console.log(re);
            //     $('.reviewContainerBlock').show();
            //     rb('.reviewContainerBlock', 'review', re, {}, ':not(' + '.reviewContainerBlock)', function() {
            //         $('.reviewContainerBlock').hide();
            //     });
            // })

        })
    })
})

function getrestaurantReview() {

}