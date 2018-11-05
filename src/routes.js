const repositoryStore = require('./repositories').instance;

/**
 * Secure the endpoint using the `Authorization` header and a bearer token.
 *
 * curl -X GET 'https://ft-next-tako.herokuapp.com/tako/repositories' -H 'Authorization: Bearer hunter2'
 */
const bearerToken = process.env.BEARER_TOKEN;

/**
 * Caching middleware, we don't want to cache responses.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const noCache = (req, res, next) => {
	res.set('Cache-Control', 'max-age=0');
	next();
};

/**
 * Authentication middleware.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const auth = (req, res, next) => {
	if (req.get('Authorization') === `Bearer ${bearerToken}`) {
		next();
	} else {
		res.sendStatus(401);
	}
}

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
	const logger = app.log.child({ name: 'api' });

	// Get an express router from the Probot application instance
	const router = app.route('/tako');

	// Responses could frequently change, so send a sensible cache-control header.
	router.use(noCache);

	logger.debug(`registered the noCache middleware`);

	if (bearerToken) {
		router.use(auth);
		logger.debug(`registered the auth middleware`);
	} else {
		logger.debug(`skipped registered the auth middleware`);
	}

	/**
	 * Convert repositoryStore into an object that we can pass into router.
	 */
	const repositories = Array.from(repositoryStore).map(
		// eslint-disable-next-line no-unused-vars
		([key, repository]) => ({
			name: repository.name,
			topics: repository.topics
		})
	);

	router.get('/repositories', (req, res) => {
		res.send({ repositories });
	});

	logger.debug(`registered the /tako router`);
};

module.exports = router;
