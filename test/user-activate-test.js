var mongoose = require('mongoose'),
	config = require('../config/config')['test'],
	request = require('request'),
	should = require('should'),
	appUrl = config.app.url + ':' + config.app.port,
	common = require('./common');

describe('When activating a created user', function() {

	var buster, mike, harvey;

	before(function(done) {
		// create the test users
		common.createTestUser(false, function(err, email, password, token) {
			if (err) {
				console.log(err);
			} else {
				buster = {
					email: email,
					password: password,
					token: token
				};

				common.createTestUser(false, function(err, email, password, token) {
					if (err) {
						console.log(err);
					} else {
						mike = {
							email: email,
							password: password,
							token: token
						};
						common.createTestUser(true, function(err, email, password, token) {
							if (err) {
								console.log(err);
							} else {
								harvey = {
									email: email,
									password: password,
									token: token
								};
								done();
							};
						});
					};
				});
			};
		});
	});

	it('With incorrect token', function(done) {
		var options = {
			uri: appUrl + '/user/activate',
			json: {
				email: buster.email,
				token: '1234'
			}
		};

		request.post(options, function(err, res, body) {
			if (err) {
				done(err);
			} else {
				res.statusCode.should.be.equal(400);
				done();
			}
		});
	});

	it('With correct credentials', function(done) {
		var options = {
			uri: appUrl + '/user/activate',
			json: {
				email: buster.email,
				token: buster.token
			}
		};

		request.post(options, function(err, res, body) {
			if (err) {
				done(err);
			} else {
				res.statusCode.should.be.equal(200);
				done();
			}
		});
	});

	it('With correct encoded credentials', function(done) {
		var options = {
			uri: appUrl + '/user/activate',
			json: {
				email: encodeURIComponent(mike.email),
				token: encodeURIComponent(mike.token)
			}
		};

		request.post(options, function(err, res, body) {
			if (err) {
				done(err);
			} else {
				res.statusCode.should.be.equal(200);
				done();
			}
		})
	});

	it('Already activated user', function(done) {
		var options = {
			uri: appUrl + '/user/activate',
			json: {
				email: encodeURIComponent(harvey.email),
				token: encodeURIComponent(harvey.token)
			}
		};

		request.post(options, function(err, res, body) {
			if (err) {
				done(err);
			} else {
				res.statusCode.should.be.equal(400);
				done();
			}
		})
	});
});