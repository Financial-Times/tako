const { Application } = require('probot');

// Requiring our app implementation.
const subject = require('../src/index');

// Helper for transforming events copied from Smee.
const fixture = (fixture) => {
	const { event, payload } = require(`./fixtures/${fixture}.json`);
	return { name: `${event}.${payload.action}`, payload };
};

// We must mock the require calls that `index.js` makes here, not under `describe`.
// @see https://jestjs.io/docs/en/manual-mocks#examples
jest.mock('../src/initialise');
jest.mock('../src/routes');

describe('Tako', () => {
	let app;
	let github;
	let repositoryStore;

	beforeEach(() => {
		app = new Application();

		// Initialize the app based on the code from index.js
		app.load(subject);

		// This is an easy way to mock out the GitHub API
		github = {
			//
		};

		repositoryStore = new Map();

		// Add a repository store that we can interrogate.
		app.repositoryStore = repositoryStore;

		// Passes the mocked out GitHub API into out app instance.
		app.auth = () => Promise.resolve(github);
	});

	test('installation_repositories.added_all', async () => {
		await app.receive(fixture('installation_repositories.added_all'));

		expect(repositoryStore.size).toEqual(3);
	});

	test('installation_repositories.added_selected', async () => {
		await app.receive(fixture('installation_repositories.added_selected'));

		expect(repositoryStore.size).toEqual(3);
	});

	test('installation_repositories.removed', async () => {
		const event = fixture('installation_repositories.removed');

		event.payload.repositories_removed.forEach((repository) => {
			repositoryStore.set(repository.id, repository);
		});

		expect(repositoryStore.size).toEqual(3);

		await app.receive(event);

		expect(repositoryStore.size).toEqual(0);
	});
});
