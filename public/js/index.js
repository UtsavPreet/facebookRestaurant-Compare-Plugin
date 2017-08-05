var searchData = {};
var x = {};
var fetchedData = [];
$('document').ready(function () {
    makeTemplates();

})
bind('.button', function () {
    console.log("Submit");
    searchData.name = $('.restaurantName').val().trim();
    // execute('fetchData',searchData);
     // execute('posts',searchData);
    execute('posts',searchData,function(dataGot){
            console.log(dataGot);
            rb('.reviewContainerBlock','post',dataGot);
        })
    execute('dbData', searchData, function (data) {
        x.dbData=data;
        console.log(x);
        rb('.mainContainer', 'restaurants', x);
    })
    
    
});