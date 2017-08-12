var searchData = {};
$('document').ready(function () {
    makeTemplates();
rb('.pageContainer .card','data',data.restaurantData);
})

bind('.mainContainer .pageContainer .topBar .addButton',function(){
    searchData.name = $('.mainContainer .pageContainer .topBar .searchField').val().trim();
    execute('fetchData',searchData,function(data){
        console.log(data);
    })
})