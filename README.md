<p align="center">
  <img src="public/icon128.png" alt="Stay Key" width="96" />
</p>

# Stay Key

English | [简体中文](README.zh-CN.md)

Stay Key is a local-first password vault for Chrome. It lives in the browser side panel and keeps website accounts and passwords on this computer only — no account, no cloud sync, and no telemetry.

The extension UI is currently Simplified Chinese.

## Features

- **Side panel** — open the vault beside the page from the toolbar icon, or with `Ctrl+Shift+Y` (`Command+Shift+Y` on macOS).
- **Current site** — list entries that match the active tab, including parent domains and subdomains. When nothing is saved yet, create an entry pre-filled with that host.
- **Search** — find entries by host, username, or tag.
- **Entries** — create, edit, and delete entries with a host, username, password, and tags.
- **Masked lists** — usernames are partially masked, and passwords stay out of list views.
- **Copy** — copy an account or password. Stay Key clears the clipboard after a short delay if that value is still there. You can choose 15, 30, or 60 seconds; the default is 30.
- **Unlock** — a 6-digit master PIN, or the recovery question and answer you write during setup. Using the answer asks you to set a new PIN.
- **Cooldown** — too many failed attempts on the PIN or the recovery answer pauses further tries for a while.
- **Automatic lock** — the vault locks after a stretch of inactivity. You can choose from 1 to 30 minutes; the default is 2. Locking the screen ends the session immediately.
- **Themes** — light, dark, or follow the system.

On first launch, Stay Key asks you to set a 6-digit PIN and a recovery question, then creates the encrypted vault.

## Security

The vault stays on this computer and is encrypted. A 6-digit PIN is a short secret, so choose a recovery answer that is hard to guess. Stay Key does not defend against malware on this machine, or against someone who already has an unlocked session. Clearing the clipboard is best effort. The project has not had an independent audit. Removing the extension deletes its data, and there is no import or export yet.

## Getting started

Requirements: Node.js 22.12 or newer, pnpm 12.15.0, and Google Chrome 114 or newer.

```bash
pnpm install
pnpm dev
```

Open `chrome://extensions`, turn on **Developer mode**, choose **Load unpacked**, and select `dist/`. Open Stay Key from the toolbar icon, or press `Ctrl+Shift+Y` (`Command+Shift+Y` on macOS).

```bash
pnpm build
```

The production build is written to `dist/`, and a zip archive is written to `release/`.

`pnpm lint` checks `src/`. `pnpm fmt` formats it.

## Not yet

- Browser autofill
- Cloud or cross-device sync
- Import and export
- Password generation
- Interface languages other than Simplified Chinese

## Contributing

Report bugs and request features in [GitHub Issues](https://github.com/chunyangqiao/stay-key/issues). Before committing, run `pnpm fmt` and `pnpm lint`.

## License

MIT. The license is declared in `package.json`.
