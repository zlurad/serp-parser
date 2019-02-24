var request = require("request")
var sp = require("./lib")
var fs = require('fs');

request('https://www.google.com/search?q=google', function (error, response, html) {
  if (!error && response.statusCode == 200) {
    console.log(sp.GoogleSERP(html));
    //console.log(sp.GoogleSERP(html));
  }
});
