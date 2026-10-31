# UI audit

An audit is a diagnostic report. Keep it read-only unless the user asks for changes. Inspect the requested scope, gather evidence, and distinguish rendered observations from source-level hypotheses.

## Finding format

| Lens | Severity | Location | Rule | Evidence | Suggested change |
| --- | --- | --- | --- | --- | --- |
| Layout | P1 | `src/...` or screenshot region | `ui.group-spacing` | Rendered at 375px: label appears closer to next field than its own input | Increase within-group clarity or separate the groups |

Use a rule ID only when a matching principle supports the finding. A useful rule map:

| Rule | Principle |
| --- | --- |
| `ui.action-rank` | Rank actions for the task; one primary and quieter alternatives is a pattern, not a quota. Destructive actions are not automatically primary. |
| `ui.emphasis` | Keep primary content from being styled as tertiary supporting text. |
| `ui.label-value` | When needed to distinguish data, style labels as supporting content and keep the value prominent. |
| `ui.group-spacing` | Space around groups should clarify relationships; check common label, section, list, and control groups in context. |
| `ui.generous-space` | Generous space is one exploration method, not a defect to file against deliberate density. |
| `ui.density` | Deliberate density is valid when it serves scanning. |
| `ui.measure` | Keep reading measure comfortable; 45–75 characters is a heuristic. |
| `ui.text-align` | Align text for reading; long-form copy is usually not centered. |
| `ui.numeric-align` | Align numeric columns when comparison benefits. |
| `ui.leading` | Match line height to size and measure; display headings can be tighter than body text. |
| `ui.uppercase-tracking` | Test letter-spacing on all-caps labels at their actual size. |
| `ui.surface-text` | On colored surfaces, choose a compatible secondary text color; check actual contrast instead of relying on grey or opacity. |
| `ui.brand-color` | Keep an established brand color unless the task is a rebrand. |
| `ui.not-color-only` | Do not communicate status by color alone. |
| `ui.elevation` | Use coherent shadows for elevation when useful; example sizes are not mandatory component styles. |
| `ui.image-contrast` | Maintain readable contrast over images across the full text region. |
| `ui.icon` | Use a consistent icon family; emoji is not a substitute icon. |
| `ui.background` | Keep backgrounds and gradients in the established palette. An unplanned cross-family gradient competes; missing decoration is not a defect. |
| `ui.separation` | Do not stack border, shadow, and background when fewer cues separate the surface. |
| `ui.empty-state` | Consider a useful empty state when the product flow needs one; its absence is not automatically a defect. |

These IDs name design heuristics; they are not standards identifiers. Do not invent a violation from a rule alone. Assess the surface and report only material, actionable findings.

## Severity and evidence

- **P0:** observed issue materially blocks comprehension, access, or the primary task.
- **P1:** issue creates meaningful friction or inconsistency in the requested scope.
- **P2:** lower-impact refinement with a clear benefit.

These levels prioritize work; they do not make every missing state or polish detail a defect. A missing empty state is a finding only when it harms the user flow. Tie accessibility findings to the relevant criterion and evidence; see [accessibility](accessibility.md).

Mark each observation **rendered**, **code-only**, or **automated check**. Source inspection cannot establish pixel contrast, line wrapping, responsive fit, or focus visibility. Automated results do not certify conformance. When no browser or preview is available, say the visual review remains unverified.

## Review sequence

Inspect seven lenses in order: **hierarchy → layout and spacing → typography → color → depth → images and icons → finishing**. Skip a lens with no relevant surface. Structural changes can resolve later cosmetic findings; merge duplicates and report a systemic cause once rather than listing every instance.

Use this sweep checklist before writing the report. Record applicable checks even when no defect is found; load a lens reference when a judgment needs more context.

| Lens | Inspect |
| --- | --- |
| Hierarchy | Can the main task and primary action be identified, including a next step for a first-use empty screen (`ui.action-rank`, alongside `ui.empty-state`)? Do labels compete with values (`ui.label-value`), is primary content styled as tertiary (`ui.emphasis`), or do unrelated actions have equal primary weight (`ui.action-rank`)? |
| Layout and spacing | For forms, record the label-to-control and adjacent-group gaps from rendered geometry or CSS (`ui.group-spacing`). A label should be closer to its own control than to the next group; equal inner/outer gaps without another grouping cue are an actionable ambiguity. Check width and overflow at both viewports; respect deliberate density (`ui.density`) and do not file `ui.generous-space` against it. |
| Typography | Check actual line length (`ui.measure`), long centered text (`ui.text-align`), numeric alignment (`ui.numeric-align`), line height (`ui.leading`), and uppercase tracking (`ui.uppercase-tracking`). |
| Color | Check each actual foreground/background combination and color-only signals (`ui.not-color-only`). Inspect secondary text on colored surfaces (`ui.surface-text`), drift from established brand choices (`ui.brand-color`) and unplanned cross-family background gradients (`ui.background`); retain the project's semantic vocabulary. |
| Depth | Compare shadows to the element's actual elevation (`ui.elevation`), and check whether border, shadow and background separation duplicate each other (`ui.separation`). |
| Images and icons | Inspect text over the full image region (`ui.image-contrast`), crop, icon sizing (`ui.icon`), accessible names and decorative alternatives. |
| Finishing and states | Check useful initial empty-state guidance and actions (`ui.empty-state`), search-no-results, loading/error states and controls that have no purpose in the current state. Judge impact in context. |

Finish with a verification table: **Check | Status (pass / fail / unverified) | Evidence | Remaining work**. Keep static checks, actual browser observations, and model-behavior evaluations separate. Inspect responsive layouts and relevant states, then report the smallest useful set of findings. If asked to refine, implement targeted fixes and inspect the result again; preserve unrelated choices and report any unverified behavior.
