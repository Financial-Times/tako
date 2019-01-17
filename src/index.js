const routes = require("./routes");
const repositories = require("./repositories");

/**
 * @param {import('probot').Application} app - Probot's Application class.
 */
module.exports = async app => {
	await routes(app);

	const refresh = async github => {
		await repositories.refresh(github);
		app.log.debug("Refreshed the repositoryStore. Length:", repositories.list().length);
	}

	/**
	 * On appropriate events, refresh the whole list of Tako repositories.
	 * @see https://developer.github.com/webhooks/#events for a list of all GitHub webhook events.
	 */
	app.on([
		"installation_repositories",
	], ({ github }) => refresh(github));

	/**
	 * app.auth()
	 * @property process.env.INSTALLATION_ID - ID of the installation, which can be extracted from:
	 *  a) `context.payload.installation.id` or
	 *  b) the URL https://github.com/organizations/[org]/settings/installations/[installation_id]
	 * @returns An authenticated GitHub API client
	 * @see https://github.com/probot/probot/blob/master/src/application.ts#L180
	 */
	const github = await app.auth(process.env.INSTALLATION_ID);
	refresh(github);
};
