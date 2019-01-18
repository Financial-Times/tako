/**
 * @constant repositoryStore - A map of repositories that are assocated with all Tako GitHub App installations.
 */
const repositoryStore = new Map();

/**
 * Update the Repository Store with data fetched from the Tako GitHub App installation
 * @see https://octokit.github.io/rest.js/#api-Apps-listRepos
 * @param {import('probot').GitHubAPI} github - An authenticated octokit instance
 */
const update = async (github) => {
	const repositories = await github.paginate(
		github.apps.listRepos({
			per_page: 100,
			headers: {
				accept: "application/vnd.github.machine-man-preview+json,application/vnd.github.mercy-preview+json"
			}
		}),
		res => res.data.repositories // Pull out only the list of repositories from each response.
	)

	// Update the Repository Store — filtering out undefined and archived repositories.
	repositories
		.filter(row => !!row)
		.filter(({ archived }) => !archived)
		.map(({ full_name, name, topics }) => {
			repositoryStore.set(full_name, { name, topics: topics || [] })
		})
}

/**
 * Flatten the repository store map into an array
 * @returns Array - List of all repositories in the store
 */
const list = () => {
	return Array.from(repositoryStore).map(row => ({ full_name: row[0], ...row[1] }))
}

module.exports = {
	update: update,
	list: list,
	clear: () => repositoryStore.clear()
};
