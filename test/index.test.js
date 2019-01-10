const { Application } = require("probot");
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

	// This is an easy way to mock out the GitHub API
	const github = {
		repos: {
			getTopics: jest.fn().mockResolvedValue({ names: ["foo-bar"] })
		},
		apps: {
			listInstallations: jest.fn().mockResolvedValue({
				// The installation id.
				data: [{ id: 1, account: { login: "Financial-Times" } }]
			}),
			get: jest.fn().mockResolvedValue({
				data: { owner: { login: "Financial-Times" } }
			}),
			listRepos: jest.fn().mockResolvedValue({
				data: { repositories: [
					{ id: 12345, name: "foo-bar" },
					{ id: 23456, name: "archived-aardvark", archived: true },
				] }
			})
		},
		paginate: async (octokitCall, process) => {
			return Promise.resolve(process(await octokitCall));
		}
	};

	// Passes the mocked out GitHub API into out app instance.
	app.auth = jest.fn().mockResolvedValue(github);

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
