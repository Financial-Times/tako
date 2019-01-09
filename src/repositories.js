/**
 * @constant repositoryStore - An array of repositories that are assocated with the Tako GitHub App installation.
 */
let repositoryStore = new Array();

/**
 * Refresh the Repository Store with data fetched from the Tako GitHub App installation
 * @see https://octokit.github.io/rest.js/#api-Apps-getInstallationRepositories
 * @param {import('probot').GitHubAPI} installation - The Tako GitHub App installation
 */
async function refresh(installation) {
	try {
		const repositories = await installation.paginate(
			installation.apps.getInstallationRepositories({ per_page: 100 }),
			res => res.data.repositories // Pull out only the list of repositories from each response.
		);

		// Refresh the Repository Store — filtering out archived repositories.
		repositoryStore = repositories
			.filter(({ archived }) => !archived)
			.map(({name}) => ({name}));

		return repositoryStore.length;
	}
	catch (err) {
		throw new Error(
			"Failed to fetch repository information with apps.getInstallationRepositories", {
				err
			}
		);
	}
}

module.exports = {
	refresh: refresh,
	list: () => repositoryStore
};
