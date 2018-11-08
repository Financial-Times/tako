# 🐙 Tako

A GitHub App that provides an API listing the repositories it is installed on.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

FT.com shares the `Financial-Times` org with many other teams, containing over 2000 repositories.

We're using this to make a list of our teams ~200 repositories available for tooling and automation.

## `GET /tako/repositories`

Get a list of all the repositories.

```json
{
  "repositories": [
    {
      "name": "foo-bar"
    },
    {
      "name": "fizz-buzz"
    }
  ]
}
```

## `GET /tako/repositories/?topic=serverless`

Get a list of repositories, filtered by a [topic](https://help.github.com/articles/about-topics/).

```json
{
  "repositories": [
    {
      "name": "foo-bar"
    }
  ]
}
```

## Security

You can secure the `/tako/repositories` endpoint by setting the `BEARER_TOKEN` environment variable.

You must then send an `Authorization` header with a value of `Bearer <your-token>` in your requests.

## Development

### Getting Started

1. Build the application

```sh
# If you use nvm, install the correct version of Node.js (defined in .nvmrc)
nvm use

# Install any dependencies
npm install

# Start the application locally (restarting on changes to the code)
npm run dev
```

2. Go to <http://localhost:3000/probot> in a browser, and click on "Register GitHub App"

3. Rename the app to something that isn't already registered, e.g. "Sam's Development Tako"

4. Install the app in your personal GitHub account, then pick an example repository or two in the drop down

5. Probot will then automatically create you a `.env` file in your local working directory (you can add `LOG_LEVEL=trace` for more verbose logging)

You're now good to go 🎉. Check out <http://localhost:3000/tako/repositories>.

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

We use the default settings for `prettier`, but it also takes [specific settings](https://prettier.io/docs/en/api.html#prettierresolveconfigfilepath-options)
from our [`.editorconfig`](.editorconfig) file into account as well.

If you'd like to use `prettier` in your editor there are [plugins available for most popular editors](https://prettier.io/docs/en/editors.html).

There's an excellent explanation about how Prettier differs to a linter this [in the Prettier docs](https://prettier.io/docs/en/comparison.html).

Format your code before committing with `npm run fmt`.

#### [ESLint](https://www.npmjs.com/package/eslint)

> The pluggable linting utility for JavaScript and JSX

The settings for `eslint` are defined in our [`.eslintrc.js`](.eslintrc.js) file.

We use the [`eslint-config-prettier`](https://www.npmjs.com/package/eslint-config-prettier)
preset to disable any rules that conflict with formatting that is handled by
`prettier`.

If you'd like to use `eslint` in your editor there are [plugins available for most popular editors](https://eslint.org/docs/user-guide/integrations#editors/).
