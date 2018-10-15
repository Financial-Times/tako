/**
 * Retrieves the list of GitHub repositories that a GitHub App is installed on
 * from the GitHub API and caches that list in memory until it is explicitly purged.
 */
module.exports = class ManagedRepos {
	/**
	 * @param {import('probot').Application} app - Probot's Application class.
	 * @param installationId - A GitHub App installation ID.
	 */
	constructor(app, installationId) {
		this.app = app;
		this.installationId = Number(installationId);
		this.repositories = [];
		this.fetched = false;
	}

	/**
	 * Returns list of repositories that the GitHub App installation has
	 * explicit permission to access for an installation.
	 *
	 * It only fetches from the GitHub API if the repositories list isn't
	 * already cached in-memory in the instance of this class.
	 *
	 * https://octokit.github.io/rest.js/#api-Apps-getInstallationRepositories
	 *
	 * @returns array - An array of GitHub repository names.
	 */
	async getList() {
		let repositories = this.repositories;

		if (this.fetched === false) {
			const github = await this.app.auth(this.installationId);

			const req = github.apps.getInstallationRepositories({ per_page: 100 });

			repositories = await github.paginate(req, (res) => {
				return res.data.repositories.map((repo) => repo.name);
			});

			this.repositories = repositories;
			this.fetched = true;
		}

		return repositories;
	}

	/**
	 * Purges the in-memory cached repositories list from the instance of this class.
	 *
	 * @returns void
	 */
	purgeList() {
		this.repositories = [];
		this.fetched = false;
	}
};
