# Updatecli workflow

This directory contains the [Updatecli](https://www.updatecli.io/) configuration used to keep this repository up to date automatically.

## Purpose

The Updatecli workflow is used to:

- detect new versions of tracked dependencies or referenced components
- update repository files when a newer version is available
- open automated pull requests with the proposed changes

## Location

All Updatecli manifests and supporting files for this repository live under:

```text
.github/updatecli/
```

Github Actions workflows that run Updatecli are defined in:

```text
.github/workflows/updatecli.yaml
```

## How it works

At a high level, the workflow follows this process:

1. Read one or more Updatecli manifest files from this directory.
2. Query defined sources for the latest available versions.
3. Compare them with the versions currently referenced in the repository.
4. Apply updates to the target files when changes are needed.
5. Create or refresh a pull request containing the generated updates.

Each manifest/pipeline will create a separate pull request if updates are detected. The PRs will be labeled and targeted to the branch defined in `values.yaml`.

## Typical manifest structure

An Updatecli manifest usually defines:

- **sources**: where a version or value is discovered
- **targets**: the files or values to update in this repository
- **actions**: follow-up operations such as creating a pull request.

The actions part is done by `_scm.github.yaml` template which is loaded automatically for all manifest. The template uses values from `values.yaml` file for PR labels and destination branch name.

In general the `values.yaml` is used to inject values used by manifests.

## Running locally

If Updatecli is installed, manifests from this directory can be tested locally.

Needed variables for a local run:

```bash
# gh auth status
# gh auth refresh -s workflow
export UPDATECLI_GITHUB_TOKEN=$(gh auth token)
export UPDATECLI_ACTOR=<username>
```

Example:

```bash
# Dry run
updatecli pipeline diff --config .github/updatecli/updatecli.d/ --values .github/updatecli/values.yaml

# Update with creating PRs
updatecli pipeline apply --config .github/updatecli/updatecli.d/ --values .github/updatecli/values.yaml
```

Use `diff` to preview changes before applying them.

Render updatecli manifests for debugging purposes:

```bash
updatecli show --debug  --config .github/updatecli/updatecli.d/logging_stack.yaml --values .github/updatecli/values.yaml
```

## CI usage

This directory is intended to be consumed by a GitHub Actions workflow or another automation job that runs Updatecli on a schedule or on demand.

> [!IMPORTANT]
> A GitHub personal access token (PAT) with `workflow` permission required.
> The default `GITHUB_TOKEN` cannot modify files under `.github/workflows/`, which prevents workflows from self-modifying.
> Use a classic PAT with the `workflow` scope, or an equivalent token with workflow write access.


## Notes

- Keep manifests focused and easy to review.
- Prefer deterministic sources and explicit version selection ideally with `kind: githubrelease` source, to avoid unexpected updates.
- Validate generated changes before merging automated pull requests.
