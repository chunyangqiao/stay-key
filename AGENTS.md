# Repository-level Agent Guide  
  
## Working Principles  
  
- Think from first principles. Start from real requirements, code facts, and verification results; if the goal is unclear, discuss it with the user first.  
- Treat code, not documentation, as the source of truth. Unless the user explicitly says otherwise, do not read ordinary Markdown just to understand the implementation.  
- Before making code changes, read the relevant code and the most recent constraints, and follow the nearest `AGENTS.md` in the directory tree.  
- Keep changes focused. Do not slip in unrelated refactors along the way.  
  
## Linting and formatting  
  
- After making code changes, run `pnpm exec oxlint --fix src tests`, then run `pnpm exec oxfmt src tests`.  
- Before finishing, run `pnpm exec oxlint --deny-warnings --format=agent src tests`.  
- `pnpm lint` checks `src/` and `tests/` with `oxlint` and `oxfmt --check`. `pnpm lint:fix` runs `oxlint --fix src tests` and `oxfmt --write src tests`.  
- `pnpm fmt` runs `oxfmt --write src tests`. `pnpm fmt:check` runs `oxfmt --check src tests`.  
- The pre-commit hook runs `pnpm exec lint-staged`, which applies `oxlint --fix` and `oxfmt --write` to staged files under `src/` and `tests/`.  
  
## Environment Requirements  
  
- Node.js >=22.12.0 `node -v` satisfies `>=22.12.0`; the minimum declared by electron 45.0.0 `engines.node`)  
- pnpm 12.15.0 `pnpm -v` → `12.15.0`; `package.json` `packageManager` is `pnpm@12.15.0`)  
  
## Project Map

Stay Key is a Manifest V3 Chrome extension. Vite and CRXJS build these contexts:

- `src/sidepanel` is the side panel for managing vault entries.
- `src/background` is the service worker for session and messaging.
- `src/index.css` is the shared Tailwind CSS entry imported by UI contexts.
- `src/shared` holds modules used by more than one context. It is grouped into `crypto`, `session`, `vault`, `entries`, `chrome`, `settings`, and `onboarding`. `constants`, `bytes`, `error-message`, and `utils` stay at the `src/shared` root.
- `tests/` at the repo root holds every Vitest file. Name a file `*.test.ts` and import the module under test with a relative path into `src/`. Vite does not bundle `tests/`.

Sidepanel does not import `src/background`. Put a module that more than one context imports in `src/shared`. Files under `src/` prefer the `@/` alias for project imports.

## User-State Safety  
  
- Tests run only against a temporary directory, so the developer's private data stays inaccessible: credentials, tokens, keychain items, transcripts, provider config, and project settings.  
  
  
## Commit Guidelines

- When committing, do not add any co-author attribution, and do not reveal the identity of the agent in commit messages, PR descriptions, or any explanatory text.
- Start the commit message with a Conventional Commits type: `feat`, `fix`, `build`, `chore`, `ci`, `docs`, `style`, `refactor`, `perf`, or `test`. Use `feat` for a new feature and `fix` for a bug fix.
- Before committing, run `pnpm fmt`, then `pnpm lint`.

## Release

`main` publishes a stable GitHub Release. `beta` publishes a prerelease. Feature-branch pushes do not publish. Read `docs/engineering/release.md` before adding a changeset, changing the package version, editing `.github/workflows/release.yml`, or changing the manifest version in `manifest.config.ts`.

- Ship a change with `pnpm exec changeset` on the feature branch. CI on `main` or `beta` runs `changeset version`, builds, and attaches `release/stay-key-<version>.zip` to Release `v<version>`.
- Keep `.changeset/pre.json` on `beta`. Remove it from any change that merges to `main`. A changeset consumed on `beta` does not publish `main`; add a changeset to the `main` merge.
- Leave the version bump to CI. The CI commit subject is `chore: version packages`.
- `manifest.config.ts` stores the changesets version in `version_name` and a Chrome-safe `version`. The settings screens show `version_name`. For one semver, the beta manifest `version` is greater than the stable `version`.

## Agent skills

### Issue tracker

Issues and specs live as GitHub issues in `chunyangqiao/stay-key`. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical roles, each label string equal to its name: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
