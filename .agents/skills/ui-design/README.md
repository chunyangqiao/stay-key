# UI Design

Author a DESIGN.md design system, design Tailwind CSS v4 tokens, and adjust existing shadcn components in the user's project. Decisions follow the design references. The design-system document follows the DESIGN.md spec. Code edits land in the Tailwind CSS entry and the base component directory the user names.

## Includes

- A DESIGN.md document: YAML tokens plus the spec's markdown sections. See [the format](references/design-md.md).
- Guidance for hierarchy, layout, typography, color, depth, imagery, and finishing.
- Optional references for accessibility, interactions, dark themes, motion, and data visualization.
- A design-system CLI for a standalone token package when the user asks for one.

The named project files stay authoritative. CLI runtime requires Node.js 22 or newer and uses built-in modules only.

Start with [SKILL.md](SKILL.md). See [design-system commands](references/09-design-system.md), [implementation](references/10-implementation.md), and [audit guidance](references/11-audit.md). User-facing deliverables should follow the user's language.
