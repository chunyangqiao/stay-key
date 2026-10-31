# Design system and tokens

Use a design system to make repeated choices coherent, not to force every surface into identical styling. Existing systems remain authoritative: map design decisions into their vocabulary and fill only real gaps.

## When no system exists

First understand the product and agree on its visual direction. Add the missing semantic roles to the user's Tailwind CSS entry, using that file's names and color format. See [implementation](10-implementation.md).

## Standalone token package

Create `design-tokens.json` and its generated files only when the user asks for that package:

```sh
node scripts/design-system.mjs init --brand '#0f766e' --name 'Lumen' --out design
```

This writes `design-tokens.json`, `tokens.css`, `theme.css`, `DESIGN.md`, and `preview.html`. Review and localize the starter; enrich `DESIGN.md` with product decisions. Generated colors and roles are a foundation, not approved brand design. The CLI initializes a dark mode by default. Merge the reviewed roles into the user's Tailwind entry when that entry is the project source of truth.

Generate a color ramp directly when useful:

```sh
node scripts/design-system.mjs palette --base '#0f766e'
```

Validate or emit a reviewed token file:

```sh
node scripts/design-system.mjs validate design/design-tokens.json
node scripts/design-system.mjs emit design/design-tokens.json --out design-next --dry-run
node scripts/design-system.mjs emit design/design-tokens.json --out design-next
```

Validation checks schema, references, and declared light/dark contrast pairs. A passing CLI check does not certify accessibility or visual quality.

After changing tokens, emit into a fresh directory and merge the reviewed result. Existing byte-identical files are no-ops; changed generated files are conflicts. The CLI does not overwrite them in place. A source JSON may share its own output path, but changed CSS or documentation still require a fresh destination.

The CLI uses Node.js 22+ and Node built-ins only. An installed skill does not need `package.json` or dependencies. It preflights output conflicts, leaves identical files as no-ops, and preserves local edits. When the CLI is unavailable, edit the Tailwind entry directly and say that the CLI did not generate the output.

## When a system already exists

Inspect its theme, CSS variables, primitives, and documented conventions. Use its existing color space and naming, including OKLCH if already present. Map the brief into the current system and add only missing decisions with minimal edits. Leave the system in its current color space and naming. Preview any proposed write before applying it and preserve unrelated user edits.

## Schema v1 at a glance

The root object contains `version: 1`, `meta` (including the system `name`), `primitive`, `semantic`, optional `modes`, and `pairs`.

- `primitive` stores ramps and scales: `color.brand`, `neutral`, `danger`, `success`, `warning`, `white`; `font`, `text`, `spacing`, `radius`, `shadow`, `weight`, and `leading`.
- `semantic.color` maps UI roles to primitive references. References use braces, for example `{primitive.color.brand.600}`.
- `modes.dark.color` overrides semantic roles for dark mode.
- `pairs` names foreground/background checks. Each pair references semantic values, for example `{semantic.color.foreground}` and `{semantic.color.background}`, with `kind: 'text' | 'ui'` and optional `fontSize` / `fontWeight`.
- Generated color values use hex. This describes the standalone package. A project's existing color format stays as it is.

The supported semantic roles are: `background`, `foreground`, `card`, `card-foreground`, `muted`, `muted-foreground`, `primary`, `primary-foreground`, `primary-hover`, `secondary`, `secondary-foreground`, `destructive`, `destructive-foreground`, `success`, `success-foreground`, `warning`, `warning-foreground`, `border`, `input`, and `ring`.

For Tailwind v4 integration, see [implementation](10-implementation.md). The standalone CSS uses `@theme inline` to map theme variables.
