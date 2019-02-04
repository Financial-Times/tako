const routes = require("./routes");
const repositories = require("./repositories");

/**
 * @param {import('probot').Application} app - Probot's Application class.
 */
module.exports = async app => {
	// Register the routes with Probot using an Express router.
	await routes(app);

	/**
	 * Refresh the Repository Store for all installation instances.
	 */
	const refresh = async () => {
		// Reset the repository store
		repositories.clear();

		// Authenticate the Tako GitHub application and get all of its installations
		const githubApp = await app.auth();
		const installations = await githubApp.apps.listInstallations();

		// For each installation, update the repository store
		installations.data.forEach(async ({ id }) => {
			// @property {import('probot').GitHubAPI} github - An authenticated octokit instance
			const github = await app.auth(id);
			await repositories.update(github);
			app.log.debug(
				`Refreshed the repositoryStore for installation #${id}. Length: ${
					repositories.list().length
				}`
			);
		});
	};

	// Initialise the repository list on startup
	refresh();

	/**
	 * On appropriate events, refresh the whole list of Tako repositories.
	 * @see https://developer.github.com/v3/activity/events/types/#repositoryevent
	 * @see https://developer.github.com/v3/activity/events/types/#installationrepositoriesevent
	 */
	app.on(
		[
			"repository.archived",
			"repository.unarchived",
			"installation_repositories"
		],
		refresh
	);
};
