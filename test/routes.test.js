const { Application } = require("probot");
const request = require("supertest");
const express = require("express");

// Hardcode the bearer token for the test.
process.env.BEARER_TOKEN = "hunter2";

// Requiring our app implementation.
const routes = require("../src/routes");

describe("routes.js", () => {
	let app;
	let server;
	let github;

	beforeEach(async () => {
		app = new Application();
		server = express();

		// Mock out call to the GitHub API for the topic search.
		github = {
			apps: {
				getAuthenticated: jest.fn().mockResolvedValue({
					data: { owner: { login: "umbrella-corp" } }
				})
			},
			// Assuming we're not going to paginate in these tests.
			paginate: async (octokitCall, process) => {
				return Promise.resolve(process(await octokitCall));
			}
		};

		// Passes the mocked out GitHub API into our app instance.
		app.auth = () => Promise.resolve(github);

		// Register our routes with the empty application.
		await routes(app);

		// Setup an express object that we can test.
		server.use(app.router);
	});

	test("reject unauthorised request when a bearer token is loaded", async () => {
		await request(server)
			.get("/repositories")
			.set("Accept", "application/json")
			.expect(401);

		await request(server)
			.get("/repositories?topic=express")
			.set("Accept", "application/json")
			.expect(401);
	});

	test("accepts authorised request when a bearer token is loaded", async () => {
		await request(server)
			.get("/repositories")
			.set("Accept", "application/json")
			.set("Authorization", "Bearer hunter2")
			.expect(200);

		await request(server)
			.get("/repositories?topic=express")
			.set("Accept", "application/json")
			.set("Authorization", "Bearer hunter2")
			.expect(200);
	});

	test("noCache sets a cache-control header with a value of max-age=0", async () => {
		await request(server)
			.get("/repositories")
			.set("Accept", "application/json")
			.set("Authorization", "Bearer hunter2")
			.expect("Cache-Control", "max-age=0, no-cache");

		await request(server)
			.get("/repositories?topic=express")
			.set("Accept", "application/json")
			.set("Authorization", "Bearer hunter2")
			.expect("Cache-Control", "max-age=0, no-cache");
	});

	test("/repositories reponds ok", async () => {
		await request(server)
			.get("/repositories")
			.set("Accept", "application/json")
			.set("Authorization", "Bearer hunter2")
			.expect("Content-Type", "application/json; charset=utf-8")
			.expect(200);
	});

	test("/repositories?topic=express responds ok", async () => {
		await request(server)
			.get("/repositories?topic=express")
			.set("Accept", "application/json")
			.set("Authorization", "Bearer hunter2")
			.expect("Content-Type", "application/json; charset=utf-8")
			.expect(200);
	});
});
