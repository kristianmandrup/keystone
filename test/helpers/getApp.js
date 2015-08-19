var keystone = require('../../index.js');
var mongoose = require('./getMongooseConnection.js');
var methodOverride = require('koa-methodoverride');
var bodyParser = require('koa-bodyparser');
var router = require('koa-router')();

function getApp() {
	var app;

	keystone.init({
		'mongoose': mongoose
	});
	app = keystone.koa();
	app.router = router;
	app
	  .use(router.routes())
	  .use(router.allowedMethods());

	app.use(bodyParser());
	// app.use(bodyParser.urlencoded({
	// 	extended: true
	// }));
	app.use(methodOverride());

	return app;
}

module.exports = getApp;
