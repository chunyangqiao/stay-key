# Stay Key

English | [简体中文](README.zh-CN.md)

Stay Key is a local-first password vault for Chrome. It lives in the browser side panel and keeps website accounts and passwords on this computer only — no account, no cloud sync, and no telemetry.

The extension UI is currently Simplified Chinese.

## Features

- **Side panel vault** — open the vault beside the page with the toolbar icon or `Ctrl+Shift+Y` (`Command+Shift+Y` on macOS).
- **Current-site view** — Stay Key reads the active tab's host and lists matching entries, including parent and subdomain matches. When nothing is saved yet, you can create an entry pre-filled with that host.
- **Fuzzy search** — search by host, username, or tag; results are sorted by host.
- **Entry management** — create, edit, and delete entries with a host, username, password, and tags.
- **Masked lists** — usernames are partially masked and passwords are never rendered in list views.
- **One-click copy** — copy an account or password from any entry. The clipboard is cleared after 30 seconds by default (15, 30, or 60 seconds available) if the copied value is still there.
- **Two unlock paths** — a 6-digit numeric master PIN, or the recovery question and answer you write during setup. Recovering with the answer asks you to set a new PIN.
- **Throttled guessing** — five failed attempts against the PIN or the recovery answer triggers a 30-minute cooldown for that secret.
- **Automatic locking** — the vault locks after 1, 2, 5, 15, or 30 minutes of inactivity (2 minutes by default), and an OS screen lock clears the session immediately.
- **Themes** — light, dark, or follow the system.

On first launch, Stay Key walks you through setting a 6-digit PIN and a recovery question, then creates the encrypted vault.

## Security model

Stay Key aims to be small enough to review and to keep secrets off the network. It is not a replacement for a hardware-backed password manager, and the limits below are part of the design.

### Encryption

- The vault is one `stay-key.vault` record in `chrome.storage.local`. Entry data is encrypted; the salts, recovery question, failure counters, and settings are stored alongside it in the same record.
- A random AES-256-GCM data encryption key (DEK) encrypts the entry payload.
- The DEK is wrapped twice, once for each unlock path:
  - a key encryption key (KEK) derived from the 6-digit master PIN using PBKDF2-SHA-256 with 600,000 iterations and a random 16-byte salt;
  - a second KEK derived the same way from the recovery answer, with its own random salt.
- AES-GCM uses a random 12-byte IV for each encryption.
- The manifest requests no host permissions, and the extension loads no remote code.

### Unlocked session

- A successful unlock keeps the raw DEK in `chrome.storage.session`, which Chrome holds in memory and clears when the browser shuts down.
- The session is cleared on manual lock, on the inactivity timeout, and when the OS reports the screen is locked.
- A service worker alarm checks idle time on a short periodic schedule (30 seconds where Chrome allows it), so the timer keeps running when the side panel is collapsed.

### Limitations

- **A 6-digit PIN is low entropy.** There are only 10^6 possible PINs. PBKDF2 with 600,000 iterations makes each guess expensive, but an attacker who copies your Chrome profile can still attack the PIN offline. Treat the recovery answer as a second key and choose one with real entropy.
- **Local compromise is out of scope.** Malware, a malicious extension with access to the browser profile, or anyone using an unlocked session can read the vault.
- **Clipboard clearing is best effort.** Another clipboard tool may capture the value first, and Chrome blocks clipboard access in some situations.
- **No independent audit.** Stay Key is a personal project. Review the source before trusting it with valuable accounts.
- **No backup yet.** Removing the extension removes its local storage, and there is no import or export.

## Getting started

### Requirements

- Node.js 22.12 or newer
- pnpm 12.15.0 (declared in `packageManager`)
- Google Chrome 114 or newer (Side Panel API)

### Install dependencies

```bash
pnpm install
```

### Develop

```bash
pnpm dev
```

Load the extension:

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Choose **Load unpacked** and select the `dist/` folder.
4. Click the Stay Key toolbar icon or press `Ctrl+Shift+Y` (`Command+Shift+Y` on macOS).

CRXJS serves the side panel from the Vite dev server and rebuilds the extension as you edit. Reload the extension from `chrome://extensions` after changes to the manifest or background worker.

### Build

```bash
pnpm build
```

The production build is written to `dist/`, and `vite-plugin-zip-pack` also creates `release/stay-key-<version>.zip`.

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start Vite and CRXJS in development mode |
| `pnpm build` | Type-check with `tsc -b`, build to `dist/`, and zip to `release/` |
| `pnpm lint` | Run `oxlint` and check formatting with `oxfmt --check` on `src/` |
| `pnpm lint:fix` | Apply `oxlint --fix` and `oxfmt --write` to `src/` |
| `pnpm fmt` | Format `src/` with `oxfmt` |
| `pnpm fmt:check` | Check `src/` formatting |

## Project structure

```text
.
├── manifest.config.ts    Manifest V3 definition
├── public/               Extension icons
├── src/
│   ├── background/       Service worker: idle alarm and OS lock handling
│   ├── sidepanel/        React side panel (screens, components, hooks)
│   ├── shared/           Crypto, vault, storage, session, search, clipboard
│   ├── components/ui/    UI primitives
│   ├── lib/              Small shared utilities
│   ├── index.css         Tailwind CSS entry
│   └── main.tsx          Side panel entry
└── docs/                 Engineering and agent documentation
```

`@/` resolves to `src/` in the TypeScript and Vite configs.

## Permissions

| Permission | Why Stay Key needs it |
| --- | --- |
| `sidePanel` | Render the vault in Chrome's side panel |
| `storage` | Store the encrypted vault in `storage.local` and the unlock session in `storage.session` |
| `alarms` | Run the idle-lock check from the service worker on a short periodic alarm |
| `tabs` | Read the active tab's host for the current-site view |
| `idle` | Clear the unlock session when the OS screen is locked |

There are no `host_permissions`, no content scripts, and no remotely hosted code.

## Not implemented yet

- Browser autofill
- Cloud or cross-device sync
- Import and export
- Password generation
- Interface languages other than Simplified Chinese

## Contributing

- Report bugs and request features in [GitHub Issues](https://github.com/chunyangqiao/stay-key/issues).
- Before committing, run `pnpm fmt` and `pnpm lint`.
- Follow [Conventional Commits](https://www.conventionalcommits.org/).
- Update both READMEs when behavior changes.
- See [AGENTS.md](AGENTS.md) and [docs/engineering/coding-conventions.md](docs/engineering/coding-conventions.md) for repository conventions.

## License

MIT. The license is declared in `package.json`.
