const { Application } = require("probot");
const tako = require("../src/index");
const githubMock = require("./github-mock.js");
const repositories = require("../src/repositories");
jest.spyOn(repositories, "refresh");

// We must mock the require calls that `index.js` makes here, not under `describe`.
// @see https://jestjs.io/docs/en/manual-mocks#examples
jest.mock("../src/routes");

// Initialize the Probot application
const app = new Application();
app.load(tako);

// Pass the mocked out GitHub API into our Probot application instance.
app.auth = jest.fn().mockResolvedValue(githubMock);

describe("index.js", () => {
	beforeEach(() => {
		jest.clearAllMocks();
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
