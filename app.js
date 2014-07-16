var express = require('express');
var morgan = require('morgan');
var sqlite3 = require('sqlite3');
var ejs = require('ejs');

var app = express();
app.use(morgan());

app.get('/', function (req, res) {
	res.send('It works!');
});

var server = app.listen(10721, function () {
	console.log('Listening on port %d', server.address().port);
});
