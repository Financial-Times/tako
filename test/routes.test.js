// DO NOT MOVE: Set the bearer token for the test.
process.env.BEARER_TOKEN = "correct-bearer-token";

const { Application } = require("probot");
const request = require("supertest");
const express = require("express");
const routes = require("../src/routes");

// Initialize the Probot application
const app = new Application();

// Set up an ExpressJS server and route it with the Probot app's router.
const server = express();
server.use(app.router);

describe("routes.js", () => {
	beforeEach(async () => {
		await routes(app);
	});

	test("rejects an incorrect Bearer token", async () => {
		await request(server)
			.get("/tako/repositories")
			.set("Accept", "application/json")
			.set("Authorization", "Bearer incorrect-bearer-token")
			.expect(401);
	});

	test("accepts a correct Bearer token", async () => {
		await request(server)
			.get("/tako/repositories")
			.set("Accept", "application/json")
			.set("Authorization", "Bearer correct-bearer-token")
			.expect(200);
	});

	test("noCache sets a cache-control header with a value of max-age=0", async () => {
		await request(server)
			.get("/tako/repositories")
			.set("Accept", "application/json")
			.set("Authorization", "Bearer correct-bearer-token")
			.expect("Cache-Control", "max-age=0, no-cache");
	});

	test("/tako/repositories reponds ok", async () => {
		await request(server)
			.get("/tako/repositories")
			.set("Accept", "application/json")
			.set("Authorization", "Bearer correct-bearer-token")
			.expect("Content-Type", "application/json; charset=utf-8")
			.expect(200);
	});

	test("/tako/repositories?topic=foo responds ok", async () => {
		await request(server)
			.get("/tako/repositories?topic=foo")
			.set("Accept", "application/json")
			.set("Authorization", "Bearer correct-bearer-token")
			.expect("Content-Type", "application/json; charset=utf-8")
			.expect(200);
	});

	test("/tako/repositories?topic=fake-github-auth-erroring responds with an error", async () => {
		app.auth = jest.fn().mockRejectedValue();

		try {
			await request(server)
				.get("/tako/repositories?topic=this-will-break")
				.set("Accept", "application/json")
				.set("Authorization", "Bearer hunter2")
				.expect(500);
		} catch (err) {
			// We're looking for the 500 status code.
		}
	});
});
