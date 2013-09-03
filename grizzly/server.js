var express = require('express'),
	env = process.env.NODE_ENV || 'development',
	config = require('./config/config')[env],
	mongoose = require('mongoose'),
	fs = require('fs'),
	passport = require('passport');

// bootstrap db connection
mongoose.connect(config.db);

// bootstrap models
var models_path = __dirname + '/models';
fs.readdirSync(models_path).forEach(function(file) {
	if (~file.indexOf('.js')) require(models_path + '/' + file)
});

// passport settings
require('./config/passport')(passport, config);

// express settings
var app = express();
require('./config/express')(app, config, passport)

// routes
require('./config/routes')(app, passport);

// opening port
var port = process.env.PORT || 3000;
app.listen(port);
console.log('Grizzly running on port ' + port);

exports = module.exports = app;