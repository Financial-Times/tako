const repositories = require("../src/repositories");

describe("repositories.js", () => {
	test("repositories.list property returns a Map", () => {
		expect(repositories.list).toBeInstanceOf(Map);
	});
});
