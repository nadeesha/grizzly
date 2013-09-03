"use strict";

var mongoose = require('mongoose'),
	env = process.env.NODE_ENV || 'development',
	config = require('../config/config')[env],
	utility = require('../utility'),
	logger = require('../config/logger'),
	User = mongoose.model('User'),
	check = require('validator').check,
	sanitize = require('validator').sanitize,
	moment = require('moment');

exports.create = function(req, res, next) {
	logger.log('info', 'Recieved request for user/create: ', req.body);

	var error, // error passed to the user
		user; // user object being created

	// request validation and sanitization
	try {
		check(req.body.email, 'Given email address is invalid').len(6, 64).isEmail();
		check(req.body.password, 'Given password is too short').len(8, 128);
	} catch (e) {
		logger.log('info', 'Invalid request paramaters: ', e.message);

		error = {
			type: 'Validation',
			message: e.message
		};

		res.send(400, error);
		return next(e.message);
	}

	User.findOne({
		email: req.body.email.toLowerCase()
	}, function(err, result) {
		if (err) {
			logger.log('error', 'Failed searching for a duplicate account :', err);

			error = {
				type: 'Internal',
				message: 'Unexpected Error Occured'
			};

			res.send(500, error);

			next(err);
		} else {
			if (result) {
				error = {
					type: 'Validation',
					message: 'An account exists already with the supplied e-mail'
				};

				res.send(409, error);

				next(JSON.stringify(error));
			} else {

				user = new User({
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					email: req.body.email,
					password: req.body.password,
					activationToken: User.generateToken(),
					active: false,
					createdOn: new Date()
				});

				user.save(function(err, obj) {
					// is there a error creating the user?
					if (err) {
						// is the error a validation error
						if (err.name === 'ValidationError') {
							error = {
								type: 'Validation',
								message: err.Messages
							};

							res.send(400, {
								error: JSON.stringify(error)
							});

							logger.log('info', 'Validation error encountered while saving the "user".', {
								input: JSON.stringify(user),
								output: JSON.stringify(err.Messages)
							});


						} else { // if not validation, then this is probably an internal error
							res.send(500);


							logger.log('error', 'Error encountered while saving the following "user".', {
								input: JSON.stringify(user),
								output: JSON.stringify(err.Messages)
							});
						}

						return next(err);
					} else {
						logger.log('info', 'Successully saved "user" object in db.', JSON.stringify(obj));

						// if user is created we must send a verification mail
						user.sendVerificationMail(
							function(err) {
								if (err) {
									logger.log('error', 'Account created but error sending e-mail for %s. Rolling back the creation.', obj.email, {
										error: JSON.stringify(err)
									});
									user.remove(function(err) {
										if (err) {
											logger.log('error', 'Cannot rollback account creation for %s. Code: BETTER_CALL_SAUL', obj.email, {
												error: JSON.stringify(err)
											});

											error = {
												type: 'Internal',
												message: 'A surprisingly new error had occured. We will rectify this and contact you on your e-mail. Sorry for the inconvenience.'
											};

											res.send(500, JSON.stringify(error));

											return next(err);
										} else {
											logger.log('info', 'Rolled back account creation for %s.', obj.email);

											error = {
												type: 'Internal',
												message: 'A surprisingly new error had occured. Please try again in a few minutes.'
											};

											res.send(500, JSON.stringify(error));

											return next(err);
										}
									});
								} else {
									logger.log('info', 'Email successfully sent to %s.', obj.email);
									res.send(201);
								}
							}
						);
					}
				});

			}
		}
	});
};

exports.token = {
	create: function(email, res, next) { // req is getting intercepted and we need only the email
		logger.log('info', 'Recieved request for user/token/create: ', email);

		// no validation and sanitization necessary because the only twp fields
		// we're counting on would be validated by the time we get here

		User.findOne({
			email: email
		}, function(err, result) {
			if (err || !result) {
				logger.log('error', 'Failed to find a user, but passport already authenticated the user');

				res.send(500);
			} else {
				result.authToken = utility.generateKey(32);
				result.authTokenExpiredOn = moment().add('minutes', 30).format();
				result.save(function(err, obj) {
					if (!err) {
						logger.log('info', 'Successfully issued a new token to :', obj.email);

						res.send(201, {
							access_token: obj.authToken,
							expiration: obj.authTokenExpiredOn
						});
					} else {
						logger.log('error', 'Error occured while saving the updated authToken');

						res.send(500);
					}
				});
			}
		});
	},
	check: function(req, res, next) {

		// no validation and sanitization necessary because the only twp fields
		// we're counting on would be validated by the time we get here

		res.send(200);
	},
	delete: function(req, res, next) {

		// no validation and sanitization necessary because the only twp fields
		// we're counting on would be validated by the time we get here

		User.findOne({
			authToken: req.body.access_token
		}, function(err, result) {
			if (!err && result) {
				result.authTokenExpiredOn = new Date();
				result.save(function(err, obj) {
					res.send(200);
				});
			} else if (err) {
				res.send(500);
			} else {
				res.send(400);
			}
		});
	}
};

exports.activate = function(req, res, next) {

	logger.log('info', 'Recieved a request for /user/activate: ', req.body);

	var email = decodeURIComponent(req.body.email).toLowerCase(),
		token = decodeURIComponent(req.body.token),
		error = null;


	try {
		check(email, 'Given email address is invalid').len(6, 64).isEmail();
		check(token, 'Token is invalid').len(16);
	} catch (e) {
		logger.log('info', 'Invalid request paramaters: ', e.message);

		error = {
			type: 'Validation',
			message: 'Invalid request'
		};

		res.send(400, error);
		return next(e.message);
	}

	User.findOne({
		email: email,
		activationToken: token
	}, function(err, result) {
		if (err) {
			res.send(500);
			return next(err);
		} else {
			if (!result) {
				res.send(400, {
					type: 'Validation',
					message: 'Invalid Request'
				});

				return next('Invalid request');
			} else {
				if (result.active) {
					error = {
						type: 'Validation',
						message: 'User is already activated'
					};

					res.send(400, error);
					return next(error);
				} else {

					result.active = true;
					result.token = '';
					result.save(function(err, obj) {
						if (err) {
							res.send(500);
							return next(err);
						} else {
							res.send(200);
						}
					});
				}
			}
		}

	});
};

exports.profile = function(req, res, next) {
	logger.log('info', 'Recived a request for /user/profile :', req.body);

	var error,
		user,
		profile;

	// parsin JSON
	try {
		profile = JSON.parse(req.body.profile);
	} catch (e) {
		error = {
			type: 'Validation',
			message: 'Invalid JSON'
		};

		res.send(400, error);
		return next(error.message);
	}

	// validation and sanitation
	try {

		var endDateAltered = function(endDate) {
			if (endDate) {
				return endDate;
			} else {
				return new Date();
			}
		}

		if (profile.dateOfBirth !== undefined) {
			check(profile.dateOfBirth, 'Invalid dateOfBirth').isAfter(moment().subtract('years', 15).format());
		}

		if (profile.gender !== undefined) {
			sanitize(profile.gender).toBoolean();
		}

		if (profile.contactNumbers) {
			for (var i = 0; i < profile.contactNumbers.length; i++) {
				check(profile.contactNumbers[i], 'Invalid contactNumber').len(9);
			}
		}

		if (profile.isLookingOut !== undefined) {
			sanitize(profile.isLookingOut).toBoolean();
		}


		if (profile.Tenures) {
			for (var i = profile.Tenures.length - 1; i >= 0; i--) {
				check(profile.Tenures[i].position, 'Invalid position in Tenure').notEmpty();
				check(profile.Tenures[i].organization, 'Invalid organization in Tenure').notEmpty();
				check(profile.Tenures[i].startedOn, 'Invalid startedOn/enededOn in Tenure').isBefore(endDateAltered(profile.Tenures[i].enededOn));
			};
		}

		if (profile.Skills) {
			for (var i = profile.Skills.length - 1; i >= 0; i--) {
				check(profile.Skills[i].name, 'Invalid name in Skills').notEmpty();
				check(profile.Skills[i].experience, 'Invalid experience in Skills').notEmpty().isInt().max(20);
			};
		}

		if (profile.Qualifications) {
			for (var i = profile.Qualifications.length - 1; i >= 0; i--) {
				check(profile.Qualifications[i].name, 'Invalid name in Qualification').notEmpty();

				if (startedOn) {
					check(profile.Qualifications[i].startedOn, 'Invalid startedOn/endedOn in Qualification').isBefore(endDateAltered(endedOn));
				}

				sanitize(profile.Qualifications[i].isComplete).toBoolean();
			};
		}
	} catch (e) {
		error = {
			type: 'Validation',
			message: e.message
		};

		logger.log('info', e.message);
		res.send(400, error);

		return next(error.message);
	}

	User.findOne({
		email: req.user.email,
	}, function(err, result) {
		if (err) {
			res.send(500);
			return next(err);
		}

		logger.info(req.user.email);

		if (!result) {
			res.send(500);
			logger.log('error', 'BETTER_CALL_SAUL: 8FNH46');
			return next(err);
		}

		if (profile.firstName !== undefined) result.firstName = profile.firstName;
		if (profile.lastName !== undefined) result.lastName = profile.lastName;
		if (profile.dateOfBirth !== undefined) result.dateOfBirth = profile.dateOfBirth;
		if (profile.gender !== undefined) result.gender = profile.gender;
		if (profile.location !== undefined) result.location = profile.location;
		if (profile.contactNumbers !== undefined) result.contactNumbers = profile.contactNumbers;
		if (profile.nationalIdentifier !== undefined) result.nationalIdentifier = profile.nationalIdentifier;
		if (profile.isLookingOut !== undefined) result.isLookingOut = profile.isLookingOut;
		if (profile.languages !== undefined) result.languages = profile.languages;
		if (profile.tenures !== undefined) result.tenures = profile.tenures;
		if (profile.skills !== undefined) result.skills = profile.skills;
		if (profile.qualifications !== undefined) result.qualifications = profile.qualifications;

		result.save(function(err, saved) {
			if (err && err.name === 'ValidationError') {
				error = {
					type: 'Validation',
					message: err.Messages
				};

				res.send(400, {
					error: error
				});

				logger.log('info', 'Validation error encountered while saving the "user".', {
					input: JSON.stringify(user),
					output: JSON.stringify(err)
				});

				return next(error.message);

			} else if (err) { // if not validation, then this is probably an internal error
				res.send(500);


				logger.log('error', 'Error encountered while saving the following "user".', {
					input: JSON.stringify(user),
					output: JSON.stringify(err.Messages)
				});

				return next(error.output);
			}

			res.send(200, saved);
		});
	});
}