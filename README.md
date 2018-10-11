# 🐙 Tako

A GitHub application that helps maintain a large number of repositories in a GitHub organisation.

<img width="30%" align="left" src="https://user-images.githubusercontent.com/224547/46536555-c29d1180-c8a6-11e8-92c2-f3141da0d6da.png" />

<img width="50%" align="" src="https://user-images.githubusercontent.com/224547/46534085-e65c5980-c89e-11e8-90b7-06e060217de1.png" />

## Setup

```sh
# Install dependencies
npm install

# Run typescript
npm run build

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
echo -e "\nLOG_LEVEL=debug" >> .env

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

#### [TSLint](https://www.npmjs.com/package/tslint)

> An extensible linter for the TypeScript language.

The settings for `tslint` are defined in our [`tslint.json`](tslint.json) file.
We use the [`tslint-config-prettier`](https://www.npmjs.com/package/tslint-config-prettier)
preset to disable any rules that conflict with formatting that is handled by
`prettier`. If you add new rules in [`tslint.json`](tslint.json) you can run
`npm run tslint-check` to check for any conflicting rules.

`tslint` is configured to run as part of the [git pre-commit hook](https://git-scm.com/docs/githooks#_pre_commit)
in our [package.json](package.json).

If you'd like to use `tslint` in your editor there are [plugins available for most popular editors](https://palantir.github.io/tslint/usage/third-party-tools/).
