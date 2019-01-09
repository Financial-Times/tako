const repositories = require("../src/repositories");

describe("repositories.js", () => {
	test("repositories.list property returns an Array", () => {
		expect(repositories.list()).toBeInstanceOf(Array);
	});
});
