var mongoose = require('mongoose'),
	config = require('../config/config')['test'],
	request = require('request'),
	should = require('should'),
	appUrl = config.app.url + ':' + config.app.port,
	common = require('./common');

describe('When creating a token for a inactive user,', function() {

	var harvey; // inactive user

	// creating the inactive user
	before(function(done) {
		common.createTestUser(false, function(err, email, password) {
			if (err) {
				console.log(err);
				done(err);
			} else {
				harvey = {
					email: email,
					password: password
				};
				done();
			}
		});
	});

	it('Given a wrong email/password', function(done) {

		var options = {
			uri: appUrl + '/user/token/create',
			json: {
				email: common.randomGoodEmail(),
				password: common.randomGoodPassword()
			}
		}

		request.put(options, function(err, res, body) {
			if (err) {
				done(err);
			} else {
				res.statusCode.should.be.equal(401);
				done();
			}
		})
	}),

	it('Given a wrong password', function(done) {
		var options = {
			uri: appUrl + '/user/token/create',
			json: {
				email: harvey.email,
				password: common.randomGoodPassword
			}
		}

		request.put(options, function(err, res, body) {
			if (err) {
				done(err);
			} else {
				res.statusCode.should.be.equal(401);
				done();
			}
		})
	}),

	it('Given blank credentials', function(done) {
		var options = {
			uri: appUrl + '/user/token/create',
			json: {
				email: '',
				password: ''
			}
		}

		request.put(options, function(err, res, body) {
			if (err) {
				done(err);
			} else {
				res.statusCode.should.be.equal(401);
				done();
			}
		})
	}),

	it('Given valid credentials', function(done) {
		// creating the user before logging in
		var options = {
			uri: appUrl + '/user/token/create',
			json: {
				email: harvey.email,
				password: harvey.password
			}
		}

		request.put(options, function(err, res, body) {
			if (err) {
				done(err);
			} else {
				res.statusCode.should.be.equal(403);
				body.message.should.include('inactive');
				done();
			}
		})

	})
})

describe('When creating a token for a active user,', function() {

	var joey; // inactive user

	// creating the active user
	before(function(done) {
		common.createTestUser(true, function(err, email, password) {
			if (err) {
				console.log(err);
				done(err);
			} else {
				joey = {
					email: email,
					password: password
				};
				done();
			}
		});
	});


	it('Given valid credentials', function(done) {
		// creating the user before logging in
		var options = {
			uri: appUrl + '/user/token/create',
			json: {
				email: joey.email,
				password: joey.password
			}
		}

		request.put(options, function(err, res, body) {
			if (err) {
				done(err);
			} else {
				res.statusCode.should.be.equal(201);
				body.should.have.property('access_token').with.lengthOf(32);
				done();
			}
		})

	}),

	it('Given invalid credentials', function(done) {
		// creating the user before logging in
		var options = {
			uri: appUrl + '/user/token/create',
			json: {
				email: joey.email,
				password: common.randomGoodPassword()
			}
		}

		request.put(options, function(err, res, body) {
			if (err) {
				done(err);
			} else {
				res.statusCode.should.be.equal(401);
				done();
			}
		})

	})
})


describe('When checking a token for a active user,', function() {

	var monica; // inactive user

	// creating the active user
	before(function(done) {
		common.createTestUser(true, function(err, email, password) {
			if (err) {
				console.log(err);
				done(err);
			} else {
				monica = {
					email: email,
					password: password
				};
				common.authTokenForUser(monica.email, function(err, authToken) {
					if (!err) {
						monica.authToken = authToken;
						done();
					} else {
						console.log(err);
						done(err);
					}
				})
			}
		});
	});


	it('Given a valid authToken', function(done) {
		// creating the user before logging in
		var options = {
			uri: appUrl + '/user/token/check',
			qs: {
				access_token: monica.authToken
			}
		}

		request.get(options, function(err, res, body) {
			if (err) {
				done(err);
			} else {
				res.statusCode.should.be.equal(200);
				done();
			}
		})

	})

	it('Given an invalid authToken', function(done) {
		// creating the user before logging in
		var options = {
			uri: appUrl + '/user/token/check',
			qs: {
				access_token: common.randomString(32)
			}
		}

		request.get(options, function(err, res, body) {
			if (err) {
				done(err);
			} else {
				res.statusCode.should.be.equal(401);
				done();
			}
		})

	})
})

describe('When checking a token for an inactive user,', function() {

	var rachel; // inactive user

	// creating the inactive user
	before(function(done) {
		common.createTestUser(false, function(err, email, password) {
			if (err) {
				console.log(err);
				done(err);
			} else {
				rachel = {
					email: email,
					password: password
				};
				common.authTokenForUser(rachel.email, function(err, authToken) {
					if (!err) {
						rachel.authToken = authToken;
						done();
					} else {
						console.log(err);
						done(err);
					}
				})
			}
		});
	});


	it('Given a valid authToken', function(done) {
		// creating the user before logging in
		var options = {
			uri: appUrl + '/user/token/check',
			qs: {
				access_token: rachel.authToken
			}
		}

		request.get(options, function(err, res, body) {
			if (err) {
				done(err);
			} else {
				res.statusCode.should.be.equal(401);
				done();
			}
		})

	})

	it('Given an invalid authToken', function(done) {
		// creating the user before logging in
		var options = {
			uri: appUrl + '/user/token/check',
			qs: {
				access_token: common.randomString(32)
			}
		}

		request.get(options, function(err, res, body) {
			if (err) {
				done(err);
			} else {
				res.statusCode.should.be.equal(401);
				done();
			}
		})

	})
})

describe('When deleting a token for an inactive user,', function() {

	var chandler; // inactive user

	// creating the inactive user
	before(function(done) {
		common.createTestUser(false, function(err, email, password) {
			if (err) {
				console.log(err);
				done(err);
			} else {
				chandler = {
					email: email,
					password: password
				};
				common.authTokenForUser(chandler.email, function(err, authToken) {
					if (!err) {
						chandler.authToken = authToken;
						done();
					} else {
						console.log(err);
						done(err);
					}
				})
			}
		});
	});


	it('Given a valid authToken', function(done) {
		// creating the user before logging in
		var options = {
			uri: appUrl + '/user/token/delete',
			json: {
				access_token: chandler.authToken
			}
		}

		request.del(options, function(err, res, body) {
			if (err) {
				done(err);
			} else {
				res.statusCode.should.be.equal(401);
				done();
			}
		})

	})

	it('Given an invalid authToken', function(done) {
		// creating the user before logging in
		var options = {
			uri: appUrl + '/user/token/delete',
			json: {
				access_token: common.randomString(32)
			}
		}

		request.del(options, function(err, res, body) {
			if (err) {
				done(err);
			} else {
				res.statusCode.should.be.equal(401);
				done();
			}
		})

	})
})

describe('When deleting a token for a active user,', function() {

	var ross; // inactive user

	// creating the active user
	before(function(done) {
		common.createTestUser(true, function(err, email, password) {
			if (err) {
				console.log(err);
				done(err);
			} else {
				ross = {
					email: email,
					password: password
				};
				common.authTokenForUser(ross.email, function(err, authToken) {
					if (!err) {
						ross.authToken = authToken;
						done();
					} else {
						console.log(err);
						done(err);
					}
				})
			}
		});
	});


	it('Given a valid authToken', function(done) {
		// creating the user before logging in
		var options = {
			uri: appUrl + '/user/token/delete',
			json: {
				access_token: ross.authToken
			}
		}

		request.del(options, function(err, res, body) {
			if (err) {
				done(err);
			} else {
				res.statusCode.should.be.equal(200);

				// creating the user before logging in
				var options = {
					uri: appUrl + '/user/token/check',
					qs: {
						access_token: ross.authToken
					}
				}

				request.get(options, function(err, res, body) {
					if (err) {
						done(err);
					} else {
						res.statusCode.should.be.equal(401);
						done();
					}
				})

			}
		})



	})

	it('Given an invalid authToken', function(done) {
		// creating the user before logging in
		var options = {
			uri: appUrl + '/user/token/delete',
			json: {
				access_token: common.randomString(32)
			}
		}

		request.del(options, function(err, res, body) {
			if (err) {
				done(err);
			} else {
				res.statusCode.should.be.equal(401);
				done();
			}
		})

	})
})