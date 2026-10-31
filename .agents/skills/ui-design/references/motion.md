# Motion and microinteractions

Motion should help users understand feedback, continuity, focus, or state change. Keep it brief and proportional to the task. Static feedback is preferable when motion adds no useful information.

- Animate properties that do not cause avoidable layout work; keep interaction feedback responsive.
- Preserve clear focus and state even when animation is unavailable.
- Honor `prefers-reduced-motion`; reduce or remove nonessential movement and transitions.
- Do not use motion as the only signal for success, error, selection, or progress.
- Inspect entry and exit behavior for dialogs, menus, and notifications, including focus behavior and dismissal.

Timing values are design choices, not universal thresholds. Match the product's existing motion system.
