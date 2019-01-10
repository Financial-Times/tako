/**
 * @constant repositoryStore - An array of repositories that are assocated with the Tako GitHub App installation.
 */
let repositoryStore = new Array();

/**
 * Refresh the Repository Store with data fetched from the Tako GitHub App installation
 * @see https://octokit.github.io/rest.js/#api-Apps-listRepos
 * @param {import('probot').GitHubAPI} installation - The Tako GitHub App installation
 */
async function refresh(octokit) {
	try {
		const repositories = await octokit.paginate(
			octokit.apps.listRepos({
				per_page: 100,
				headers: {
					accept: 'application/vnd.github.machine-man-preview+json,application/vnd.github.mercy-preview+json'
				}
			}),
			res => res.data.repositories // Pull out only the list of repositories from each response.
		);

		// Refresh the Repository Store — filtering out archived repositories.
		repositoryStore = repositories
			.filter(({ archived }) => !archived)
			.map(({id, name, topics}) => ({id, name, topics: topics || []}));

		return repositoryStore.length;
	}
	catch (err) {
		throw new Error(
			"Failed to fetch repository information with apps.listRepos", {
				err
			}
		);
	}
}

module.exports = {
	refresh: refresh,
	list: () => repositoryStore
};
