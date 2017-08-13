var socialMediaIds = [
    {
        "circus": {
            facebook: "circusnewdelhi",
            tripAdvisor: "https://www.tripadvisor.in/Restaurant_Review-g304551-d10236428-Reviews-Circus-New_Delhi_National_Capital_Territory_of_Delhi.html",
            zomato: "circus"

        }
    },
    {
        "1 oak": {
            facebook: "1380522738878709",
            tripAdvisor: "https://www.tripadvisor.in/Restaurant_Review-g304551-d8053505-Reviews-1_Oak_Cafe_Bar-New_Delhi_National_Capital_Territory_of_Delhi.html",
            zomato: "1 oak"

        }
    }

];
var searchData = {};
$('document').ready(function () {
    makeTemplates();
})

bind('.mainContainer .pageContainer .topBar .addButton', function () {
    searchData.name = $('.mainContainer .pageContainer .topBar .searchField').val().trim();

    socialMediaIds.forEach(function (element) {
        for (var key in element) {
            if (key == searchData.name) {
                execute('fetchData', element[key], function (data) {
                    console.log(data);
                })
            }
        }
    }, this)
})