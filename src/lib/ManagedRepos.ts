import { Application } from 'probot';

export default class ManagedRepos {

	private app: Application;
	private installationId: number;
	private repositories: string[];
	private fetched: boolean;

	constructor(app: Application, installationId: number) {
		this.app = app;
		this.installationId = installationId;
		this.repositories = [];
		this.fetched = false;
	}

	public async getList() {
		let repositories = this.repositories;

		if (this.fetched === false) {
			const github = await this.app.auth(this.installationId);
			const req = github.apps.getInstallationRepositories({ per_page: 100 });

			repositories = await github.paginate((req), (res) => {
				return res.data.repositories.map((repo: any) => repo.name);
			});

			this.repositories = repositories;
			this.fetched = true;
		}

		return repositories;
	}

	public purgeList() {
		this.repositories = [];
		this.fetched = false;
	}

};
