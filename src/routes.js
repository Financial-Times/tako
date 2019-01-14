const repositories = require("./repositories");

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
	res.set("Cache-Control", "max-age=0, no-cache");
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
	if (req.get("Authorization") === `Bearer ${bearerToken}`) {
		next();
	} else {
		res.sendStatus(401);
	}
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
const router = async app => {
	const logger = app.log.child({ name: "api" });

	// Get an express router from the Probot application instance
	const router = app.route("/tako");

	// Responses could frequently change, so send a sensible cache-control header.
	router.use(noCache);

	logger.debug("Registered the noCache middleware");

	if (bearerToken) {
		router.use(auth);
		logger.debug("Registered the auth middleware");
	} else {
		logger.debug("Skipped registered the auth middleware");
	}

	/**
	 * An endpoint to check that Tako is fully loaded.
	 *
	 * While Tako is starting up, this endpoint will respond with a 404 status code.
	 */
	app.router.get("/__gtg", (req, res) => res.send("OK"));

	/**
	 * Get yourself a list of repositories.
	 */
	router.get("/repositories", async (req, res) => {
		let repositoryList = repositories
			.list()
			.map(({ name, topics }) => ({ name, topics }));
		if (req.query.topic) {
			repositoryList = repositoryList.filter(repository => {
				return repository.topics.includes(req.query.topic);
			});
		}
		res.send({ repositories: repositoryList });
	});

	logger.info("Registered the /tako router");
};

module.exports = router;
