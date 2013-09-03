grizzly
=======

A node based REST API for demonstrating all around best practices in node development. This application demonstrates the usage of following modules.

Using [express](http://expressjs.com/) for REST API development
Using [passport](http://passportjs.org/) for authenticating and securing the API ([token-based](https://github.com/jaredhanson/passport-http-bearer) and [local](https://github.com/jaredhanson/passport-local) strategies)
Database modeling with [Mongoose](http://mongoosejs.com/)
Logging with [Winston](https://github.com/flatiron/winston)
E-mail connectivity with [nodemailer](https://github.com/andris9/Nodemailer)
Testing the API with [Mocha](https://github.com/visionmedia/mocha)

installation
============

Clone the repo and install the dependencies by running `npm install` within the cloned directory.
Be sure to change the configurations within the `config/config.js`.


running
=======

`node server.js`

testing
=======

`make test` for test execution
`make test-w` to establish a watch on the test suites

acknowledgements
================

The excellent [node-express-mongoose-demo](https://github.com/madhums/node-express-mongoose-demo) by [madhums](https://github.com/madhums)
