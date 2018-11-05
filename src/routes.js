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

	/**
	 * Convert repositoryStore into an object that we can pass into router.
	 */
	// eslint-disable-next-line no-unused-vars
	const repositories = Array.from(app.repositoryStore).map(([ key, repository ]) => ({
		name: repository.name,
		topics: repository.topics
	}));

	router.get('/repositories', (req, res) => {
		res.send({ repositories });
	});

	log.debug(`registered the /tako router`);
};

module.exports = router;
