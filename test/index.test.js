const { Application } = require('probot');

const initalise = require('../src/initialise');
const routes = require('../src/routes');

// Requiring our app implementation.
const subject = require('../src');

// Helper for transforming events copied from Smee.
const fixture = (fixture) => {
	const { event, payload } = require(`./fixtures/${fixture}.json`);
	return { name: event, payload };
};

// We must mock the require calls that `index.js` makes here, not under `describe`.
// @see https://jestjs.io/docs/en/manual-mocks#examples
jest.mock('../src/initialise');
jest.mock('../src/routes');

// Both modules return a Promise that resolves to a void return value.
initalise.mockImplementation(() => Promise.resolve());
routes.mockImplementation(() => Promise.resolve());

describe('Tako', () => {
	let app;
	let github;

	beforeEach(() => {
		app = new Application();

		// Initialize the app based on the code from index.js
		app.load(subject);

		// This is an easy way to mock out the GitHub API
		github = {
			//
		};

		// Passes the mocked out GitHub API into out app instance.
		app.auth = () => Promise.resolve(github);
	});

	test('installation_repositories.added_all', async () => {
		await app.receive(fixture('installation_repositories.added_all'));
		expect(true).toEqual(true);
	});

	test('installation_repositories.added_selected', async () => {
		await app.receive(fixture('installation_repositories.added_selected'));
		expect(true).toEqual(true);
	});

	test('installation_repositories.removed', async () => {
		await app.receive(fixture('installation_repositories.removed'));
		expect(true).toEqual(true);
	});
});
