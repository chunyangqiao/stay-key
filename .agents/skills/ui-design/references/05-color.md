# Color

Color can establish identity, hierarchy, state, and grouping. Make those jobs intentional and reuse the project's semantic roles. Do not substitute arbitrary palette utilities when the product already has named colors.

## Palette and meaning

Build a restrained palette with enough shades to support surfaces, text, emphasis, and states. Neutral colors typically carry much of an interface; brand and status colors should have clear roles. Semantic color names should describe use (such as foreground, border, danger, or success), while primitive ramps describe color values.

When an existing theme has no error or success role, communicate that state with its existing readable foreground, explicit wording and appropriate status semantics. Propose a new semantic role only when needed for the requested design; adding a `red-*` or `green-*` utility silently introduces another palette. Inspect the existing control boundaries and state colors before reducing their opacity, since that can undo their contrast.

On a colored surface, a secondary foreground often works better when derived from that surface's hue than when it is an unrelated grey (`ui.surface-text`). This is a visual heuristic; measured contrast and the actual rendering still matter. Opacity can be appropriate for overlays and disabled states, but do not use it as a substitute for a tested text color.

## Contrast and redundant cues

For WCAG 2.2 AA text contrast, use at least 4.5:1 for normal text and 3:1 for large text. Large text is at least 24 CSS px, or at least 18.6667 CSS px when bold (weight 700 or higher). Meaningful non-text UI components and graphical objects have separate 3:1 requirements against adjacent colors when applicable; assess focus indicators under their applicable criteria. A decorative border does not automatically need 3:1 contrast.

Do not rely on color alone to communicate status, error, selection, or chart series (`ui.not-color-only`). Pair color with text, shape, icon, pattern, or another perceivable cue. Check foreground/background pairs in the actual theme and state, including hover and focus.

These are WCAG thresholds, not a guarantee of conformance. See [accessibility](accessibility.md) for scope and other checks.
