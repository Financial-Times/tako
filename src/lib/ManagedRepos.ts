import { Application } from 'probot';

/**
 * Retrieves the list of GitHub repositories that a GitHub App is installed on
 * from the GitHub API and caches that list in memory until it is explicitly purged.
 */
export default class ManagedRepos {

	private app: Application;
	private installationId: number;
	private repositories: string[];
	private fetched: boolean;

	/**
	 * @param app - A Probot application instance
	 * @param installationId - A GitHub App installation ID
	 */
	constructor(app: Application, installationId: number) {
		this.app = app;
		this.installationId = installationId;
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
	 * @returns Promise<string[]> - An array of GitHub repository names
	 */
	public async getList(): Promise<string[]> {
		let repositories = this.repositories;

		if (this.fetched === false) {
			const github = await this.app.auth(this.installationId);

			const req = github.apps.getInstallationRepositories({ per_page: 100 });

			repositories = await github.paginate(req, (res) => {
				return res.data.repositories.map((repo: any) => repo.name);
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
	public purgeList() {
		this.repositories = [];
		this.fetched = false;
	}

};
