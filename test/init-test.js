var mongoose = require('mongoose'),
	config = require('../config/config')['test'],
	request = require('request'),
	should = require('should'),
	appUrl = config.app.url + ':' + config.app.port;

var testData = {
	CREATEDEMAIL: 'nadmzc+valid@gmail.com',
	CREATEDPASS: '12345678'
}

before(function(done) {
	// bootstrap db connection
	mongoose.connect(config.db);

	// bootstrap model
	require('../models/user.js');
	var User = mongoose.model('User');

	// remove all users and insert our test user
	User.remove(function(err) {
		if (!err) {
			console.log('Cleaned the User Collection');
			mongoose.connection.close();

			done();
		}
		else {
			done(err);
		}
	});
});