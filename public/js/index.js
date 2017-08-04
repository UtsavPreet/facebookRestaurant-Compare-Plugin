var searchData = {};
var fetchedData =[];
$('document').ready(function() {
    makeTemplates();
    
})
    bind('.button', function () {
        console.log("Submit");
        searchData.name = $('.restaurantName').val().trim();
        execute('fetchData',searchData,function(data){
            console.log(data);
            rb('.mainContainer','restaurants',data)
        });
    });
   


   
