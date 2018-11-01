/**
 * Caching middleware, we don't want to cache responses.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const noCache = (req, res, next) => {
	res.set('cache-control', 'max-age=0');
	next();
};

/**
 * Define the API for Tako.
 *
 * Registers the routes with Probot using an express router.
 *
 * Uses a prefix of `/tako` so that this can be included in a multi-app Probot setup.
 *
 * @see https://probot.github.io/docs/http/
 *
 * @param {import('probot').Application} app
 */
const router = (app) => {
	const log = app.log.child({ name: 'api' });

	// Get an express router from the Probot application instance
	const router = app.route('/tako');

	// Responses could frequently change, so send a sensible cache-control header.
	router.use(noCache);

	log.debug(`registered the noCache middleware`);

	router.get('/repositories', (req, res) => {
		res.send({
			repositories: [
				{
					name: 'next-foo-bar',
					topics: ['next-heroku-platform', 'next-user-facing-app']
				}
			]
		});
	});

	log.debug(`registered the /tako router`);
};

module.exports = router;
