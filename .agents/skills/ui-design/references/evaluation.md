# Skill development and evaluation

These commands are for a **joe-skills repository checkout**, not a dependency-free
installed skill. Development dependencies stay at the repository root.

- `pnpm test` runs repository tests, including Token/CLI, audit scorer, and real
  Tailwind v4 compilation checks.
- `pnpm format:check` checks the maintained JavaScript, TSX, JSON and YAML.
- `node --test tests/ui-design/integration.test.mjs` runs the focused compilation
  and package checks. `node --test tests/ui-design` runs every ui-design test.
- `node tests/ui-design/harness/preview.mjs --serve` serves the generated token
  preview, the scoped alias check, and the eight audit fixtures on loopback.
  Inspect an audit fixture at 375px and 1280px when that case is in scope.
- `node tests/ui-design/harness/evaluate.mjs --self-check` checks the eight
  preserved audit fixtures only.
- `node tests/ui-design/harness/evaluate.mjs --reports /absolute/report-directory`
  checks reports from a real independent agent run; missing reports fail.

Fixtures live under `tests/ui-design/fixtures/`: eight source HTML/gold
diagnostic cases, invocation prompts, and two generation tasks (in-place tokens
and component adjustment). Give an evaluating agent the skill, task and raw input; keep
expected labels hidden. Use a fresh context and a temporary output workspace.

Record host/model, revision or worktree state, prompt, actual artifacts, checks,
browser evidence and limitations. Report invocation, artifact generation,
diagnostic matching and visual acceptance separately. Synthetic scorer tests,
fixture integrity and prepared prompts are not completed model evaluations.

Tailwind compilation checks the generated theme. An actual target project still
needs its own build and browser checks. Automated contrast checks cover declared
pairs and do not certify WCAG conformance.
