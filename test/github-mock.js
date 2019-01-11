module.exports = {
	repos: {
		getTopics: jest.fn().mockResolvedValue({ names: ["foo-bar"] })
	},
	apps: {
		listInstallations: jest.fn().mockResolvedValue({
			// The installation id.
			data: [{ id: 1, account: { login: "Financial-Times" } }]
		}),
		getAuthenticated: jest.fn().mockResolvedValue({
			data: { owner: { login: "Financial-Times" } }
		}),
		listRepos: jest.fn().mockResolvedValue({
			data: {
				repositories: [
					{ id: 12345, name: "foo-bar", topics: ["aaa", "bbb"] },
					{ id: 12346, name: "foo-bar", topics: [] },
					{ id: 12347, name: "foo-bar" },
					{ id: 23458, name: "archived-aardvark", archived: true }
				]
			}
		})
	},
	paginate: async (octokitCall, process) => {
		return Promise.resolve(process(await octokitCall));
	}
};
