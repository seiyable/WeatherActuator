/*Server for Weather Actuator
* by Seiyable && Queeniebee
*
* 
*/

"use strict";

//================================================
//require
var express = require('express');
var exphbs  = require('express3-handlebars');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
//var hue = require("node-hue-api");
var firmata = require('firmata');

//use static local files
app.use(express.static(__dirname + '/public'));
//handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
//body parser
app.use(bodyParser());

//firmata settings
var ledPin = 13;
var port = "/dev/tty.usbmodem1411";
var board = new firmata.Board(port, function(err){
    if (err) {
        console.log(err);
        return;
    }
    console.log('connected');
  board.pinMode(ledPin, board.MODES.OUTPUT);

});


//================================================
//routing functions

/***********************************
A routing function that
1)receives a GET request, and
2)returns a html to web client
***********************************/
app.get('/', function(req, res){
  res.render('layouts/top');
});

/***********************************
A routing function that
1)receives a POST request with a city name,
2)accesses to Open Weather API, and
2)returns a html to web client
***********************************/
app.post('/', function(req, res){
  //assign the receiveed city name to a new variable
  var cityname = req.body.cityname;

  //initialize variables for the access to Open Weather API
  var query = "http://api.openweathermap.org/data/2.5/weather?";
  var options = [];
  options["APPID"] = "d9a5fc0bed270bb5e6e3c6ae3d0b2fe7";
  options["q"] = cityname;

  //make a query string with these variables
  var key = "";
  for (key in options){
    var str = key + '=' + options[key];
    query = query + str + '&';
  }
  //remove the last charactor '&' from the query
  query = query.slice(0, -1);
  console.log("Query: " + query);

  //a callback function that will be called after the access to the API
  var callback = function(error, response, body) {
    if (!error && response.statusCode === 200) {
        var data = JSON.parse(body);
        console.log("Response from API:");
        console.log(data);

        //convert the temperature from Kelvin to Celcius
        data.main.temp = data.main.temp - 273.15;
        data.main.temp = data.main.temp.toFixed(1);
        console.log(data.main.temp);

        var tempValue = data.main.temp;

        if(tempValue >= 10){

          board.digitalWrite(ledPin, board.HIGH);

        } else {
          board.digitalWrite(ledPin, board.LOW);

        }

        //render a html with the response
        res.render('layouts/top', data);
    }
  };

  //request to the API
  request.get(query, callback);
});


//============================================
//supportive functions

/***********************************
A function that displays the info of bridges 
found on your local network
***********************************/
/*
var displayBridges = function(bridge) {
    console.log("Hue Bridges Found: " + JSON.stringify(bridge));
};

// --------------------------
// Using a promise
hue.locateBridges().then(displayBridges).done();

// --------------------------
// Using a callback
hue.locateBridges(function(err, result) {
    if (err) throw err;
    displayBridges(result);
});
*/


//============================================
//server setup
var server = app.listen(3000, function(){
  console.log('Listening on port %d', server.address().port);
});