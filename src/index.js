const routes = require("./routes");
const initialise = require("./initialise");
const repositoryStore = require("./repositories").instance;

/**
 * @param {import('probot').Application} app - Probot's Application class.
 */
module.exports = async app => {
	// Ensure that we crash Probot if we are unable to initialise.
	try {
		await initialise(app);
	} catch (err) {
		app.log.fatal("Failed to initialise", err);
		process.exit(1);
	}

	// And the same goes for loading our API routes.
	try {
		await routes(app);
	} catch (err) {
		app.log.fatal("Failed to load API routes", err);
		process.exit(1);
	}

	// See https://developer.github.com/webhooks/#events for a list of all GitHub webhook events.

	/**
	 * Add new repositories to the API.
	 */
	app.on("installation_repositories.added", async context => {
		// Pull out the list of added repositories.
		const added = context.payload.repositories_added;

		added.forEach(async repository => {
			if (repository.archived) {
				context.log.info(`Excluded repository ${repository.full_name} because it is archived.`);
			}
			else {
				// Save this new repository.
				repositoryStore.set(repository.id, {
					id: repository.id,
					name: repository.name
				});

				context.log.info(`Added repository ${repository.full_name}`);
			}
		});
	});

	/**
	 * Remove untracked repositories from the API.
	 */
	app.on("installation_repositories.removed", async context => {
		// Pull out the list of removed repositories.
		const removed = context.payload.repositories_removed;

		removed.forEach(repository => {
			// Remove the repository by its ID.
			repositoryStore.delete(repository.id);

			context.log.info(`Removed repository ${repository.full_name}`);
		});
	});
};
