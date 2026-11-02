import { defineManifest } from "@crxjs/vite-plugin";

import pkg from "./package.json" with { type: "json" };

const CHROME_VERSION_PART_MAX = 65536;

const EXTENSION_VERSION_PATTERN =
  /^(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)(?:-[0-9A-Za-z-]+\.(?<prerelease>0|[1-9]\d*))?$/;

function chromeExtensionVersion(semver: string): string {
  const match = EXTENSION_VERSION_PATTERN.exec(semver);
  if (!match?.groups) {
    throw new Error(`Unsupported extension version: ${semver}`);
  }

  const parts = [
    Number(match.groups.major),
    Number(match.groups.minor),
    Number(match.groups.patch),
  ];
  if (match.groups.prerelease !== undefined) {
    parts.push(Number(match.groups.prerelease) + 1);
  }
  if (parts.some((part) => part > CHROME_VERSION_PART_MAX)) {
    throw new Error(`Unsupported extension version: ${semver}`);
  }

  return parts.join(".");
}

export default defineManifest({
  manifest_version: 3,
  name: "Stay Key",
  description: pkg.description,
  version: chromeExtensionVersion(pkg.version),
  version_name: pkg.version,
  icons: {
    "16": "icon16.png",
    "32": "icon32.png",
    "48": "icon48.png",
    "128": "icon128.png",
  },
  action: {
    default_title: "Stay Key",
    default_icon: {
      "16": "icon16.png",
      "32": "icon32.png",
      "48": "icon48.png",
      "128": "icon128.png",
    },
  },
  side_panel: {
    default_path: "src/sidepanel/index.html",
  },
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  permissions: ["sidePanel", "storage", "alarms", "tabs", "idle"],
  commands: {
    _execute_action: {
      suggested_key: {
        default: "Ctrl+Shift+Y",
        mac: "Command+Shift+Y",
      },
      description: "打开 Stay Key",
    },
  },
});
