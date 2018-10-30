# 🐙 Tako

A GitHub App that helps maintain a large number of repositories in a GitHub organisation.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

<img width="10%" align="left" src="https://user-images.githubusercontent.com/224547/46536555-c29d1180-c8a6-11e8-92c2-f3141da0d6da.png" />

<img width="30%" align="" src="https://user-images.githubusercontent.com/224547/46534085-e65c5980-c89e-11e8-90b7-06e060217de1.png" />

## Development

### Getting Started

1. Build the application

```sh
# Install the correct version of Node.js (defined in .nvmrc)
nvm use

# Install any dependencies
npm install

# Start the application locally (restarting on changes to the code)
npm run dev
```

2. Go to <http://localhost:3000/probot> in a browser, and click on "Register GitHub App"

3. Rename the app to something that isn't already registered, e.g. "Sam's Development Tako"

4. Install the app in your personal GitHub account, then pick an example repository or two in the drop down

5. Probot will then automatically create you a `.env` file (you can add `LOG_LEVEL=trace` for more verbose logging)

6. From your browser, copy the installiation ID from the URL (e.g. at `https://github.com/settings/installations/123456` `123456` is the ID)

7. Add `TAKO_INSTALLATION_ID` to your `.env` file, setting it's value to the ID you've just copied

You're now good to go 🎉.

### Formatting and Code Quality

This project uses a few tools to help us with consistent formatting and code
quality.

#### [EditorConfig](https://editorconfig.org/)

> [EditorConfig](https://editorconfig.org/) helps developers define and maintain
> consistent coding styles between different editors and IDEs.

The settings for EditorConfig are defined in our [`.editorconfig`](.editorconfig)
file and your editor _probably_ [already supports it](https://editorconfig.org/#download)
without the need for a plugin.

#### [Prettier](https://www.npmjs.com/package/prettier)

> Prettier is an opinionated code formatter.

The settings for `prettier` are defined in our [`.prettierrc.json`](.prettierrc.json)
file. `prettier` also takes [specific settings](https://prettier.io/docs/en/api.html#prettierresolveconfigfilepath-options)
from our [`.editorconfig`](.editorconfig) file into account as well.

Every time you run `git commit`, [`precise-commits`](https://www.npmjs.com/package/precise-commits)
will run `prettier` against _only_ the specific changes you've made and fix any
formatting issues. `precise-commits` is configured with [`husky`](https://www.npmjs.com/package/husky)
as a [git pre-commit hook](https://git-scm.com/docs/githooks#_pre_commit) in our
[package.json](package.json).

If you'd like to use `prettier` in your editor there are [plugins available for most popular editors](https://prettier.io/docs/en/editors.html).

There's an excellent explanation about how Prettier differs to a linter this [in the Prettier docs](https://prettier.io/docs/en/comparison.html).

#### [ESLint](https://www.npmjs.com/package/eslint)

> The pluggable linting utility for JavaScript and JSX

The settings for `eslint` are defined in our [`.eslintrc.js`](.eslintrc.js) file.

We use the [`eslint-config-prettier`](https://www.npmjs.com/package/eslint-config-prettier)
preset to disable any rules that conflict with formatting that is handled by
`prettier`. If you add new rules in [`.eslintrc.js`](.eslintrc.js) you can run
`npm run eslint-check` to check for any conflicting rules.

If you'd like to use `eslint` in your editor there are [plugins available for most popular editors](https://eslint.org/docs/user-guide/integrations#editors/).

## The API Schema

`GET /tako/repositories`

```json
[
    {
        "name": "next-foo-bar",
        "topics": [ "next-app" ]
    }
]
```

`GET /tako/repositories?topics=next-app`

```json
[
    {
        "name": "next-foo-bar",
        "topics": [ "next-app" ]
    }
]
```