var nodemailer = require('nodemailer'),
	env = process.env.NODE_ENV || 'development',
	config = require('./config/config')[env],
	S = require('string');

exports.sendMail = function sendMail(to, subject, body, callback) {
	// create reusable transport method (opens pool of SMTP connections)
	var smtpTransport = nodemailer.createTransport('SMTP', {
		service: 'Gmail',
		auth: {
			user: config.email.address,
			pass: config.email.password
		}
	});

	var mailOptions = {
		from: config.email.address, // sender address
		to: to, // list of receivers
		subject: subject,
		html: body,
		text: S(body).stripTags().s // rid the plaintext body from html tags
	}

	// send mail with defined transport object
	smtpTransport.sendMail(mailOptions, function(error, response) {
		if (error) {
			callback(error);
		}

		smtpTransport.close(); // shut down the connection pool, no more messages
		callback();
	});
}

var rn = function(max) {
	return Math.floor(Math.random() * max);
};

exports.generateKey = function(len) {
	var alpb, alps, chars, i, key, num, _i, _ref, _ref1;
	if (len == null) {
		len = 16;
	}
	_ref = ["0123456789", "ABCDEFGHIJKLMNOPQRSTUVWXTZ", "abcdefghiklmnopqrstuvwxyz"], num = _ref[0], alpb = _ref[1], alps = _ref[2];
	_ref1 = [(alpb + num + alps).split(''), ""], chars = _ref1[0], key = _ref1[1];
	for (i = _i = 1; 1 <= len ? _i <= len : _i >= len; i = 1 <= len ? ++_i : --_i) {
		key += chars[rn(chars.length)];
	}
	return key;
};