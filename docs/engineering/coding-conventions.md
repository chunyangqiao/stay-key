# Coding Conventions

## Naming

Use lowercase file names. Separate words with hyphens (`kebab-case`).

- Prefer: `messages.tsx`, `user-menu.tsx`, `use-messages.ts`.
- Avoid: `Messages.tsx`, `userMenu.tsx`, `user_menu.tsx`.

Use kebab-case for TypeScript, TSX, and CSS.

Use `PascalCase` for a React component, class, enum, enum member, or type
name. The component `Messages` lives in `messages.tsx`. Write an enum member
in `PascalCase`, such as `ExportState.Running`.

Use `camelCase` for a function, method, property, or local variable, such as
`getMessages`, `isVisible`, and `setIsVisible`.

Name a hook `useX` and its file `use-x.ts`, such as `useMessages` in
`use-messages.ts`.

Use `UPPER_SNAKE_CASE` for a module-level primitive constant whose value is
fixed, such as `const MAX_EXPORT_ATTEMPTS = 5`. Keep a local binding in
`camelCase`.

A name states what the value is for. Use a whole word, omit a redundant
qualifier, and avoid an obscure abbreviation.

- Prefer `messages` over `messageList` for a collection of messages.
- Prefer `messages.tsx` over `message-list.tsx` for a file that renders a
  collection of messages.
- Use a short action name for a function, such as `getMessages` and
  `sendMessage`.
- When a name would collide with a reserved word, choose another name, such
  as `className`.
- Add a qualifier to distinguish meaning, such as `unreadMessages` and
  `archived-messages.tsx`.

`message-list` is a valid file name. It is not a valid JavaScript or
TypeScript identifier.

## React

Import React as a namespace when the file uses a `React.*` value or type.
Read hooks and types from that namespace, such as `React.useEffect`,
`React.useState`, and `React.ReactNode`. Do not import those members by name.

`jsx` is `react-jsx`. A file that only contains JSX does not import React.

```tsx
import * as React from "react";

type MessagesProps = {
  children: React.ReactNode;
};

export function Messages({ children }: MessagesProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  return (
    <section>
      <button onClick={() => setIsVisible((visible) => !visible)}>Toggle messages</button>
      {isVisible && children}
    </section>
  );
}
```

```tsx
export function Home() {
  return <h1>Stay Key</h1>;
}
```

## Imports

Separate import groups with a blank line. Use `import type` for a binding
used only as a type, and put that group last. Read a React type from the
namespace, such as `React.ReactNode`, instead of adding a type import.

This repository has no TypeScript path aliases. Import a project file with a
relative path.

The paths below are illustrative. They only show how groups are separated.

In popup, sidepanel, content script, and background:

1. `react` and `react-dom`.
2. Other third-party packages.
3. Project files.
4. Type-only imports.

```tsx
import * as React from "react";
import { createPortal } from "react-dom";

import { MessageCircle } from "lucide-react";

import { Message } from "./message";

import type { MessageData } from "./types";
```

## Types

Export a declaration only when another module imports it. Do not add a name
to the global scope.

Do not use `any`. Use `unknown` only for a value that has just crossed a
trust boundary, then narrow it.

Represent an absent value with `undefined`. Use `null` when a DOM API returns
`null`, when a component renders nothing, or when an external contract
requires `null`.

## Functions

Declare a top-level function with `function`, and export it as
`export function Popup()`. Do not export an arrow function from a `const`.
The declaration name shows up in a stack trace.

Write a callback as an arrow function. Use `async` and `await` instead of
chaining `Promise.then`.

Use `const` for a binding that is not reassigned and `let` for one that is.
Do not use `var`.

Build a string with a template literal.

Put the body of `if`, `else`, `for`, and `while` in curly braces.

When a function produces no value, exit with `return`, including an early
exit. When it produces a value and has nothing to give, return `undefined`,
unless that absence is `null` for a reason listed under Types.

## General

Use a helper that already exists before adding a second implementation.
Import each module once.

Prefer a named capture group in a regular expression.

Do not use `bind`, `call`, or `apply` to set `this` or to prefill arguments.
Capture the surrounding values with an arrow function or a closure.

## Comments

Write JSDoc on an exported function, type, or class only when the signature
cannot express a constraint the caller must follow. Skip a comment that
repeats the signature.
