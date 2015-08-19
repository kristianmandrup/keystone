/**
 * Returns an Express Router with bindings for the Admin UI static resources,
 * i.e files, less and browserified scripts.
 *
 * Should be included before other middleware (e.g. session management,
 * logging, etc) for reduced overhead.
 */

var browserify = require('./browserify');
var koa = require('koa');
var less = require('koa-less');
var path = require('path');
var app = koa();
var router = require('koa-router')();

/* Prepare browserify bundles */

var bundles = {
	fields: browserify('fields.js', 'FieldTypes'),
	home: browserify('views/home.js'),
	item: browserify('views/item.js'),
	list: browserify('views/list.js')
};

router.prebuild = function() {
	bundles.fields.build();
	bundles.home.build();
	bundles.item.build();
	bundles.list.build();
};

/* Prepare LESS options */

var reactSelectPath = path.join(path.dirname(require.resolve('react-select')), '..');

var lessOptions = {
	render: {
		modifyVars: {
			reactSelectPath: JSON.stringify(reactSelectPath)
		}
	},
	dest: path.join(__dirname, '../../public/styles')
};

// less
app.use(less('/styles', lessOptions));

// static assets
var serve = require('koa-static');
var staticPath = path.join(__dirname, '../../public');
app.use(serve(staticPath));

// routes
router.get('/js/fields.js', bundles.fields.serve);
router.get('/js/home.js', bundles.home.serve);
router.get('/js/item.js', bundles.item.serve);
router.get('/js/list.js', bundles.list.serve);

app
  .use(router.routes())
  .use(router.allowedMethods());

module.exports = router;
