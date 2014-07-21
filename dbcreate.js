var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('ranking.sqlite3');

db.serialize(function () {
	db.run('CREATE TABLE ranking (rank INTEGER PRIMARY KEY, title TEXT, author TEXT)', function (error) {
		if (error) {
			console.log(error);
		}
	});
	db.run('CREATE TABLE guesses (rank INTEGER, name TEXT, date TEXT)', function (error) {
		if (error) {
			console.log(error);
		}
	});
	db.run('CREATE TABLE misses (title TEXT, name TEXT, date TEXT)', function (error) {
		if (error) {
			console.log(error);
		}
	});
});
