const { Application } = require('probot');
const request = require('supertest');
const express = require('express');
const repositories = require('../src/repositories').instance;

// Hardcode the bearer token for the test.
process.env.BEARER_TOKEN = 'hunter2';

// Requiring our app implementation.
const routes = require('../src/routes');

describe('routes.js', () => {
	let app;
	let server;

	beforeEach(async () => {
		app = new Application();
		server = express();

		repositories.set(1, { id: 1, name: 'next-foo-bar' });

		// Mock out call to the GitHub API for the topic search.

		// Register our routes with the empty application.
		await routes(app);

		// Setup an express object that we can test.
		server.use(app.router);
	});

	test('reject unauthorised request when a bearer token is loaded', async () => {
		await request(server)
			.get('/tako/repositories')
			.set('Accept', 'application/json')
			.expect(401);

		await request(server)
			.get('/tako/repositories/topic/expressjs')
			.set('Accept', 'application/json')
			.expect(401);
	});

	test('accepts authorised request when a bearer token is loaded', async () => {
		await request(server)
			.get('/tako/repositories')
			.set('Accept', 'application/json')
			.set('Authorization', 'Bearer hunter2')
			.expect(200);

		await request(server)
			.get('/tako/repositories/topic/expressjs')
			.set('Accept', 'application/json')
			.set('Authorization', 'Bearer hunter2')
			.expect(200);
	});

	test('noCache sets a cache-control header with a value of max-age=0', async () => {
		await request(server)
			.get('/tako/repositories')
			.set('Accept', 'application/json')
			.set('Authorization', 'Bearer hunter2')
			.expect('Cache-Control', /max-age=0/);

		await request(server)
			.get('/tako/repositories/topic/expressjs')
			.set('Accept', 'application/json')
			.set('Authorization', 'Bearer hunter2')
			.expect('Cache-Control', /max-age=0/);
	});

	test('/tako/repositories reponds ok', async () => {
		await request(server)
			.get('/tako/repositories')
			.set('Accept', 'application/json')
			.set('Authorization', 'Bearer hunter2')
			.expect('Content-Type', /json/)
			.expect(200, {
				repositories: [
					{
						name: 'next-foo-bar'
					}
				]
			});
	});

	test('/tako/repositories/topic/expressjs responds ok', async () => {
		await request(server)
			.get('/tako/repositories/topic/expressjs')
			.set('Accept', 'application/json')
			.set('Authorization', 'Bearer hunter2')
			.expect('Content-Type', /json/)
			.expect(200, {
				topic: 'expressjs',
				repositories: [
					{
						name: 'next-foo-bar'
					}
				]
			});
	});
});
