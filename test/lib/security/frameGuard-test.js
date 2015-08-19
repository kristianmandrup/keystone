var keystone = require('../../..');
var demand = require('must');
var request = require('supertest');
var demand = require('must');
var getApp = require('../../helpers/getApp');
var app = getApp();
var router = app.router;
var request = require('co-supertest').agent(app.listen());

var frameGuard = require('../../../lib/security/frameGuard');
var parse = require('co-body');
var expect = require('chai').expect;

describe('Keystone "frame guard" setting', function () {
	before(function() {
		app.use(frameGuard(keystone));
		router.get('/', function*() {
			this.body = 'OK';
		});
	});

	describe('default setting', function() {

		it('should be "sameorigin"', function() {
			demand(keystone.get('frame guard')).to.be('sameorigin');
		});

	});

	describe('keystone.set("frame guard")', function() {

		it('should allow setting to "sameorigin"', function() {
			keystone.set('frame guard', 'sameorigin');
			demand(keystone.get('frame guard')).to.be('sameorigin');
		});

		it('should allow setting to "deny"', function() {
			keystone.set('frame guard', 'deny');
			demand(keystone.get('frame guard')).to.be('deny');
		});

		it('should allow setting to TRUE, converts to "deny"', function() {
			keystone.set('frame guard', true);
			demand(keystone.get('frame guard')).to.be('deny');
		});

		it('should allow setting to FALSE', function() {
			keystone.set('frame guard', false);
			demand(keystone.get('frame guard')).to.be(false);
		});

		it('should translate invalid options to FALSE', function() {
			keystone.set('frame guard', 'xxx');
			demand(keystone.get('frame guard')).to.be(false);
			keystone.set('frame guard', 999);
			demand(keystone.get('frame guard')).to.be(false);
			keystone.set('frame guard', []);
			demand(keystone.get('frame guard')).to.be(false);
			keystone.set('frame guard', {});
			demand(keystone.get('frame guard')).to.be(false);
		});

	});

	describe('X-Frame-Options header', function() {

		it('should be set to "deny" when "frame guard" is "deny"', function*() {
			keystone.set('frame guard', 'deny');
			var res = yield request
				.get('/').end();
			// expect('x-frame-options', 'deny')
			expect(res.status).to.eql(200);
		});

		it('should be set to "sameorigin" when "frame guard" is "sameorigin"', function*() {
			keystone.set('frame guard', 'sameorigin');
			var res = yield request
				.get('/').end();

			expect(res.status).to.eql(200);
		});

		it('should be set to "deny" when "frame guard" is TRUE', function*() {
			keystone.set('frame guard', true);
			var res = yield request
				.get('/').end();

			expect(res.status).to.eql(200);
		});

		it('should not be set when "frame guard" is FALSE', function*() {
			keystone.set('frame guard', false);

			var res = yield request
				.get('/')
				.end();

			expect(res.status).to.eql(200);
		});

	});

});
