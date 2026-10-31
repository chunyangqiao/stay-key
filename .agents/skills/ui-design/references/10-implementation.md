# Implementation: Tailwind entry and shadcn components

Edit the Tailwind CSS entry and the shadcn components the user names. Apply the design references to those files. Confirm the entry is Tailwind CSS v4 before writing.

## Paths

The user supplies both:

- The Tailwind CSS entry, the stylesheet that contains `@import "tailwindcss"` or `@theme`.
- The base component directory that holds the project's shadcn components.

When either path is missing, ask and leave the project unchanged. Read the entry's variables, names, and color format. Read each component the task will change, including its props and variant API.

## Tailwind v4

Tailwind v4 is CSS-first. Integrate theme variables through the existing stylesheet and use `@theme inline` where semantic theme variables map to CSS variables. Write into the entry the user named, and leave the project's Tailwind major version and any existing config file as they are. Existing colors and component tokens remain the source of truth.

For example, a semantic runtime variable can expose a Tailwind color utility like this:

```css
@theme inline {
  --color-background: var(--ui-color-background);
  --color-primary: var(--ui-color-primary);
  --color-primary-foreground: var(--ui-color-primary-foreground);
}
```

The namespace is significant: `--color-primary` creates color utilities such as `bg-primary` and `text-primary`. Keep mappings consistent with the project's actual runtime variables. Use the names already in the entry. The example above is a shape, not a vocabulary to copy over an existing theme.

Write the agreed semantic roles into this entry. Map them through its existing variables and `@theme inline` block. Add a role only when the requested design needs it; see [color roles](05-color.md), including missing-role handling. Token work is done when those roles are in this file and the previous names and color format are still there.

## shadcn components

Adjust components in the named directory so color and state use the project's semantic roles. Keep each component's existing props, variants, and behavior. When a primitive already styles hover, keep that behavior. Add a `primary-hover` color token only when the component has no hover styling of its own. Match the local component contract, including the names it already exports.

In React server-component frameworks, keep interactive components on their existing client boundary. Adapt imports to the app's aliases. The directory the user named is where those components live.

Component work is done when the edited components reference those semantic roles and their public props are unchanged.
