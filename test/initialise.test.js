const { Application } = require("probot");
const githubMock = require("./github-mock.js");
const repositories = require("../src/repositories");
const { AssertionError } = require("assert");

// Requiring our app implementation.
const initialise = require("../src/initialise");

describe("initalise.js", () => {
	let app;

	beforeEach(() => {
		app = new Application();

		// Passes the mocked out GitHub API into our app instance.
		app.auth = jest.fn().mockResolvedValue(githubMock);
	});

	test("loads all installed repositories", async () => {
		await initialise(app);

		expect(repositories.list().length).toBe(3);

		// We want to ensure every repository has a topic property.
		expect(repositories.list().map(({ topics }) => topics)).toEqual([["aaa", "bbb"], [], []]);
	});

	test("throws an AssertionError on miss-matched GitHub App owner and installation owner", async () => {
		githubMock.apps.getAuthenticated = jest.fn().mockResolvedValue({
			data: { owner: { login: "umbrella-corp" } }
		});

		return expect(initialise(app)).rejects.toBeInstanceOf(AssertionError);
	});

	test("throws when the app.auth() call fails", async () => {
		app.auth = jest.fn().mockRejectedValue();

		return expect(initialise(app)).rejects.toBeInstanceOf(Error);
	});

	test("throws when the app.auth(id) call fails", async () => {
		// Fail the second call to app.auth.
		app.auth = jest
			.fn()
			.mockResolvedValueOnce()
			.mockRejectedValue();

		return expect(initialise(app)).rejects.toBeInstanceOf(Error);
	});

	test("throws when the apps.listInstallations() call fails", async () => {
		githubMock.apps = {
			listInstallations: jest.fn().mockRejectedValue()
		};

		return expect(initialise(app)).rejects.toBeInstanceOf(Error);
	});

	test("throws when the apps.getAuthenticated() call fails", async () => {
		githubMock.apps = {
			getAuthenticated: jest.fn().mockRejectedValue()
		};

		return expect(initialise(app)).rejects.toBeInstanceOf(Error);
	});

	test("throws when the apps.listRepos() call fails", async () => {
		githubMock.apps = {
			listRepos: jest.fn().mockRejectedValue()
		};

		return expect(initialise(app)).rejects.toBeInstanceOf(Error);
	});
});
