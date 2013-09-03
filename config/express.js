var express = require('express'),
	mongoStore = require('connect-mongo')(express);

module.exports = function(app, config, passport) {

	app.configure(function () {
		app.use(express.cookieParser());

		app.use(express.bodyParser());
		app.use(express.methodOverride());

		// init for passport
		app.use(passport.initialize());

    	app.use(app.router);
	})

	
}