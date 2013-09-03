var utility = require('../utility'),
	config = require('../config/config')['test'],
	mongoose = require('mongoose'),
	moment= require('moment');

// creates a test user and activates it if needed
exports.createTestUser = function(activate, done) {

	// bootstrap model
	var conn = mongoose.createConnection(config.db);
	require('../models/user.js');
	var User = conn.model('User');


	// require('../models/user.js');
	// var User = mongoose.model('User');

	var email = this.randomGoodEmail();
	var password = this.randomGoodPassword();
	var token = User.generateToken();

	user = new User({
		email: email,
		password: password,
		activationToken: token,
		active: activate,
		createdOn: new Date()
	});

	user.save(function(err, obj) {
		conn.close();
		if (err) {
			console.log(err);
			done(err);
		} else {
			console.log('      Created test user: %s', obj.email);
			done(null, email, password, token);
		}
	});
}

exports.authTokenForUser = function(email, done) {

	// bootstrap model
	var conn = mongoose.createConnection(config.db);
	require('../models/user.js');
	var User = conn.model('User');

	User.findOne({
		email: email.toLowerCase()
	}, function(err, result) {
		if (!err) {
			result.authToken = utility.generateKey(32);
			result.authTokenExpiredOn = moment().add('minutes', 30);

			result.save(function(err,obj){
				done(null, obj.authToken);
			});
		} else {
			done(err);
		}
	});
}

exports.randomGoodEmail = function(argument) {
	return 'nadzmc+' + utility.generateKey(5) + '@gmail.com';
}

exports.randomBadEmail = function(argument) {
	return 'nadzmc+' + utility.generateKey(5) + 'gmail.com';
}

exports.randomGoodPassword = function(argument) {
	return utility.generateKey(8);
}

exports.randomBadPassword = function(argument) {
	return utility.generateKey(2);
}

exports.randomString = function(length) {
	return utility.generateKey(length);
}