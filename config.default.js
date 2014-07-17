var config = {};

config.hostname = 'localhost';
config.port = '10721';
config.users = [
{
	id: 1,
	username: 'admin',
	password: 'password'
}
];
config.sessionSecret = 'keyboard cat';

module.exports = config;
