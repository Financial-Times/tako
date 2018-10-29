# 🐙 Tako

A GitHub App that helps maintain a large number of repositories in a GitHub organisation.

<img width="30%" align="left" src="https://user-images.githubusercontent.com/224547/46536555-c29d1180-c8a6-11e8-92c2-f3141da0d6da.png" />

<img width="50%" align="" src="https://user-images.githubusercontent.com/224547/46534085-e65c5980-c89e-11e8-90b7-06e060217de1.png" />

## Setup

```sh
# Install dependencies
npm install

# Run the app
npm start
```

## Development

### Running things in development

```sh
# If you use nvm, set the version of node to use (defined in our .nvmrc)
# https://github.com/creationix/nvm#nvmrc
nvm use

# For handy debug log messages when running the app
echo -e "\nLOG_LEVEL=trace" >> .env

# Run the app with nodemon and restart on code changes
npm run dev

# Run unit tests on code changes
npm run unit-test:watch
```

### Formatting and Code Quality

This project uses a few tools to help us with consistent formatting and code
quality:

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

## Schema

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

## To-do

- [ ] Define the commands needed to run to get started from scratch
- [ ] Document what the `TAKO_INSTALLATION_ID` is (limit the App to one Org), and how to get it, review how we do this
  * Use setup redirect URL?
  * Look at an event, or lookup in the API, pull out the ID somehow?
- [ ] Document the API
  * How should we?! In the `README.md`