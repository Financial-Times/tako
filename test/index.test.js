const { Application } = require("probot");
const repositories = require("../src/repositories");
jest.spyOn(repositories, "refresh");

// Requiring our app implementation.
const subject = require("../src/index");

// We must mock the require calls that `index.js` makes here, not under `describe`.
// @see https://jestjs.io/docs/en/manual-mocks#examples
jest.mock("../src/routes");
jest.mock("../src/initialise", () => function() {
	return Promise.resolve({});
});

describe("index.js", () => {
	let app;
	let github;

	beforeEach(() => {
		app = new Application();

		// Initialize the app based on the code from index.js
		app.load(subject);

		// This is an easy way to mock out the GitHub API
		github = {
			repos: {
				getTopics: jest.fn().mockResolvedValue({ names: ["foo-bar"] })
			}
		};

		// Passes the mocked out GitHub API into out app instance.
		app.auth = jest.fn().mockResolvedValue(github);
	});

	test("installation_repositories.added", async () => {
		await app.receive({
			name: "installation_repositories",
			payload: {
				action: "added"
			}
		});
		expect(repositories.refresh).toHaveBeenCalled();
	});

	test("installation_repositories.removed", async () => {
		await app.receive({
			name: "installation_repositories",
			payload: {
				action: "removed"
			}
		});
		expect(repositories.refresh).toHaveBeenCalled();
	});
});
