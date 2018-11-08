const repositoryStore = require("./repositories").instance;

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
	res.set("Cache-Control", "max-age=0");
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
const router = app => {
	const logger = app.log.child({ name: "api" });

	// Get an express router from the Probot application instance
	const router = app.route("/tako");

	// Responses could frequently change, so send a sensible cache-control header.
	router.use(noCache);

	logger.debug("registered the noCache middleware");

	if (bearerToken) {
		router.use(auth);
		logger.debug("registered the auth middleware");
	} else {
		logger.debug("skipped registered the auth middleware");
	}

	/**
	 * An endpoint to check that Tako is fully loaded.
	 *
	 * While Tako is starting up, this endpoint will respond with a 404 status code.
	 */
	router.get("/__gtg", (req, res) => res.send(200, "OK"));

	/**
	 * Get yourself a list of repositories.
	 */
	router.get("/repositories", async (req, res) => {
		if (req.query.topic) {
			await handleFiltered(req, res);
		} else {
			handleDefault(req, res);
		}
	});

	/**
	 * Handle the default route for /repositories.
	 *
	 * @param {import('express').Request} req
	 * @param {import('express').Response} res
	 */
	const handleDefault = (req, res) => {
		const repositories = Array.from(repositoryStore).map(
			// eslint-disable-next-line no-unused-vars
			([key, repository]) => ({
				name: repository.name
			})
		);

		res.send({ repositories });
	};

	/**
	 * Handle the route for /repositories, filtered by topic.
	 *
	 * We use the GitHub repository search to find all repositories by topic, then
	 * filter out any that we don't manage.
	 *
	 * @see https://octokit.github.io/rest.js/#api-Search-repos
	 * @see https://developer.github.com/v3/search/#search-repositories
	 *
	 * @param {import('express').Request} req
	 * @param {import('express').Response} res
	 */
	const handleFiltered = async (req, res) => {
		// Get our list of managed repositories.
		const repositories = Array.from(repositoryStore).map(
			// eslint-disable-next-line no-unused-vars
			([key, { id, name }]) => ({ id, name })
		);

		// Pull out the topic to filter by.
		const topic = req.query.topic;

		logger.trace("Searching by topic", { topic });

		try {
			// Get a GitHub App authenticated instance of octokit.
			const octokit = await app.auth();

			/**
			 * We should be an internal GitHub App, so we can limit our search
			 * to the org that we are owned by.
			 */
			const org = (await octokit.apps.get()).data.owner.login;

			// Search for all repositories in our org, by topic.
			const results = await octokit.paginate(
				octokit.search.repos({ q: `org:${org} topic:${topic}`, per_page: 100 }),
				res => res.data.items.map(item => item.id) // Pull out only the repository ID from the results.
			);

			// Filter out any repository that we don't manage, and map to just the name property.
			const filtered = repositories
				.filter(r => results.includes(r.id))
				.map(({ name }) => ({ name }));

			logger.trace("Search results after filtering", { filtered });

			res.send({ repositories: filtered });
		} catch (err) {
			/**
			 * Throwing an error leads to a 404 response in Probot, so we need to
			 * explicitly return a 500 status code if we encounter an error.
			 */
			res.sendStatus(500);

			// Re-throw so that this bubbles into any other exception handling.
			throw err;
		}
	};

	logger.debug("registered the /tako router");
};

module.exports = router;
