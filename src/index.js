const assert = require('assert');

const ManagedRepos = require('./lib/ManagedRepos');

const TAKO_INSTALLATION_ID = Number(process.env.TAKO_INSTALLATION_ID);

/**
 * @param {import('probot').Application} app - Probot's Application class.
 * @param managedRepos - An instance of the MangedRepos class.
 */
const initApiRoutes = (app, managedRepos) => {
	const router = app.route('/tako');

	router.get('/repos/managed', async (req, res) => {
		res.send(await managedRepos.getList());
	});

	router.delete('/repos/managed', async (req, res) => {
		managedRepos.purgeList();
		res.send([]);
		app.log.info({ event: 'TAKO_MANAGED_REPOSITORIES_LIST_PURGED' });
	});
};

/**
 * @param {import('probot').Application} app - Probot's Application class.
 * @param managedRepos - An instance of the MangedRepos class.
 */
const initEventHandlers = (app, managedRepos) => {
	app.on(
		['installation_repositories.added', 'installation_repositories.removed'],
		(context) => {
			const action = context.payload.action;

			app.log.debug({
				event: `TAKO_GITHUB_INSTALLATION_REPOSITORIES_${action.toUpperCase()}`,
				repositories: context.payload[`repositories_${action}`]
			});

			managedRepos.purgeList();
			app.log.info({ event: 'TAKO_MANAGED_REPOSITORIES_LIST_PURGED' });
		}
	);
};

/**
 * @param {import('probot').Application} app - Probot's Application class.
 */
module.exports = async (app) => {
	assert(
		TAKO_INSTALLATION_ID,
		'tako requires the TAKO_INSTALLATION_ID environment variable to be set - see the README for help with configuration'
	);

	// NOTE: Retrieving the repoList in this way, outside of the context of
	// a webhook event payload, makes the assumption that this GitHub app is
	// only installed on one GitHub organisation e.g. financial-times-sandbox
	const managedRepos = new ManagedRepos(app, TAKO_INSTALLATION_ID);

	app.log.debug(
		'tako is managing these repositories',
		await managedRepos.getList()
	);

	initApiRoutes(app, managedRepos);
	initEventHandlers(app, managedRepos);

	app.log.info('tako is ready to receive requests');
};
