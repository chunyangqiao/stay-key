# Depth and surfaces

Use elevation when it helps people understand layering, focus, or interaction. A shadow is one cue among surface color, overlap, borders, and position; do not add elevation to every container.

## Build a legible layer model

Choose how overlays relate to the page and to each other: menus, popovers, dialogs, and sticky regions should appear in a predictable order and remain usable. In light themes, a restrained shadow can clarify a raised surface. In dark themes, surface lightness or borders may communicate separation more clearly than a dark shadow.

Use stronger effects only where the relationship warrants it. Keep shadow direction and softness coherent across similar components. A pressed or dragged state may change elevation when that reinforces the interaction.

Rule `ui.elevation` treats shadows as elevation cues. A small shadow may suit a button, a medium shadow a menu, and a stronger shadow a modal; these are examples, not prescribed component styles. Keep a small, consistent elevation set rather than a separate improvised shadow for each component.

## Borders and separation

Avoid stacking a border, shadow, and contrasting background when one or two cues clearly express the edge (`ui.separation`). Spacing or a subtle surface change may separate regions without drawing a hard line. Retain borders where they help identify controls, table structure, or keyboard focus.

Useful rule references: shadow as elevation `ui.elevation`; stacked separators `ui.separation`.
