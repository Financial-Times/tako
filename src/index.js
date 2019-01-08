const routes = require("./routes");
const initialise = require("./initialise");
const repositories = require("./repositories");

/**
 * @param {import('probot').Application} app - Probot's Application class.
 */
module.exports = async app => {
	// Ensure that we crash if there's any error loading our API routes.
	try {
		await routes(app);
	}
	catch (err) {
		app.log.fatal("Failed to load API routes", err);
		process.exit(1);
	}

	// Ensure that we crash Probot if we are unable to initialise.
	const installation = await initialise(app).catch(err => {
		app.log.fatal("Failed to initialise", err);
		process.exit(1);
	});

	async function refresh(context) {
		await repositories.refresh(installation).catch(err => {
			app.log.error("Failed to refresh Repository Store", { err, context });
		})
		app.log.info(`Refreshed the repository store. Action: ${context.payload.action || 'Unknown'}`);
	}

	/**
	 * On appropriate events, refresh the whole list of Tako repositories.
	 * @see https://developer.github.com/webhooks/#events for a list of all GitHub webhook events.
	 */
	app.on("installation_repositories.added", refresh);
	app.on("installation_repositories.removed", refresh);
	// TODO: Handle appropriate "archived" events
};
