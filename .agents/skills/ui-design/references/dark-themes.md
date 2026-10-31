# Dark themes

Dark themes need deliberate surface, text, and state relationships. Avoid mechanically inverting light-theme values. Use the project's existing semantic roles and verify actual combinations.

- Separate page, card, and overlay surfaces with controlled lightness, hue, or border cues. Pure black and pure white are options only when they fit the visual direction and remain comfortable in use.
- Recheck muted text, links, status colors, disabled controls, shadows, and focus rings. Light-theme values may have insufficient or excessive contrast on dark surfaces.
- Keep elevation meaningful; surface contrast may communicate layering better than dark shadows.
- Ensure theme changes preserve state meaning and do not rely on color alone.
- Test the actual light and dark rendering, including hover, selected, error, and keyboard-focus states.

For new systems, declare dark semantic overrides in `modes.dark.color`; use [the design-system reference](09-design-system.md). Do not add a dark theme unless requested or already part of the product scope.
