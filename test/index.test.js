const { Application } = require("probot");
const githubMock = require("./github-mock.js");
const repositories = require("../src/repositories");
jest.spyOn(repositories, "refresh");

// Requiring our app implementation.
const subject = require("../src/index");

// We must mock the require calls that `index.js` makes here, not under `describe`.
// @see https://jestjs.io/docs/en/manual-mocks#examples
jest.mock("../src/routes");

describe("index.js", () => {
	const app = new Application();

	// Initialize the app based on the code from index.js
	app.load(subject);

	// Passes the mocked out GitHub API into out app instance.
	app.auth = jest.fn().mockResolvedValue(githubMock);

	beforeEach(() => {
		repositories.refresh.mockClear()
	});

	test("installation_repositories.added", async () => {
		await app.receive({
			name: "installation_repositories",
			payload: {
				action: "added"
			}
		});
		expect(repositories.refresh).toHaveBeenCalledTimes(1);
	});

	test("installation_repositories.removed", async () => {
		await app.receive({
			name: "installation_repositories",
			payload: {
				action: "removed"
			}
		});
		expect(repositories.refresh).toHaveBeenCalledTimes(1);
	});
});
