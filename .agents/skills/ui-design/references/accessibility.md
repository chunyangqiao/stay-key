# Accessibility checks for interface design

Accessibility is part of the interface brief. Follow applicable standards and the project's accessibility patterns; design heuristics do not replace them.

## Review the interaction

- Use semantic controls and headings; preserve a meaningful document structure.
- Make every action keyboard operable, with a visible focus indicator and logical focus movement.
- Give controls accessible names and associate labels, instructions, and errors with their inputs.
- Pair status or error color with a text, shape, icon, or other signal.
- Provide useful alternatives for informative images and charts; hide decorative images from assistive technology.
- Check zoom/reflow, content order, touch interaction, and reduced-motion preferences where relevant.

## Contrast

WCAG 2.2 AA requires 4.5:1 for normal text and 3:1 for large text. Large text is at least 24 CSS px, or 18.6667 CSS px at bold weight 700 or higher. Meaningful non-text controls and graphical objects have a separate 3:1 requirement against adjacent colors where applicable. Evaluate focus indicators against their applicable success criteria; do not assume every decorative border is a required contrast target.

Measure actual foreground/background pairs for each state. A palette-level or CLI check covers only the pairs it was given. Automated checks can find some issues but cannot prove accessibility or WCAG conformance.
