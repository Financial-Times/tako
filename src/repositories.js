/**
 * @constant repositoryStore - An array of repositories that are assocated with the Tako GitHub App installation.
 */
let repositoryStore = new Array();

/**
 * Refresh the Repository Store with data fetched from the Tako GitHub App installation
 * @see https://octokit.github.io/rest.js/#api-Apps-listRepos
 * @param {import('probot').GitHubAPI} github - An authenticated octokit instance
 */
async function refresh(github) {
	const repositories = await github.paginate(
		github.apps.listRepos({
			per_page: 100,
			headers: {
				accept:
					"application/vnd.github.machine-man-preview+json,application/vnd.github.mercy-preview+json"
			}
		}),
		res => res.data.repositories // Pull out only the list of repositories from each response.
	);

	// Refresh the Repository Store — filtering out undefined and archived repositories.
	repositoryStore = repositories
		.filter(row => !!row)
		.filter(({ archived }) => !archived)
		.map(({ name, topics }) => ({ name, topics: topics || [] }));
}

module.exports = {
	refresh: refresh,
	list: () => repositoryStore
};
