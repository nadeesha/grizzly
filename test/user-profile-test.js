var mongoose = require('mongoose'),
	config = require('../config/config')['test'],
	request = require('request'),
	should = require('should'),
	appUrl = config.app.url + ':' + config.app.port,
	common = require('./common');

describe('When editing a active user', function() {
	var jesse;

	before(function(done) {
		common.createTestUser(true, function(err, email, password, token) {
			if (err) {
				done(err);
			}

			common.authTokenForUser(email, function(err, authToken) {
				if (err) {
					done(err);
				}

				jesse = {
					email: email,
					authToken: authToken
				};

				done();
			});
		});
	});

	it('Sending blank body', function(done) {
		var options = {
			uri: appUrl + '/user/profile',
			json: {
				access_token: jesse.authToken,
				profile: '{asdfasdf,fasfasdf}'
			}
		}

		request.post(options, function (err, res, body) {
			res.statusCode.should.be.equal(400);
			body.message.should.include('Invalid JSON');
			done();
		})
	});

	it('Sending an invalid body', function(done) {
		var options = {
			uri: appUrl + '/user/profile',
			json: {
				access_token: jesse.authToken,
				profile: ''
			}
		}

		request.post(options, function (err, res, body) {
			res.statusCode.should.be.equal(400);
			done();
		})
	});

	it('Sending a valid body', function(done) {
		var profile = {
			firstName: "Foo",
			lastName: "Bar"
		}

		var options = {
			uri: appUrl + '/user/profile',
			json: {
				access_token: jesse.authToken,
				profile: JSON.stringify(profile)
			}
		}

		request.post(options, function (err, res, body) {
			res.statusCode.should.be.equal(200);
			res.body.firstName.should.be.equal(profile.firstName);
			res.body.lastName.should.be.equal(profile.lastName);
			done();
		})
	});
})