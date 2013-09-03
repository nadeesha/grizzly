var mongoose = require('mongoose'),
	config = require('../config/config')['test'],
	request = require('request'),
	should = require('should'),
	appUrl = config.app.url + ':' + config.app.port,
	common = require('./common');

describe('When creating the user,', function() {

	it('Given a bad email', function(done) {
		var options = {
			uri: appUrl + '/user/create',
			json: {
				email: common.randomBadEmail(),
				password: common.randomGoodPassword()
			}
		}

		request.put(options, function(err, res, body) {
			if (err) {
				done(err);
			} else {
				res.statusCode.should.be.equal(400);
				should.exist(body);
				done();
			}
		})
	}),

	it('Given a bad password', function(done) {
		var options = {
			uri: appUrl + '/user/create',
			json: {
				email: common.randomGoodEmail(),
				password: common.randomBadPassword()
			}
		}

		request.put(options, function(err, res, body) {
			if (err) {
				done(err);
			} else {
				res.statusCode.should.be.equal(400);
				should.exist(body);
				done();
			}
		})
	}),

	it('Given valid credentials', function(done) {
		var options = {
			uri: appUrl + '/user/create',
			json: {
				email: common.randomGoodEmail(),
				password: common.randomGoodPassword()
			}
		}

		request.put(options, function(err, res, body) {
			if (err) {
				done(err);
			} else {
				res.statusCode.should.be.equal(201);
				should.exist(body);
				done();
			}
		})
	}),

	it('Given an already existing email', function(done) {
		common.createTestUser(false, function(err, email, pass, token) {
			if (err) {
				done(err);
			} else {
				var options = {
					uri: appUrl + '/user/create',
					json: {
						email: email,
						password: pass
					}
				}

				request.put(options, function(err, res, body) {
					if (err) {
						done(err);
					} else {
						res.statusCode.should.be.equal(409);
						should.exist(body);
						done();
					}
				});
			}
		});
	})
})