const routes = require('./routes');
const initialise = require('./initialise');

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

	app.on('installation_repositories.added', async () => {
		// TODO: Actually add new repositories to the store.
	});

	app.on(
		'installation_repositories.removed',
		({ local: { repositoryStore }, payload: { repositories_removed } }) => {
			repositories_removed.forEach((repository) =>
				repositoryStore.delete(repository.id)
			);
		}
	);
};
