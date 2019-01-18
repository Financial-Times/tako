process.env.INSTALLATION_ID = 123456;

const nock = require("nock")
const tako = require("../src/index")
const repositories = require("../src/repositories");
const { Probot } = require("probot")

nock.disableNetConnect()

nock("https://api.github.com")
	.persist()
	.get("/app/installations")
	.reply(200, [ { id: "123456" } ])
	.post(`/app/installations/${process.env.INSTALLATION_ID}/access_tokens`)
	.reply(200, { token: "token" });

describe("repositories.js", () => {
	test("repositories.list property returns an Array", () => {
		expect(repositories.list()).toBeInstanceOf(Array);
	});

	test("call the GitHub API when asked to refresh the repository list", (next) => {

		const nockRepositories = nock("https://api.github.com")
			.get("/installation/repositories?per_page=100")
			.reply(200);

		const probot = new Probot({})
		const app = probot.load(tako)
		app.app = () => "token"

		// Wait for Probot to finish loading
		// Note: repositories.refresh() is called once when probot starts
		setTimeout(() => {
			expect(nockRepositories.isDone()).toBe(true);
			next();
		}, 2000);
	});
});
