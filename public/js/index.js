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
    execute('fetchData', searchData, function (data) {
        console.log(data);
        dbData.push(data);
        rb('.mainContainer .card', 'data', data);
        screenBind();
    })

    $('.loader').show();
    console.log(searchData);
})

function screenBind() {
    bind('.event', function () {
        var count=1;
        $('.overlay').show();
        $('.eventPopup').show();
        execute('getDetails',count,function(data){
            console.log(data);
            // rb('.eventPopup', 'eventPopup',data);
        })
    })
}