var express = require('express');
var session = require('express-session');
var morgan = require('morgan');
var sqlite3 = require('sqlite3');
var ect = require('ect');
var passport = require('passport');
var passportLocal = require('passport-local');
var bodyParser = require('body-parser');
var flash = require('connect-flash');

var config = require('./config');
config.root = 'http://' + config.hostname + ':' + config.port;

/***** Setup passport *****/

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	done(null, config.users[id - 1]);
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

/***** Setup express.js *****/

var app = express();
app.engine('ect', ect({
	watch: true,
	root: __dirname + '/views',
	ext: '.ect'
}).render);
app.set('view engine', 'ect');
app.use(morgan());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(session({
	secret: config.sessionSecret,
	resave: true,
	saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

/***** Routes *****/

app.get('/', function (req, res) {
	res.send('It works!');
});

app.get('/login', function (req, res) {
	res.render('login', {message: null});
});

app.post('/login', passport.authenticate('local', {
	failureRedirect: '/login',
	failureFlash: true,
	successRedirect: '/'
}));

var server = app.listen(config.port, function () {
	console.log('Listening on port %d', server.address().port);
});
