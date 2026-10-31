---
name: ui-design
description: Design Tailwind CSS v4 tokens and adjust existing shadcn components in the user's project. Use when setting or revising design tokens, theme variables, or shadcn component styling; require the Tailwind CSS entry file and the base component directory before editing. Also use for a read-only visual audit. Preserve existing token names, color formats, and component APIs.
---

# UI Design

This skill applies the design references to two edits in the user's project: Design Tokens in the Tailwind CSS entry, and styling adjustments to existing shadcn components. The principles inform those decisions; they are not a checklist of universal style laws. Existing product conventions and explicit user direction take precedence.

## Required paths

Before editing, obtain both paths from the user:

- The Tailwind CSS entry, the stylesheet that contains `@import "tailwindcss"` or `@theme`.
- The base component directory that holds the project's shadcn components.

Ask for any missing path and wait. Read the entry and the components the task will change before choosing values. See [implementation](references/10-implementation.md).

## Route by task

- **Design tokens:** edit the named Tailwind entry. Follow [tokens and design-system workflow](references/09-design-system.md) and [implementation](references/10-implementation.md).
- **shadcn components:** adjust the components the task concerns in the named directory. Follow [implementation](references/10-implementation.md).
- **Audit or critique:** report evidence-based findings without changing files unless the user also asked for fixes. Use [the audit guide](references/11-audit.md).
- **Focused explanation:** read only the reference for that topic.

## Discover before deciding

Read the named entry and the components in the named directory. Confirm the entry is Tailwind CSS v4. Identify light/dark behavior, responsive breakpoints, available icons and assets, and established interaction patterns. Reuse those names, color formats, and component APIs. Keep the project's styling system, token vocabulary, and installed dependencies.

The edit lands in the named entry and the named components. Create a standalone `design-tokens.json` package only when the user asks for that package, and follow [the design-system workflow](references/09-design-system.md). The CLI cannot decide the product's visual character. Choose and document the visual direction, then review the result in the named files.

## Design and implement

1. **Brief:** identify the user, primary task, content hierarchy, key action, product character, and required states. Make material visual choices explicit before styling. See [design brief](references/01-design-brief.md). Done when those items are recorded for this edit.
2. **Structure:** solve hierarchy, grouping, layout, and responsive behavior before adding decorative detail. See [hierarchy](references/02-hierarchy.md) and [layout](references/03-layout-spacing.md). Done when the grouping and responsive behavior for this edit are chosen.
3. **Visual language:** make purposeful choices for typography, color, depth, imagery, and finishing. Read the relevant [references](#references). Done when each choice used in the edit is explicit.
4. **Apply:** edit the named Tailwind entry, the named components, or both. For color or status styling, consult [color roles](references/05-color.md), including missing-role handling in existing systems. Tailwind v4 uses CSS-first theme configuration; see [implementation](references/10-implementation.md). Token work is done when the agreed semantic roles are in that entry and its existing names and color format remain. Component work is done when the edited components use those roles and their public props remain.
5. **Accept:** trace component colors back to the project's semantic roles, including badges, metrics, errors and hover states. A passing Token check does not cover extra palette utilities introduced in markup; incorporate additional roles and real pairs into the system before accepting them. Inspect the actual interface at 375px and 1280px when a browser preview is available. Exercise the important interaction, empty, loading, error, and populated states that apply; use the keyboard for interactive paths. Run relevant existing checks. Report what was rendered, code-only, or left unverified.
6. **Refine:** fix the highest-impact observed problem first, then inspect the result again.

For a focused task, skip unrelated steps and references. When the user wants a specific style, follow it; when the brief leaves room, make and explain a coherent design choice rather than defaulting to generic dashboard styling.

## Evidence and standards

Separate **product requirements**, **web accessibility requirements**, **project conventions**, and **design recommendations**. Do not present an opinion or a design heuristic as a standard. Automated contrast or markup checks do not certify WCAG conformance. State whether an observation came from rendered pixels, source inspection, or an automated check. Missing content is not automatically a P0 problem; judge its effect in context.

Use the user's language for user-facing briefs, reports, and generated documentation. Keep code identifiers and established project terminology intact.

## References

- [01 · Design brief](references/01-design-brief.md) — product character, feature-first exploration, and iteration.
- [02 · Hierarchy](references/02-hierarchy.md) — importance, emphasis, and action priority.
- [03 · Layout and spacing](references/03-layout-spacing.md) — grouping, measure, grids, and responsive composition.
- [04 · Typography](references/04-typography.md) — type, readability, and text hierarchy.
- [05 · Color](references/05-color.md) — palettes, semantic color, and contrast.
- [06 · Depth](references/06-depth.md) — elevation, layering, borders, and shadows.
- [07 · Images and icons](references/07-images.md) — image selection, crop, and scale.
- [08 · Finishing](references/08-finishing.md) — details, empty states, and restraint.
- [09 · Design system](references/09-design-system.md) — token roles and the optional standalone token package.
- [10 · Implementation](references/10-implementation.md) — edits to the named Tailwind entry and shadcn components.
- [11 · Audit](references/11-audit.md) — read-only findings and evidence labels.
- [Evaluation](references/evaluation.md) — developing or validating the skill itself; repository tooling and behavioral fixtures.
- [Accessibility](references/accessibility.md), [dark themes](references/dark-themes.md), [motion](references/motion.md), [data visualization](references/data-visualization.md), and [interactions](references/interactions.md) — load only for those concerns.

## License

The included skill materials are licensed under the repository's MIT license.
