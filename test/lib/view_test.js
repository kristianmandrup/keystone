var demand = require('must');
var request = require('supertest');
var methodOverride = require('koa-methodoverride');
var bodyParser = require('koa-bodyparser');
var router = require('koa-router')();
var keystone = require('../../index.js');

var getApp = function() {
	var app = keystone.koa();
	app.use(bodyParser());
	// 	extended: true
	// }));
	app.use(methodOverride());
	app.router = router;
	app
	  .use(router.routes())
	  .use(router.allowedMethods());

	return app;
};

describe('Keystone.View', function() {
	var app = getApp();
	var router = app.router;
	var request = require('co-supertest').agent(app.listen());

	describe('new', function() {
		it('must be an instance of View', function*() {
			router.get('/', function*() {
				var ctx = this;
				var view = new keystone.View(ctx.req, ctx.res);
				view.must.be.an.instanceof(keystone.View);
				ctx.body = 'OK';
			});
			var res = yield request.get('/').end();
			expect(res.text).to.eql('OK');
		});
	});

	describe('.render(callback)', function() {
		it('must call the callback function', function*() {
			router.get('/', function*() {
				var ctx = this;
				var view = new keystone.View(ctx.req, ctx.res);
				view.render(function() {
					ctx.body = 'OK';
				});
			});
			var res = yield request.get('/').end();
			expect(res.text).to.eql('OK');
		});
	});

	describe('.render(callback)', function() {
		it('must pass (err, req, res) to the callback', function*() {
			// var app = getApp();
			router.get('/', function*() {
				var ctx = this;
				var view = new keystone.View(ctx.req, ctx.res);
				view.render(function(err, req2, res2) {
					demand(err).not.exist();
					req2.must.equal(req);
					res2.must.equal(res);
					ctx.body = 'OK';
				});
			});
			var res = yield request.get('/').end();
			expect(res.text).to.eql('OK');
		});
	});

	describe('.on(event, [match,] fn)', function() {

		it('must call init methods first', function*() {
			// var app = getApp();
			router.get('/', function*() {
				var ctx = this;
				var view = new keystone.View(ctx.req, ctx.res);
				var status = 'NOT OK';
				view.on('init', function() {
					status = 'OK';
				});
				view.render(function() {
					ctx.body = status;
				});
			});
			var res = yield request.get('/').end();
			expect(res.text).to.eql('OK');
		});


		function getApp_getAndPost() {
			// var app = getApp();
			router.all('/', function*() {
				var ctx = this;
				var view = new keystone.View(ctx.req, ctx.res);

				var status = 'OK';
				view.on('get', function() {
					status = 'OK GET';
				});
				view.on('post', function() {
					status = 'OK POST';
				});
				view.render(function() {
					ctx.body = status;
				});
			});
			return app;
		}

		it('must call get actions correctly', function*() {
			var res = yield request(getApp_getAndPost()).get('/').end();
			expect(res.text).to.eql('OK GET');
		});

		it('must call post actions correctly', function*() {
			var res = yield request(getApp_getAndPost()).post('/').end();
			expect(res.text).to.eql('OK POST');
		});

		function getApp_conditionalGet() {
			// var app = getApp();
			router.get('/', function*() {
				var ctx = this;
				var view = new keystone.View(ctx.req, ctx.res);

				var status = 'OK';
				view.on('get', { test: 'yes' }, function() {
					status = 'OK GET';
				});
				view.render(function() {
					ctx.body = status;
				});
			});
			return app;
		}

		it('must invoke get actions with matching query parameters', function*() {
			var res = yield request(getApp_conditionalGet()).get('/?test=yes').end();
			expect(res.text).to.eql('OK GET');
		});

		it('must skip get actions without matching query parameters', function*() {
			var res = yield request(getApp_conditionalGet()).get('/').end();
			expect(res.text).to.eql('OK');
		});

		function getApp_conditionalPostValue() {
			// var app = getApp();
			router.post('/', function*() {
				var ctx = this;
				var view = new keystone.View(ctx.req, ctx.res);

				var status = 'OK';
				view.on('post', { test: 'yes' }, function() {
					status = 'OK POST';
				});
				view.render(function() {
					ctx.body = status;
				});
			});
			return app;
		}

		it('must invoke post actions with matching body data', function*() {
			var res = yield request(getApp_conditionalPostValue()).post('/').send({ test: 'yes' }).end();
			expect(res.text).to.eql('OK POST');
		});

		it('must skip post actions with non-matching body data', function*() {
			var res = yield request(getApp_conditionalPostValue()).post('/').send({ test: 'no' }).end();
			expect(res.text).to.eql('OK');
		});

		function getApp_conditionalPostTruthy() {
			var app = getApp();
			app.post('/', function(req, res) {
				var view = new keystone.View(req, res);
				var status = 'OK';
				view.on('post', { test: true }, function(next) {
					status = 'OK POST';
					next();
				});
				view.render(function() {
					res.send(status);
				});
			});
			return app;
		}

		// it('must invoke post actions with body data present', function(done) {
		// 	request(getApp_conditionalPostTruthy())
		// 		.post('/')
		// 		.send({ test: 'yes' })
		// 		.expect('OK POST', done);
		// });
		//
		// it('must skip post actions without matching body data', function(done) {
		// 	request(getApp_conditionalPostTruthy())
		// 		.post('/')
		// 		.expect('OK', done);
		// });

		function getApp_extRequest() {
			var app = getApp();
			router.get('/', function(req, res) {
				req.ext = { prop: 'value' };
				var view = new keystone.View(req, res);
				var status = 'NOT OK';
				view.on({ 'ext.prop': 'value' }, function(next) {
					status = 'OK';
					next();
				});
				view.render(function() {
					res.send(status);
				});
			});
			return app;
		}

		// it('must invoke actions based on req properties', function(done) {
		// 	request(getApp_extRequest())
		// 		.get('/')
		// 		.expect('OK', done);
		// });

	});

});
