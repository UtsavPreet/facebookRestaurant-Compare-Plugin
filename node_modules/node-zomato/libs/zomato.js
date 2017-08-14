var request = require('request');
var ACCESS_TOKEN = null;
var API_END_POINT = 'https://developers.zomato.com/api/v2.1';

var callAPI = function(resource, qs, callback) {
    var options = {
        method: 'GET',
        url: API_END_POINT + resource,
        headers: {
            'user-key': ACCESS_TOKEN,
            'content-type': 'application/json'
        }
    };

    request(options, function(error, response, body) {
        callback(error, response);
    });
};

var Zomato = function(user_key) {
    ACCESS_TOKEN = user_key;

    this.verify = function(callback) {
        callAPI('/categories', {}, function(error, response) {
            if (error) {
                callback(false);
                return;
            }
            callback(true);
        });
    };


    // Common APIs
    this.getCategories = function(callback) {
        callAPI('/categories', {}, callback);
    };

    this.getCities = function(options, callback) {
        callAPI('/cities', options, callback);
    };

    this.getCollections = function(options, callback) {
        callAPI('/collections', options, callback);
    };

    this.getEstablishments = function(options, callback) {
        callAPI('/establishments', options, callback);
    };


    // Location Specific APIs
    this.getGeoCode = function(latitide, longitude, callback) {
        callAPI('/geocode', {
            lat: latitide,
            lon: longitude
        }, callback);
    };

    this.getLocationDetails = function(entityId, entityType, callback) {
        callAPI('/location_details', {
            entity_id: entityId,
            entity_type: entityType
        }, callback);
    };

    this.getLocations = function(entityId, entityType, callback) {
        callAPI('/locations', {
            entity_id: entityId,
            entity_type: entityType
        }, callback);
    };


    // Restraunt Specific APIs
    this.getDailyMenu = function(restaurantId, callback) {
        callAPI('/dailymenu', {
            res_id: restaurantId
        }, callback);
    };

    this.getRestaurant = function(restaurantId, callback) {
        callAPI('/restarurant', {
            res_id: restaurantId
        }, callback);
    };

    this.getReviewsForRestaurant = function(restaurantId, options, callback) {
        var qs = options;
        qs.res_id = restaurantId;
        callAPI('/reviews', qs, callback);
    };

    this.search = function(options, callback) {
        callAPI('/reviews', options, callback);
    };

};

exports.Zomato = Zomato;
