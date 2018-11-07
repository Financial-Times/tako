const { Application } = require('probot');
const repositoryStore = require('../src/repositories').instance;
const { AssertionError } = require('assert');

// Requiring our app implementation.
const initialise = require('../src/initialise');

describe('initalise.js', () => {
	let app;
	let github;

	beforeEach(() => {
		app = new Application();

		// This is an easy way to mock out the GitHub API
		github = {
			repos: {
				getTopics: jest.fn().mockResolvedValue({ names: ['foo-bar'] })
			},
			apps: {
				getInstallations: jest.fn().mockResolvedValue({
					// The installation id.
					data: [ { id: 1, account: { login: 'Financial-Times' } } ]
				}),
				get: jest.fn().mockResolvedValue({
					data: { owner: { login: 'Financial-Times' } }
				}),
				getInstallationRepositories: jest.fn().mockResolvedValue({
					data: { repositories: [ { id: 12345, name: 'foo-bar' } ] }
				})
			},
			// Assuming we're not going to paginate in these tests.
			paginate: async (octokitCall, process) => {
				return Promise.resolve(process(await octokitCall));
			}
		};

		// Passes the mocked out GitHub API into out app instance.
		app.auth = jest.fn().mockResolvedValue(github);
	});

	test('loads all installed repositories', async () => {
		await initialise(app);

		expect(repositoryStore.size).toBe(1);
	});

	test('throws an AssertionError on miss-matched GitHub App owner and installation owner', async () => {
		github.apps.get = jest.fn().mockResolvedValue({
			data: { owner: { login: 'umbrella-corp' } }
		});

		return expect(initialise(app)).rejects.toBeInstanceOf(AssertionError);
	});

	test('throws when the app.auth() call fails', async () => {
		app.auth = jest.fn().mockRejectedValue();

		return expect(initialise(app)).rejects.toBeInstanceOf(Error);
	});

	test('throws when the app.auth(id) call fails', async () => {
		// Fail the second call to app.auth.
		app.auth = jest.fn()
			.mockResolvedValueOnce(github)
			.mockRejectedValue();

		return expect(initialise(app)).rejects.toBeInstanceOf(Error);
	});

	test('throws when the apps.getInstallations() call fails', async () => {
		github.apps = {
			getInstallations: jest.fn().mockRejectedValue()
		};

		return expect(initialise(app)).rejects.toBeInstanceOf(Error);
	});

	test('throws when the apps.get() call fails', async () => {
		github.apps = {
			get: jest.fn().mockRejectedValue()
		};

		return expect(initialise(app)).rejects.toBeInstanceOf(Error);
	});

	test('throws when the apps.getInstallationRepositories() call fails', async () => {
		github.apps = {
			getInstallationRepositories: jest.fn().mockRejectedValue()
		};

		return expect(initialise(app)).rejects.toBeInstanceOf(Error);
	});
});
