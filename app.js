var express = require('express');
var session = require('express-session');
var morgan = require('morgan');
var sqlite3 = require('sqlite3');
var passport = require('passport');
var passportLocal = require('passport-local');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var serveStatic = require('serve-static');

var config = require('./config');
config.root = 'http://' + config.hostname + ':' + config.port;

var db = new sqlite3.Database('ranking.sqlite3');

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
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
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
app.use(serveStatic('assets', {
	index: false,
	redirect: false
}));

/***** Routes *****/

var ensureAuthenticated = function (req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
};

app.get('/', function (req, res) {
	var ranking = null;

	db.serialize(function () {
		db.all('SELECT * FROM ranking NATURAL LEFT OUTER JOIN guesses', function (error, rows) {
			if (error) {
				console.log(error);
				return;
			}

			ranking = rows;

			if (!ranking) {
				res.send(500, 'Something went wrong!');
				return;
			}

			ranking.forEach(function (rank) {
				if (!rank.name) {
					rank.title = '???';
					rank.author = '???';
				}
			});

			res.render('index', {
				ranking: ranking,
				scripts: ['js/index.js']
			});
		});
	});
});

app.get('/login', function (req, res) {
	res.render('login', {message: null});
});

app.post('/login', passport.authenticate('local', {
	failureRedirect: '/login',
	failureFlash: true,
	successRedirect: '/'
}));

app.get('/logout', function (req, res) {
	req.logout();
	res.redirect('/');
});

app.get('/session', ensureAuthenticated, function (req, res) {
	res.render('session', {user: req.user.username});
});

var server = app.listen(config.port, function () {
	console.log('Listening on port %d', server.address().port);
});
