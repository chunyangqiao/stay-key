# DESIGN.md format

`DESIGN.md` is the design-system document for this skill. It follows the [DESIGN.md spec](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md) that [Stitch](https://stitch.withgoogle.com/docs/design-md/overview/) uses. YAML tokens are the values. Prose says how to apply them. Judgment for hierarchy, color, type, layout, depth, imagery, and finishing stays in the numbered references. Do not copy those references into the file.

## When to read or write it

Read an existing `DESIGN.md` before establishing or revising the visual system. Write it when that is the task. The path the user names wins; otherwise use `DESIGN.md` at the project root.

A change to one existing component edits the named Tailwind entry and components. Do not create a `DESIGN.md` for that change when the project has none.

## File shape

The generator writes one YAML front matter block. A reader also accepts `yaml` fences inside sections and merges every block into one tree. Defining the same top-level key twice is an error.

An optional `#` title is not a section. Known `##` sections appear in this order. Omit one only by listing it in `omitted`, with `reason` when the reason matters. A repeated known section is an error. Known sections out of this order are an error. An unknown `##` heading stays in the file.

| Order | Section | Aliases | Tokens |
| --- | --- | --- | --- |
| 1 | Overview | Brand & Style | — |
| 2 | Colors | — | `colors` |
| 3 | Typography | — | `typography` |
| 4 | Layout | Layout & Spacing | `spacing` |
| 5 | Elevation & Depth | Elevation | prose only |
| 6 | Shapes | — | `rounded` |
| 7 | Components | — | `components` |
| 8 | Do's and Don'ts | — | — |

`omitted` also accepts the token names `spacing` and `rounded` for the Layout and Shapes sections.

## Tokens

```yaml
version: alpha
name: <string>
description: <string>          # optional
omitted: <section or { section, reason }>
colors:
  <name>: <CSS color or {colors.other}>
typography:
  <name>:
    fontFamily: <string>
    fontSize: <px, em, or rem>
    fontWeight: <number>
    lineHeight: <number or dimension>
    letterSpacing: <dimension>
rounded:
  <step>: <dimension>
spacing:
  <step>: <dimension or number>
components:
  <component>:
    <property>: <value or reference>
```

`version` is `alpha` for a file this skill writes. `name` is required. `colors.primary` is required when `colors` is present. A reference has the form `{colors.primary}` and resolves to a value. Inside `components`, a reference may point at a typography token such as `{typography.body-md}`.

Color values may be any CSS color. Hex `#RRGGBB` is the form to write. The JSON token package still stores hex; that limit belongs to the package, not to `DESIGN.md`.

Typography uses `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `fontFeature`, and `fontVariation`. A dimension is a number plus `px`, `em`, or `rem`.

Component properties are `backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, and `width`. Keep an unknown property and treat it as a warning. Name a state as its own component, such as `button-primary` and `button-primary-hover`.

The generator records every semantic color, every type step, the spacing and radius scales, shadow values in the Elevation prose, and the button and input components. Add chips, lists, checkboxes, radio buttons, tooltips, and other variants the product uses. Do not add a top-level key for shadows, z-index, or border width.

## Dark values

A dark value uses the light token's name plus `-dark`, such as `surface` and `surface-dark`. Unsuffixed color tokens are the light values. Map those tokens onto the project's roles as defined in [implementation](10-implementation.md). Elevation stays prose because the spec has no shadow token group. Put shadow values in that prose.

## Prose

Overview states the audience, personality, and density. Replace an Overview that says the visual direction is not yet decided before treating the file as approved.

Write each unsuffixed color as `- **primary** (#2665fd): what it is for`. A name ending in `-dark` is that color in dark mode; one sentence covers those tokens. Replace a line that says to state what a color is for before treating the file as approved. Typography, layout, shapes, and components state the choice a screen should follow. Do's and Don'ts state constraints that follow from this system, and stay pending review until a person confirms them.

## Where a decision goes

Put a value in the token group the spec already has. Put the rule in that group's section. Do not add a section for personality, the sidebar, or the current layout, and do not add a top-level YAML key. An unknown `##` heading already in a file stays; a new file still uses the eight sections above.

| Decision | Where it goes |
| --- | --- |
| Audience, personality, density, and tone | Overview prose |
| Semantic colors, including roles outside the standalone package, and their dark values | `colors`, with `-dark` for the dark value. Colors prose states each unsuffixed color's use |
| How ramps are built, contrast, one primary action, status that needs text, chart series, focus, and whether dark mode follows the system | Colors prose. Measured contrast sits on the color it concerns |
| Type scale, including sizes that are not on the base steps | `typography`. A size off the scale uses a role name such as `page-title` or `caption`. `lineHeight` may be a unitless multiplier |
| Which weights exist, line height by role, and the measure | Typography prose, when the token does not already record the choice |
| Spacing scale and layout measures such as a sidebar width, card padding, or section gap | `spacing` |
| What changes at a breakpoint, which regions are placeholders, and border widths | Layout prose. A breakpoint width may also be a spacing token; the behavior stays prose |
| Shadow values, which level is used where, z-index, and where opacity is allowed | Elevation & Depth prose. The spec has no shadow or z-index group |
| Corner radii, including a larger radius for cards or a hero | `rounded`, with a descriptive step name. Exceptions stay in Shapes prose |
| Button variants, inputs, banners, and the current navigation item | `components`, one key per state, using only the component properties above |
| How a component consumes a token, such as which color is brand text | Components prose |
| Token governance and the system's don'ts | Do's and Don'ts |

The generator fills token values it can read. It does not invent a product rule that is not in the token file. Write those rules into the section this table names.

## Done

The file is done when:

- Present sections follow the order above, and every omitted standard section is listed in `omitted`.
- The tokens parse, including `colors.primary` when colors are present.
- Each unsuffixed color in the prose states a use. No line still says to state what a color is for.
- Overview describes this product. It does not say the visual direction is not yet decided.
- Layout, elevation, shapes, and components state this product's choices.
- Do's and Don'ts come from this system.

Validate the file with the design-system CLI. Command details live in [the design-system reference](09-design-system.md).
