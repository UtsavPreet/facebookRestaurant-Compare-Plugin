var searchData = {};
$('document').ready(function () {
    makeTemplates();
})

bind('.mainContainer .topBar .addButton', function () {
    searchData.zomato = $('.zomato').val().trim();
    searchData.facebook = $('.facebook').val().trim();
    searchData.tripAdvisor = $('.tripadvisor').val().trim();
    searchData.instagram = $('.instagram').val().trim();
    searchData.google = $('.google').val().trim();
    execute('fetchData',searchData,function(data){
        console.log(data);
        rb('.mainContainer .card','data',data);
    })
    console.log(searchData);
})