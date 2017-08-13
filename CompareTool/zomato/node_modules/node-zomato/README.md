# node-zomato
 A NodeJS Wrapper for the Zomato Search API

## Usage
Install the package by typing
`npm install node-zomato --save` in the command line

Require the package from your script:

`var Zomato = require('node-zomato')`

You have to get the API token from https://developers.zomato.com/api

## Example

    var ZomatoAPI = require('node-zomato');

    var api = new ZomatoAPI('YOUR_API_TOKEN');

    api.verify(function(isVerified) {
        console.log(isVerified);
        if (isVerified === false) {
            process.exit();
        }
    });

## TODO
Right now this wrapper just supports callbacks. Have to implement promises.

Any pull-requests are welcome! :)
