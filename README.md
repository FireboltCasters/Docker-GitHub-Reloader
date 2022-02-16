<h2 align="center">
    npm-template
</h2>

<p align="center">
  <a href="https://badge.fury.io/js/docker-github-reloader.svg"><img src="https://badge.fury.io/js/docker-github-reloader.svg" alt="npm package" /></a>
  <a href="https://img.shields.io/github/license/FireboltCasters/docker-github-reloader"><img src="https://img.shields.io/github/license/FireboltCasters/docker-github-reloader" alt="MIT" /></a>
  <a href="https://img.shields.io/github/last-commit/FireboltCasters/docker-github-reloader?logo=git"><img src="https://img.shields.io/github/last-commit/FireboltCasters/docker-github-reloader?logo=git" alt="last commit" /></a>
  <a href="https://www.npmjs.com/package/docker-github-reloader"><img src="https://img.shields.io/npm/dm/docker-github-reloader.svg" alt="downloads week" /></a>
  <a href="https://www.npmjs.com/package/docker-github-reloader"><img src="https://img.shields.io/npm/dt/docker-github-reloader.svg" alt="downloads total" /></a>
  <a href="https://github.com/FireboltCasters/docker-github-reloader"><img src="https://shields.io/github/languages/code-size/FireboltCasters/docker-github-reloader" alt="size" /></a>
  <a href="https://david-dm.org/FireboltCasters/docker-github-reloader"><img src="https://david-dm.org/FireboltCasters/docker-github-reloader/status.svg" alt="dependencies" /></a>
  <a href="https://app.fossa.com/projects/git%2Bgithub.com%2FFireboltCasters%2Fdocker-github-reloader?ref=badge_shield" alt="FOSSA Status"><img src="https://app.fossa.com/api/projects/git%2Bgithub.com%2FFireboltCasters%2Fdocker-github-reloader.svg?type=shield"/></a>
  <a href="https://github.com/google/gts" alt="Google TypeScript Style"><img src="https://img.shields.io/badge/code%20style-google-blueviolet.svg"/></a>
  <a href="https://shields.io/" alt="Google TypeScript Style"><img src="https://img.shields.io/badge/uses-TypeScript-blue.svg"/></a>
  <a href="https://github.com/marketplace/actions/lint-action"><img src="https://img.shields.io/badge/uses-Lint%20Action-blue.svg"/></a>
</p>

<p align="center">
  <a href="https://github.com/FireboltCasters/docker-github-reloader/actions/workflows/npmPublish.yml"><img src="https://github.com/FireboltCasters/docker-github-reloader/actions/workflows/npmPublish.yml/badge.svg" alt="Npm publish" /></a>
  <a href="https://github.com/FireboltCasters/docker-github-reloader/actions/workflows/linter.yml"><img src="https://github.com/FireboltCasters/docker-github-reloader/actions/workflows/linter.yml/badge.svg" alt="Build status" /></a>
  <a href="https://sonarcloud.io/dashboard?id=FireboltCasters_docker-github-reloader"><img src="https://sonarcloud.io/api/project_badges/measure?project=FireboltCasters_docker-github-reloader&metric=alert_status" alt="Quality Gate" /></a>
  <a href="https://sonarcloud.io/dashboard?id=FireboltCasters_docker-github-reloader"><img src="https://sonarcloud.io/api/project_badges/measure?project=FireboltCasters_docker-github-reloader&metric=bugs" alt="Bugs" /></a>
  <a href="https://sonarcloud.io/dashboard?id=FireboltCasters_docker-github-reloader"><img src="https://sonarcloud.io/api/project_badges/measure?project=FireboltCasters_docker-github-reloader&metric=coverage" alt="Coverage" /></a>
  <a href="https://sonarcloud.io/dashboard?id=FireboltCasters_docker-github-reloader"><img src="https://sonarcloud.io/api/project_badges/measure?project=FireboltCasters_docker-github-reloader&metric=code_smells" alt="Code Smells" /></a>
  <a href="https://sonarcloud.io/dashboard?id=FireboltCasters_docker-github-reloader"><img src="https://sonarcloud.io/api/project_badges/measure?project=FireboltCasters_docker-github-reloader&metric=duplicated_lines_density" alt="Duplicated Lines (%)" /></a>
  <a href="https://sonarcloud.io/dashboard?id=FireboltCasters_docker-github-reloader"><img src="https://sonarcloud.io/api/project_badges/measure?project=FireboltCasters_docker-github-reloader&metric=sqale_rating" alt="Maintainability Rating" /></a>
  <a href="https://sonarcloud.io/dashboard?id=FireboltCasters_docker-github-reloader"><img src="https://sonarcloud.io/api/project_badges/measure?project=FireboltCasters_docker-github-reloader&metric=reliability_rating" alt="Reliability Rating" /></a>
  <a href="https://sonarcloud.io/dashboard?id=FireboltCasters_docker-github-reloader"><img src="https://sonarcloud.io/api/project_badges/measure?project=FireboltCasters_docker-github-reloader&metric=security_rating" alt="Security Rating" /></a>
  <a href="https://sonarcloud.io/dashboard?id=FireboltCasters_docker-github-reloader"><img src="https://sonarcloud.io/api/project_badges/measure?project=FireboltCasters_docker-github-reloader&metric=sqale_index" alt="Technical Debt" /></a>
  <a href="https://sonarcloud.io/dashboard?id=FireboltCasters_docker-github-reloader"><img src="https://sonarcloud.io/api/project_badges/measure?project=FireboltCasters_docker-github-reloader&metric=vulnerabilities" alt="Vulnerabilities" /></a>
</p>

<p align="center">
    npm-template
</p>

## About

A template for creating npm packages

# How to setup your project

1. Clone this repo or "use as template" and upload it to GitHub
2. Setup GitHub Secrets
3. Get your Sonar credentials
4. Configure and run the setup script
5. Configure Quality Gate in Sonar

## 2. GitHub Secrets

If not done by your organisation you will need to define the following secrets for your repository or your organisation:

- GITHUB_TOKEN
- NPM_TOKEN

(Note: You will also need to add a secret for Sonar in step 3.)

## 3. Sonar

Sonar Cloud will be used to analyse our project in terms of code-quality: https://en.wikipedia.org/wiki/Software_quality
Therefore we need to get credentials for our project. Create a Sonar-Account if you dont have one (it is free).

- Visit: https://sonarcloud.io/
- Select your profile or organisation.
- Select the GitHub project: https://sonarcloud.io/projects/create
- Configure "With GitHub Actions"
- Follow Step 1: Add the secret to your repository
- "Skip" step 2
- Copy and paste the values of "sonar.projectKey" and "sonar.FireboltCasters" into the setup.json

## 4. Setup Script

For the correct upload to npm and sonar and keep everything working correctly, the package.json file needs to be setup correctly. This can be tedious, so that you only need to configure the setup.json file to match your project:

```javascript
{
  "package": {
    "name": "<docker-github-reloader>",
    "description": "<packageDescription>",
    "keywords": [
      "npm-template"
    ],
    "repositoryURL": "https://github.com/FireboltCasters/npm-template.git",
    "author": "Steffen Droppelmann",
    "contributors": [
      {
        "name": "Nils Baumgartner",
        "email": "nilsbaumgartner1994@gmail.com",
        "url": "https://github.com/FireboltCasters"
      },
      {
        "name": "Steffen Droppelmann",
        "email": "steffen.droppelmann@gmail.com",
        "url": "https://github.com/FireboltCasters"
      }
    ],
    "license": "MIT"
  },
  "sonar": {
    "projectKey": "ExampleKey",
    "FireboltCasters": "ExampleOrganization"
  }
}
```

Then, run the following command:
(Note: After running this command, the setup files will be deleted)

```
npm run setup
```

## 5. Configure Quality Gate

Push your current project to GitHub. After that you should see on GitHub under "Actions" that some GitHub-Actions are being executed. The Sonar-Action will firstly fail with:

```
ERROR: QUALITY GATE STATUS: FAILED
```

This is because we haven't told Sonarcloud how it should measure the Quality Gate.

- Visit your project at: https://sonarcloud.io/projects/
- Select: "Set New Code definition"
- Select the code definition for your match. We recommend: "Previous version"
- Re-Upload your some minor change in your GitRepo to the master

## Contributors

The FireboltCasters

<a href="https://github.com/FireboltCasters/docker-github-reloader"><img src="https://contrib.rocks/image?repo=FireboltCasters/docker-github-reloader" alt="Contributors" /></a>
