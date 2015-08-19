var keystone = require('../../index.js');
var mongoose = require('./getMongooseConnection.js');
var methodOverride = require('method-override');
var bodyParser = require('koa-bodyparser');

function getApp() {
	var app;

	keystone.init({
		'mongoose': mongoose
	});
	app = keystone.koa();

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(methodOverride());

	return app;
}

module.exports = getApp;
