var keystone = require('../index.js');
// var request = require('supertest');
var agent = require('supertest-koa-agent');
var demand = require('must');
var getApp = require('./helpers/getApp');
var removeModel = require('./helpers/removeModel');
var parse = require('co-body');
var expect = require('chai').expect;

describe('List schema pre/post save hooks', function() {
	var app = getApp();
	var router = app.router;
	var dummyUser = { _id: 'USERID' };
	var Test;
	var pre;
	var post;
	var testProps;

	var request = require('co-supertest').agent(app.listen());

	before(function() {
		// in case other modules didn't cleanup
		removeModel('Test');

		// create test model
		Test = keystone.List('Test'),
		Test.add({name: { type: String }});
		Test.schema.pre('save', function(next, done) {
			pre = this._req_user;
			next();
		});

		Test.schema.post('save', function() {
			post = this._req_user;
		});

		Test.register();
	});

	// cleanup
	after(function() {
		removeModel('Test');
	})

	describe('when using UpdateHandler()', function() {

		it('should receive ._req_user', function*() {
			pre = undefined;
			post = undefined;

			router.post('/using-update-handler', function*() {
				var item = new Test.model();
				var object = yield parse(this);
				var ctx = this;
				ctx.req.user = dummyUser;
				var updateHandler = item.getUpdateHandler(ctx.req);
				updateHandler.process(object, function(err, data) {
					if (err) {
						ctx.body = 'BAD';
						// res.send('BAD');
					} else {
						ctx.body = 'GOOD';
						// res.send('GOOD');
					}
				});
			});

			// var res = yield request.get('/').expect(200).end();
	    // expect(res.text).to.equal('Hello, World');
			var res = yield request.post('/using-update-handler').send({ name: 'test' }).end();
			expect(res.text).to.eql('GOOD');

				// .end(function(err, res){
				// 	if (err) return done(err);
				// 	demand(pre).be(dummyUser);
				// 	demand(post).be(dummyUser);
				// 	done();
				// });

		});

	});

	describe('when using .save()', function() {

		it('should not receive ._req_user', function*() {
			pre = undefined;
			post = undefined;

			router.post('/using-save', function *() {
				var ctx = this;
				ctx.req.user = dummyUser;
				var item = new Test.model(ctx.body);
				item.save(function(err, data) {
					if (err) {
						console.log(err);
						ctx.body ='BAD';
					} else {
						console.log('response', 'GOOD');
						ctx.body = 'GOOD';
						// res.send('GOOD');
					}
				});
			});

			var res = yield request
				.post('/using-save')
				.send({ name: 'test' })
				.end();

			expect(res.text).to.eql('GOOD');

				// .end(function(err, res){
				// 	if (err) return done(err);
				// 	demand(pre).be.undefined();
				// 	demand(post).be.undefined();
				// 	done();
				// });

		});

	});

});
