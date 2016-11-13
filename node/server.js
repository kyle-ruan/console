var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(express.static('wwwroot'));

app.use(bodyParser.json());

//Create and handle the Web CLI route
require('./webcli.js')(app);

var server = app.listen(5000, function(){
  console.log('Listening on port ' + server.address().port);
});
