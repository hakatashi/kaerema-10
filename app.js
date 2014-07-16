var express = require('express');
var morgan = require('morgan');
var sqlite3 = require('sqlite3');
var ejs = require('ejs');
var passport = require('passport');
var passportLocal = require('passport-local');

var config = require('./config');
config.root = 'http://' + config.hostname + ':' + config.port;

var app = express();
app.use(morgan());

app.get('/', function (req, res) {
	res.send('It works!');
});

passport.use(new passportLocal.Strategy(
	function (username, password, done) {
		// find matching user
		var matchedUser = null;
		config.users.forEach(function (user) {
			if (user.username === username) {
				matchedUser = user;
			}
		});

		// if no user matches
		if (!matchedUser) {
			done(null, false, {message: 'Incorrect username.'});
			return;
		}

		// if password is incorrect
		if (matchedUser.password !== password) {
			done(null, false, {message: 'Incorrect password'});
			return;
		}

		// if login succeed
		done(null, matchedUser);
		return;
	}
));

var server = app.listen(10721, function () {
	console.log('Listening on port %d', server.address().port);
});
