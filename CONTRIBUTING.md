# How to contribute to Finschia-js

First of all, thank you so much for taking your time to contribute!
It will be amazing if you could help us by doing any of the following:

- File an issue in [the issue tracker](https://github.com/line/finschia-js/issues) to report bugs and propose new features and
  improvements.
- Ask a question by creating a new issue in [the issue tracker](https://github.com/line/finschia-js/issues).
  - Browse [the list of previously answered questions](https://github.com/line/finschia-js/issues?q=label%3Aquestion).
- Contribute your work by sending [a pull request](https://github.com/line/finschia-js/pulls).

## Contributor license agreement

When you are sending a pull request and it's a non-trivial change beyond fixing typos, please sign 
the ICLA (individual contributor license agreement). Please
[contact us](mailto:dev@finschia.org) if you need the CCLA (corporate contributor license agreement).

## Code of conduct

We expect contributors to follow [our code of conduct](https://github.com/line/finschia-js/blob/main/CODE_OF_CONDUCT.md).

## Commit message and Pull Request message

- Follow [Conventional Commit](https://www.conventionalcommits.org) to release note automation.
- Don't mention or link that can't accessible from public.
- Use English only. Because this project will be published to the world-wide open-source world. But no worries. We are fully aware of that most of us are not the English-native.

## Pull Requests

To accommodate review process we suggest that PRs are categorically broken up.
Ideally each PR addresses only a single issue. Additionally, as much as possible
code refactoring and cleanup should be submitted as a separate PRs from bugfixes/feature-additions.

### Process for reviewing PRs

All PRs require two Reviews before merge (except docs changes, or variable name-changes which only require one). When reviewing PRs please use the following review explanations:

- `LGTM` without an explicit approval means that the changes look good, but you haven't pulled down the code, run tests locally and thoroughly reviewed it.
- `Approval` through the GH UI means that you understand the code, documentation/spec is updated in the right places, you have pulled down and tested the code locally. In addition:
  - You must also think through anything which ought to be included but is not
  - You must think through whether any added code could be partially combined (DRYed) with existing code
  - You must think through any potential security issues or incentive-compatibility flaws introduced by the changes
  - Naming must be consistent with conventions and the rest of the codebase
  - Code must live in a reasonable location, considering dependency structures (e.g. not importing testing modules in production code, or including example code modules in production code).
  - if you approve of the PR, you are responsible for fixing any of the issues mentioned here and more
- If you sat down with the PR submitter and did a pairing review please note that in the `Approval`, or your PR comments.
- If you are only making "surface level" reviews, submit any notes as `Comments` without adding a review.

## Forking
To create a fork and work on a branch of it, I would:

- Create the fork on github, using the fork button.
- Go to the original repo checked out locally
- `git remote rename origin upstream`
- `git remote add origin git@github.com:someone/finschia-js.git`

Now `origin` refers to my fork and `upstream` refers to the finschia-js version.
So I can `git push -u origin main` to update my fork, and make pull requests to finschia-js from there.
Of course, replace `someone` with your git handle.

To pull in updates from the origin repo, run

- `git fetch upstream`
- `git rebase upstream/main` (or whatever branch you want)

Please don't make Pull Requests from `main`.

## Dependencies

We use [yarn 3.1](https://classic.yarnpkg.com/lang/en/) to manage
dependency versions.

The `main` branch of every finschia-js repository should just build with `yarn install`, `yarn build`,
which means they should be kept up-to-date with their dependencies, so we can
get away with telling people they can just go get our software.

## Testing

Tests can be ran by running `yarn test` at the top level of the finschia-js repository.

To run tests that need to interact with the chain (e.g. contract instantiation), start the test chain with `./scripts/finschia/start.sh` and `./scripts/finschia/init.sh`. After start up a test chain, run tests with `SIMAPP_ENABLED=true yarn test`.

## Branching Model and Release

User-facing repos should adhere to the trunk based development branching model: https://trunkbaseddevelopment.com/.

Libraries need not follow the model strictly, but would be wise to.

This repo utilizes [semantic versioning](https://semver.org/).

### PR Targeting

Ensure that you base and target your PR on the `main` branch.

All feature additions should be targeted against `main`. Bug fixes for an outstanding release candidate
should be targeted against the release candidate branch.

### Development Procedure

- the latest state of development is on `main`
- `main` must never fail `yarn build`, `yarn test`
- `main` should not fail `yarn lint`
- no `--force` onto `main` (except when reverting a broken commit, which should seldom happen)
- create a development branch either on github.com/line/finschia-js, or your fork (using `git remote add origin`)
- before submitting a pull request, begin `git rebase` on top of `main`

### Pull Merge Procedure

- ensure pull branch is rebased on `main`
- run `yarn test` to ensure that all tests pass
- run `yarn lint-fix` to ensure that linting is done
- merge pull request (We are using `squash and merge` for small features)

### Release Procedure

- Start on `main`
- Create the release candidate branch `rc/v*` (going forward known as **RC**)
  and ensure it's protected against pushing from anyone except the release
  manager/coordinator
  - **no PRs targeting this branch should be merged unless exceptional circumstances arise**
- On the `RC` branch, prepare a new version section in the `CHANGELOG.md`
  - All links must be link-ified
  - Copy the entries into a `RELEASE_CHANGELOG.md`, this is needed so the bot knows which entries to add to the release page on github.
- After all test has successfully completed, create the release branch
  (`release/vX.XX.X`) from the `RC` branch
- Create a PR to `main` to incorporate the `CHANGELOG.md` updates
- Tag the release (use `git tag -a`) and create a release in Github
- Delete the `RC` branches

