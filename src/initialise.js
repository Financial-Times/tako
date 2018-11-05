const assert = require('assert').strict;

/**
 * Initialise the application.
 *
 * @param {import('probot').Application} app - Probot's Application class.
 */
module.exports = async (app) => {
	// Create a scoped logger to track the initialisation.
	const logger = app.log.child({ name: 'init' });

	/**
	 * Get a GitHub App authenticated GitHub API client.
	 *
	 * This uses a private method on app, as we don't have an authenticated event context here.
	 *
	 * @see https://probot.github.io/api/latest/classes/application.html#auth
	 * @see https://developer.github.com/apps/building-github-apps/authenticating-with-github-apps/#authenticating-as-a-github-app
	 *
	 * @type {import('probot').GitHubAPI}
	 */
	const octokit = await app.auth().catch((err) => {
		throw new Error('Failed to authenticate as a GitHub App', err);
	});

	logger.debug(`Authenticated as a GitHub App`);

	/**
	 * Get every installation of the GitHub App. There should only be one.
	 *
	 * Tako should be a private (also know as internal) GitHub App, installed on the same account it is administered by.
	 *
	 * @see https://developer.github.com/apps/managing-github-apps/making-a-github-app-public-or-private/#private-installation-flow
	 */
	const installations = await octokit.apps.getInstallations().catch((err) => {
		throw new Error('Failed to get the installations', err);
	});

	logger.debug(`Found the installations`, installations.data.map((i) => i.id));

	assert(
		Array.isArray(installations.data) && installations.data.length === 1,
		'Tako should be an internal GitHub App, to configure this see https://developer.github.com/apps/managing-github-apps/making-a-github-app-public-or-private/#private-installation-flow.'
	);

	// @see https://developer.github.com/v3/apps/#response-2
	const installationAccount = installations.data[0].account.login;

	const administratorAccount = (await octokit.apps.get({})).data.owner.login;

	assert(
		installationAccount === administratorAccount,
		'Tako should only be installed on accounts administered by financial-times-sandbox'
	);

	const installationId = installations.data[0].id;

	/**
	 * Get an installation authenticated GitHub API client, by passing `app.auth` the installation id.
	 *
	 * This uses a private method on app, as we don't have an authenticated event context here.
	 *
	 * @see https://developer.github.com/apps/building-github-apps/authenticating-with-github-apps/#authenticating-as-an-installation
	 *
	 * @type {import('probot').GitHubAPI}
	 */
	const installation = await app.auth(installationId).catch((err) => {
		throw new Error(
			`Failed to authenticate as installation ${installationId}`,
			err
		);
	});

	logger.debug(`Authenticated as installation ${installationId}`);

	/**
	 * Create a store for our repositories.
	 *
	 * @type {Map}
	 */
	const repositoryStore = new Map();

	// Add our repository store to the app.
	app.repositoryStore = repositoryStore;

	logger.debug(`Created the repository store`);

	(await installation.paginate(
		installation.apps.getInstallationRepositories(),
		(res) => res.data.repositories
	)).forEach((repository) => repositoryStore.set(repository.id, repository));

	logger.info(`Loaded ${repositoryStore.size} repositories`);
};
