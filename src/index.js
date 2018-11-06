const routes = require('./routes');
const initialise = require('./initialise');
const repositoryStore = require('./repositories').instance;

/**
 * @param {import('probot').Application} app - Probot's Application class.
 */
module.exports = async (app) => {
	// Ensure that we crash Probot if we are unable to initialise.
	try {
		await initialise(app);
	} catch (err) {
		app.log.fatal('Failed to initialise', err);
		process.exit(1);
	}

	// And the same goes for loading our API routes.
	try {
		await routes(app);
	} catch (err) {
		app.log.fatal('Failed to load API routes', err);
		process.exit(1);
	}

	// See https://developer.github.com/webhooks/#events for a list of all GitHub webhook events.

	/**
	 * Add new repositories to the API.
	 */
	app.on('installation_repositories.added', async (context) => {
		// Pull out the list of added repositories.
		const added = context.payload.repositories_added;

		added.forEach(async (repository) => {
			// Pull out the owner and name.
			const [owner, repo] = repository.full_name.split('/');

			// The event doesn't come with the repository topics, so fetch them.
			const topics = await context.github.repos.getTopics({ owner, repo: repo })
				.names;

			// Save this new repository.
			repositoryStore.set(repository.id, { name: repo, topics: topics });

			context.log.info(`Added repository ${repository.full_name}`);
		});
	});

	/**
	 * Remove untracked repositories from the API.
	 */
	app.on('installation_repositories.removed', async (context) => {
		// Pull out the list of removed repositories.
		const removed = context.payload.repositories_removed;

		removed.forEach((repository) => {
			repositoryStore.delete(repository.id);
			context.log.info(`Removed repository ${repository.full_name}`);
		});
	});

	/**
	 * TODO: Convert this to look for the started event, the "kick".
	 */
	app.on('repository', async (context) => {
		// Pull out the repository.
		const repository = context.payload.repository;

		// The event doesn't come with the repository topics, so fetch them.
		const topics = await context.github.repos.getTopics(context.repo()).names;

		// Save or update this repository.
		repositoryStore.set(repository.id, {
			name: repository.name,
			topics: topics
		});

		app.log.info(`Added repository ${repository.full_name}`);
	});
};
