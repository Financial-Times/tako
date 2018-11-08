const assert = require("assert");
const repositoryStore = require("./repositories").instance;

class InitialisationError extends Error {
	constructor(message, meta) {
		// Calling parent constructor of base Error class.
		super(message);

		// Saving class name in the property of our custom error as a shortcut.
		this.name = this.constructor.name;

		// Capturing stack trace, excluding constructor call from it.
		Error.captureStackTrace(this, this.constructor);

		// Typically we'll define an `err` property on meta.
		this.meta = meta;
	}
}

/**
 * Initialise the application.
 *
 * @param {import('probot').Application} app - Probot's Application class.
 */
module.exports = async app => {
	// Create a scoped logger to track the initialisation.
	const logger = app.log.child({ name: "init" });

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
	const octokit = await app.auth().catch(err => {
		throw new InitialisationError("Failed to authenticate as a GitHub App", {
			err
		});
	});

	logger.debug(`Authenticated as a GitHub App`);

	/**
	 * Get every installation of the GitHub App. There should only be one.
	 *
	 * Tako should be a private (also know as internal) GitHub App, installed on the same account it is administered by.
	 *
	 * @see https://developer.github.com/apps/managing-github-apps/making-a-github-app-public-or-private/#private-installation-flow
	 * @see https://octokit.github.io/rest.js/#api-Apps-getInstallations
	 */
	const installations = await octokit.apps.getInstallations().catch(err => {
		throw new InitialisationError("Failed to get the installations", { err });
	});

	logger.debug(`Found the installations`, installations.data.map(i => i.id));

	assert(
		Array.isArray(installations.data) && installations.data.length === 1,
		"Tako should be an internal GitHub App, to configure this see https://developer.github.com/apps/managing-github-apps/making-a-github-app-public-or-private/#private-installation-flow."
	);

	// @see https://developer.github.com/v3/apps/#response-2
	const installationAccount = installations.data[0].account.login;

	// https://developer.github.com/v3/apps/#response
	const administratorAccount = (await octokit.apps.get()).data.owner.login;

	logger.debug(`Comparing installation account to App owner`, {
		installation: installationAccount,
		owner: administratorAccount
	});

	assert(
		installationAccount === administratorAccount,
		"Tako should only be installed on accounts administered by financial-times-sandbox"
	);

	const installationId = installations.data[0].id;

	/**
	 * Get an installation authenticated GitHub API client, by passing `app.auth` the installation id.
	 *
	 * This uses a private method on app, as we don't have an authenticated event context here.
	 *
	 * @see https://developer.github.com/apps/building-github-apps/authenticating-with-github-apps/#authenticating-as-an-installation
	 * @see https://probot.github.io/api/latest/classes/application.html#auth
	 *
	 * @type {import('probot').GitHubAPI}
	 */
	const installation = await app.auth(installationId).catch(err => {
		throw new InitialisationError(
			`Failed to authenticate as installation ${installationId}`,
			{ err }
		);
	});

	logger.debug(`Authenticated as installation ${installationId}`);

	try {
		// Get the repositories this app is installed on.
		// @see https://octokit.github.io/rest.js/#api-Apps-getInstallationRepositories
		const repositories = await installation.paginate(
			installation.apps.getInstallationRepositories({ per_page: 100 }),
			res => res.data.repositories // Pull out only the list of repositories from each response.
		);

		// Save each repository to our global map of repositories.
		repositories.forEach(({ id, name }) => {
			repositoryStore.set(id, { id, name });
		});
	} catch (err) {
		throw new InitialisationError(
			`Failed to fetch repository information with apps.getInstallationRepositories`,
			{ err }
		);
	}

	logger.info(`Loaded ${repositoryStore.size} repositories`);
};
