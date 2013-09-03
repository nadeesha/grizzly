var path = require('path')
  , rootPath = path.normalize(__dirname + '/..')
  , templatePath = path.normalize(__dirname + '/../app/mailer/templates')


module.exports = {
	/** 
	 * dev.
	 =================================================*/
	
	    
	development: {
	    db: 'mongodb://localhost/grizzlydb',
	    root: rootPath,
	    email: {
	    	address: '',
	    	password: ''
	    },
      web_client: {
        url: 'http://localhost:8000/app/#'
      }
  	},

  	/** 
  	 * test.
  	 =================================================*/
  	
  	    
  	test: {
    	db: 'mongodb://localhost/grizzlydb',
	    root: rootPath,
	    email: {
	    	address: '',
	    	password: ''
	    },
      app: {
        url: 'http://localhost',
        port: '3000'
      },
      web_client: {
        url: 'http://localhost:8000/app/#'
      }
  	},

  	/** 
  	 * prod.
  	 =================================================*/
  	
  	    
  	prod: {
  		db: 'mongodb://path/to/db',
  		root: rootPath,
  		email: {
	    	address: '',
	    	password: ''
	    },
      web_client: {
        url: 'http://myapp.com#'
      }
  	}
}