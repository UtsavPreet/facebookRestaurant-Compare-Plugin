var searchData = {};
$('document').ready(function () {
    makeTemplates();
})

bind('.mainContainer .pageContainer .topBar .addButton', function () {
    searchData.zomato = $('.zomato').val().trim();
    searchData.facebook = $('.facebook').val().trim();
    searchData.tripAdvisor = $('.tripadvisor').val().trim();
    searchData.instagram = $('.instagram').val().trim();
    searchData.google = $('.google').val().trim();
    execute('fetchData',searchData,function(data){
        console.log(data)
    })
    console.log(searchData);
})

// httpsAIzaSyDrCOoCxVK5kjPvkwZFYXbVzYgqXmyzWfo://www.google.com/maps?cid=7064680697119184459

// API Key = 