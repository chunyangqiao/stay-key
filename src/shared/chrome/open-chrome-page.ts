export async function openChromeShortcutsPage(): Promise<"opened" | "fallback"> {
  try {
    await chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
    return "opened";
  } catch {
    return "fallback";
  }
}

export async function openExternalUrl(url: string): Promise<void> {
  await chrome.tabs.create({ url });
}

export async function readActionShortcut(): Promise<string | undefined> {
  try {
    const commands = await chrome.commands.getAll();
    const action = commands.find(
      (command) => command.name === "_execute_action" || command.name === "_execute_browser_action",
    );
    const shortcut = action?.shortcut?.trim();
    return shortcut || undefined;
  } catch {
    return undefined;
  }
}
