# Typography

Typography carries content, hierarchy, and character. Use the fonts already loaded by the project where they fit; consider a new face only when the design direction needs it and the project can support it.

## Readability and hierarchy

Use a deliberate type scale instead of unrelated sizes. Distinguish levels with size, weight, color, and spacing; do not solve every hierarchy problem by shrinking secondary text or enlarging headings. Keep interface text legible at its expected size and use available font weights consistently.

Constrain long paragraphs to a readable measure (`ui.measure`). Roughly 45–75 characters per line is a useful starting heuristic, not a universal bound for every language or content type. Line height depends on size and measure (`ui.leading`): small body text often needs more relative leading than a display heading.

## Alignment and detail

Align body copy according to reading direction and content shape (`ui.text-align`). Centered text can work for short headings or brief messages; long paragraphs are generally easier to scan when aligned with the reading edge. Align numeric columns when comparison matters (`ui.numeric-align`). Use letter spacing sparingly and test all-caps labels at their actual size (`ui.uppercase-tracking`).

Keep document semantics meaningful: heading level describes structure, not merely desired font size. Verify font loading, wrapping, and truncation at the target viewport.
