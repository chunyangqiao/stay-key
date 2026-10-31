# Layout and spacing

Layout makes relationships and reading order visible. Fit the composition to the content and task instead of stretching or compressing content to fill a familiar template.

## Grouping and rhythm

Use consistent spacing values where the project has a scale. Give related items less separation than unrelated groups; labels and fields, list items and sections should not look equally connected. Check this horizontally as well as vertically. Increase space before adding separators or boxes when distance can communicate the grouping more simply.

Reference rule: ambiguous group spacing `ui.group-spacing`.

`ui.group-spacing` covers common cases: labels and fields, section headings and content, list rhythm, and horizontally grouped controls. Evaluate the relationship in context; equal-looking gaps are not automatically errors.

## Width and responsive composition

Constrain long-form text to a comfortable measure. Wider surfaces may need columns, sidebars, or tables, while reading content may remain narrow. Let fixed and fluid regions follow their content needs. Test how the layout rearranges at narrow widths; responsive design includes order, visibility, and interaction, not only smaller widths.

Use a spacing and sizing scale where it supports consistency, but treat the scale as a design aid rather than a ban on all exceptions. A project-specific exception should have a reason and remain understandable in context.

### Density is a design choice

`ui.generous-space` describes beginning with generous space and reducing it as needed. That exploration method is not a universal requirement to maximize whitespace. Dense layouts are appropriate when users benefit from seeing substantial information together. `ui.density` calls for deliberate density: use consistent spacing and make the content's scanning needs the reason. Do not report intentional density as a defect merely because the page is compact.

## Start from the content

Choose a layout that serves the current feature. A feature-first slice can reveal what the shell needs; avoid spending effort on navigation and framing before the page's content is understood. Avoid adding columns or panels that contribute no useful information.
