# Repository-level Agent Guide  
  
## Working Principles  
  
- Think from first principles. Start from real requirements, code facts, and verification results; if the goal is unclear, discuss it with the user first.  
- Treat code, not documentation, as the source of truth. Unless the user explicitly says otherwise, do not read ordinary Markdown just to understand the implementation.  
- Before making code changes, read the relevant code and the most recent constraints, and follow the nearest `AGENTS.md` in the directory tree.  
- Keep changes focused. Do not slip in unrelated refactors along the way.  
  
## Linting and formatting  
  
- After making code changes, run `pnpm exec oxlint --fix src`, then run `pnpm exec oxfmt src`.  
- Before finishing, run `pnpm exec oxlint --deny-warnings --format=agent src`.  
- `pnpm lint` checks `src/` with `oxlint` and `oxfmt --check`. `pnpm lint:fix` runs `oxlint --fix src` and `oxfmt --write src`.  
- `pnpm fmt` runs `oxfmt --write src`. `pnpm fmt:check` runs `oxfmt --check src`.  
- The pre-commit hook runs `pnpm exec lint-staged`, which applies `oxlint --fix` and `oxfmt --write` to staged files under `src/`.  
  
## Environment Requirements  
  
- Node.js >=22.12.0 `node -v` satisfies `>=22.12.0`; the minimum declared by electron 45.0.0 `engines.node`)  
- pnpm 12.15.0 `pnpm -v` → `12.15.0`; `package.json` `packageManager` is `pnpm@12.15.0`)  
  
## Project Map

Stay Key is a Manifest V3 Chrome extension. Vite and CRXJS build these contexts:

- `src/popup` is the toolbar popup for recording, viewing, and generating secrets.
- `src/sidepanel` is the side panel for managing vault entries.
- `src/content` is the content script. It does not render extension UI into the page.
- `src/background` is the service worker for session and messaging.

Popup and sidepanel do not import `src/background`. The content script does not import popup or sidepanel UI. Put a module that more than one context imports in `src/shared`.

## User-State Safety  
  
- Tests run only against a temporary directory, so the developer's private data stays inaccessible: credentials, tokens, keychain items, transcripts, provider config, and project settings.  
  
  
## Commit Guidelines

- When committing, do not add any co-author attribution, and do not reveal the identity of the agent in commit messages, PR descriptions, or any explanatory text.
- Start the commit message with a Conventional Commits type: `feat`, `fix`, `build`, `chore`, `ci`, `docs`, `style`, `refactor`, `perf`, or `test`. Use `feat` for a new feature and `fix` for a bug fix.
- Before committing, run `pnpm fmt`, then `pnpm lint`.

## Agent skills

### Issue tracker

Issues and specs live as GitHub issues in `chunyangqiao/stay-key`. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical roles, each label string equal to its name: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
