/**
 * Adds iframe protection headers to the response
 *
 * ####Example:
 *
 *     app.use(keystone.security.frameGuard(keystone));
 *
 * @param {app.request} req
 * @param {app.response} res
 * @param {function} next
 * @api public
 */

exports = module.exports = function(keystone) {
	return function*() {
		var options = keystone.get('frame guard');

		if (options) {
			this.res.header('x-frame-options', options);
		}
	};
};
