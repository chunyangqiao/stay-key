# Visual hierarchy

Hierarchy helps people see what matters and what they can do. Judge it relationally: an element stands out because surrounding elements recede as well as because it is emphasized.

## Rank before styling

For the current surface, identify the main task or information, its supporting material, and lower-priority context. Use a small number of clear levels. If everything is prominent, nothing is. If there is no single main action, do not invent one just to satisfy a design rule.

Adjust hierarchy with several levers:

- **Position and grouping:** place related content together and separate distinct tasks.
- **Typography:** use size, weight, and line length together.
- **Color:** reserve stronger contrast for content that needs attention; soften secondary information without making it hard to read.
- **Shape and space:** use scale, alignment, and surrounding space to show relationships.
- **Interaction:** make enabled, selected, focused, and destructive actions understandable.

Avoid making every title large, every button filled, or every status vivid. Emphasize by reducing competition where that preserves clarity. `ui.emphasis` applies when primary content is styled as tertiary supporting text.

## Actions and semantics

Give the principal action clear visual priority when the task has one. Secondary and low-frequency actions can be quieter; destructive actions need clear meaning and an appropriate confirmation flow, not automatic visual dominance. Preserve semantic HTML and heading structure independently from visual styling: choose elements for meaning, then style them for hierarchy.

### Action treatments

`ui.action-rank` ranks actions according to the task. A common treatment is one primary action, a few secondary actions, and quieter tertiary actions. This is a useful pattern, not a quota: if there is no principal action, do not fabricate one. Destructive actions need clear meaning and safe interaction; they are not automatically primary.

### Labels and values

When a label is needed to distinguish a metric, keep the value visually primary and make the label supporting content (`ui.label-value`). Reverse that relationship only when users are specifically scanning for the label.

Rule references useful in audits: action hierarchy `ui.action-rank`; labels and values `ui.label-value`; primary content treated as secondary `ui.emphasis`.
