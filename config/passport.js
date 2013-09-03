var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	LocalStrategy = require('passport-local').Strategy,
	BearerStrategy = require('passport-http-bearer');


module.exports = function(passport, config) {

	// passport.serializeUser(function(user, done) {
	// 	done(null, user.authToken);
	// });

	// passport.deserializeUser(function(token, done) {
	// 	User.findOne(token, function(err, user) {
	// 		done(err, user);
	// 	});
	// });

	/** 
	 * strategies.
	 =================================================*/

	passport.use(new BearerStrategy(
		function(token, done) {
			User.findOne({
				authToken: token,
				authTokenExpiredOn: {
					$gt: new Date()
				}
			}, function(err, user) {
				if (err) {
					return done(err);
				}
				if (!user) {
					return done(null, false, {
						message: 'Invalid username/password or token expired'
					});
				}
				if (user && !user.active) {
					return done(null, false, {
						message: 'User is still inactive'
					});
				}
				return done(null, user, {
					scope: 'all'
				});
			});
		}
	));

	passport.use(new LocalStrategy({
			usernameField: 'email',
			passwordField: 'password'
		},
		function(email, password, done) {
			User.findOne({
				email: email.toLowerCase()
			}, function(err, user) {
				if (err) {
					return done(err)
				}
				if (!user) {
					return done(null, false);
				}
				if (!user.authenticate(password)) {
					return done(null, false);
				}
				return done(null, user);
			})
		}
	));
}