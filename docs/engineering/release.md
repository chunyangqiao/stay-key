# Release

`main` publishes the stable extension. `beta` publishes the beta extension. Both appear in this repository's GitHub Release list. The package stays private, so the release is the GitHub Release and its zip, not an npm publish.

`.github/workflows/release.yml` is the source of truth for the job. This document is the contract around that job.

## When a release happens

Publish from a push to `main` or `beta`.

A release runs when a changeset markdown file other than `README.md` sits directly in `.changeset/`. Add that file on the feature branch with `pnpm exec changeset`, and merge it with the change. A push with no pending changeset succeeds and leaves the Release list unchanged. The baseline `0.1.0` is not a GitHub Release.

`changeset version` on the release branch writes the new version into `package.json` and `CHANGELOG.md`. Leave that bump to CI.

`beta` stays in changesets pre mode through `.changeset/pre.json` (`mode` is `pre`, `tag` is `beta`). The first bump in a pre cycle applies the changeset type, so `0.1.0` plus a patch becomes `0.1.1-beta.0`. Later changesets in that same cycle increment the beta number. `main` releases a plain version, such as `0.1.1`.

Keep `.changeset/pre.json` on `beta`. On the change that merges to `main`, delete `.changeset/pre.json` and move the markdown files in `.changeset/pre/` back to `.changeset/`. Do not run `pnpm exec changeset` again for that same change. The release job treats only `.changeset/*.md` as pending, so a file left in `.changeset/pre/` does not start a `main` release. `changeset version` still reads `.changeset/pre/`, and a second changeset is published beside those files. The `main` release fails while `.changeset/pre.json` is present and a changeset is still pending.

## What CI publishes

The workflow checks out the branch tip, runs `changeset version`, then `pnpm build`. The zip is `release/stay-key-<version>.zip`, and that directory stays untracked. CI commits the version bump as `chore: version packages`, fast-forwards it to the same branch, then creates GitHub Release `v<version>` with the zip. The release notes are the new `CHANGELOG.md` section. A `beta` Release is marked as a pre-release, so it stays on the Release list and does not replace the latest stable Release.

Use the subject `chore: version packages` only for that CI commit. When that commit is already on the branch and its Release is missing, the workflow builds and publishes that version instead of bumping again.

Keep `privatePackages.version` in `.changeset/config.json` set to `true`. With it off, changesets skips versioning this private package.

## Chrome manifest version

Chrome accepts one to four dot-separated integers in `version`, and each integer is from 0 through 65536. `manifest.config.ts` stores the changesets version in `version_name` and derives `version` from it:

- `0.1.1` stays `0.1.1`.
- `0.1.1-beta.0` becomes `0.1.1.1`. The fourth component is the prerelease number plus one, so `beta.0` does not compare equal to the stable version.

The settings screens show `version_name`, so the UI shows the changesets version. For one semver, the beta `version` is greater than the stable `version`. Installing that stable build over that beta build is a downgrade. The next stable version sorts above it.
