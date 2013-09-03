var async = require('async');
var user = require('../controllers/user');

module.exports = function(app, passport) {

	/** 
	 * CORS.
	 * Cross domain requests require OPTIONS to be prefetched 
	 =================================================*/
	    
	app.all('*', function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'HEAD, GET, POST, PUT, DELETE, OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Origin, Accept');
		res.header('Access-Control-Allow-Credentials', 'true');

		if (req.method.toLowerCase() === "options") {
			res.send(200);
		} else {
			next();
		}
	});

	/** 
	 * user.
	 =================================================*/

	app.put('/user/token/create', function(req, res, next) {
		passport.authenticate('local', function(err, userObj, info) {
			if (err) {
				return next(err);
			}
			if (!userObj) {
				return res.send(401);
			}
			if (userObj && !userObj.active) {
				return res.json(403, {
					error: 'Authentication',
					message: 'User is inactive'
				});
			}

			req.logIn(user, {
				session: false
			}, function(err) {
				if (err) {
					return next(err);
				}

				user.token.create(userObj.email, res, next);
			});
		})(req, res, next);
	});

	app.get('/user/token/check', passport.authenticate('bearer', {
		session: false
	}), function(req, res, next) {
		user.token.check(req, res, next);
	});

	app.del('/user/token/delete', passport.authenticate('bearer', {
		session: false
	}), function(req, res, next) {
		user.token.delete(req, res, next);
	});

	app.post ('/user/activate', user.activate);

	app.put('/user/create', user.create);

	app.post('/user/profile', passport.authenticate('bearer', {
		session: false
	}), function(req, res, next) {
		user.profile(req, res, next);
	});
}