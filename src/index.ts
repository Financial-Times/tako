import assert from 'assert';
import express from 'express';
import { Application, Context } from 'probot';

import ManagedRepos from './lib/ManagedRepos.js';

const TAKO_INSTALLATION_ID: number = Number(process.env.TAKO_INSTALLATION_ID);

const initApiRoutes = (app: Application, managedRepos: ManagedRepos) => {
	const router = app.route('/tako');

	router.get(
		'/repos/managed',
		async (req: express.Request, res: express.Response) => {
			res.send(await managedRepos.getList());
		}
	);

	router.delete(
		'/repos/managed',
		async (req: express.Request, res: express.Response) => {
			managedRepos.purgeList();
			res.send([]);
			app.log.info({ event: 'TAKO_MANAGED_REPOSITORIES_LIST_PURGED' });
		}
	);
};

const initEventHandlers = (app: Application, managedRepos: ManagedRepos) => {
	app.on(
		['installation_repositories.added', 'installation_repositories.removed'],
		(context: Context) => {
			const action = context.payload.action;

			app.log.debug({
				event: `TAKO_GITHUB_INSTALLATION_REPOSITORIES_${action.toUpperCase()}`,
				repositories: context.payload[`repositories_${action}`]
			});

			managedRepos.purgeList();
			app.log.info({ event: 'TAKO_MANAGED_REPOSITORIES_LIST_PURGED' });

			return Promise.resolve();
		}
	);
};

/**
 * @param {import('probot').Application} app - Probot's Application class.
 */
export = async (app: Application) => {
	assert(
		process.env.TAKO_INSTALLATION_ID,
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
