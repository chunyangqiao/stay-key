# Interaction and component states

Design controls for their full interaction, not only the resting screenshot. Reuse the project's primitives and state conventions.

For each relevant component, inspect default, hover, focus-visible, pressed, selected, disabled, and validation states. Add loading, empty, success, or error states where the workflow uses them. Keep state changes perceivable without color alone; keep focus visible; and make controls' accessible names and labels clear.

For forms, associate visible labels with controls and keep instructions and errors available when the user needs them. Placeholder text can provide an example or format hint but should not carry the only label. Group related fields with spacing and layout that make their relationship clear.

For menus, dialogs, and popovers, verify keyboard entry/exit, focus placement and return, dismissal, and overlap with surrounding content. A screenshot cannot establish these behaviors; exercise the control in the running app when possible.
