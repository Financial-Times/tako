const { Application } = require('probot');
const request = require('supertest');
const express = require('express');

// // Requiring our app implementation.
const routes = require('../src/routes');

describe('routes.js', () => {
	let app;
	let server;
	let repositoryStore;

	beforeEach(async () => {
		app = new Application();
		server = express();
		repositoryStore = new Map();

		repositoryStore.set(1, { name: 'next-foo-bar', topics: ['serverless'] });

		app.repositoryStore = repositoryStore;

		// Register our routes with the empty application.
		await routes(app);

		// Setup an express object that we can test.
		server.use(app.router);
	});

	test('/tako/repositories responds with a 200 status code', () => {
		return request(server)
			.get('/tako/repositories')
			.expect(200);
	});

	test('/tako/repositories reponds with JSON', () => {
		return request(server)
			.get('/tako/repositories')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/);
	});

	test('app.repositoryStore is converted into JSON', () => {
		return request(server)
			.get('/tako/repositories')
			.set('Accept', 'application/json')
			.expect(200, {
				repositories: [
					{
						name: 'next-foo-bar',
						topics: ['serverless']
					}
				]
			});
	});

	test('noCache sets a cache-control header with a value of max-age=0', () => {
		return request(server)
			.get('/tako/repositories')
			.set('Accept', 'application/json')
			.expect('Cache-Control', /no-cache/);
	});
});
