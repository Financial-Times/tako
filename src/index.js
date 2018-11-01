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

	app.on(
		'installation_repositories.added',
		async ({ log, payload: { repositories_added } }) => {
			repositories_added.forEach((repository) => {
				app.repositoryStore.set(repository.id, repository);
				log.info(`Added repository ${repository.full_name}`);
			});
		}
	);

	app.on(
		'installation_repositories.removed',
		async ({ log, payload: { repositories_removed } }) => {
			repositories_removed.forEach((repository) => {
				app.repositoryStore.delete(repository.id);
				log.info(`Removed repository ${repository.full_name}`);
			});
		}
	);
};
