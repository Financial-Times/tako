const nock = require("nock")
const tako = require("../src/index")
const { Probot } = require("probot")

const repositories = require("../src/repositories");
jest.spyOn(repositories, "clear")
jest.spyOn(repositories, "update")

nock.disableNetConnect()

nock("https://api.github.com")
	.persist()
	.get("/app/installations")
	.reply(200, [ { id: "123456" }, { id: "654321" } ])
	.post(`/app/installations/123456/access_tokens`)
	.reply(200, { token: "token" })
	.post(`/app/installations/654321/access_tokens`)
	.reply(200, { token: "token" })
	.get("/installation/repositories?per_page=100")
	.reply(200)

describe("index.js", () => {
	let probot;
	beforeEach(() => {
		probot = new Probot({})
		const app = probot.load(tako)
		app.app = {
			getSignedJsonWebToken: () => "token",
			getInstallationAccessToken: () => "token"
		}
	})

	test("initialise the repository list on startup", (next) => {
		// Wait for Probot to finish loading
		setTimeout(() => {
			expect(repositories.clear).toHaveBeenCalledTimes(1)
			expect(repositories.update).toHaveBeenCalledTimes(2)
			next();
		}, 2000);
	});

	test("respond appropriately when receiving GitHub webhook events", (next) => {
		// Note: repositories.clear is called once when probot starts
		// and a second time on probot.receive()
		setTimeout(async() => {
			await probot.receive({ name: "test", payload: { action: "test" } });
			expect(repositories.clear).toHaveBeenCalledTimes(2)
			expect(repositories.update).toHaveBeenCalledTimes(4);
			next();
		}, 2000);
	});

	// Note: Probot doesn't exit, even if you throw an error and call process.extit(1).
	test.skip("Exit meaningfully on startup if unable to load API routes", () => {});

	nock.enableNetConnect();
})

