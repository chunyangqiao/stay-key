export const IDLE_LOCK_OPTIONS_MS = [
  { value: 1 * 60 * 1000, label: "1 分钟" },
  { value: 2 * 60 * 1000, label: "2 分钟（默认）" },
  { value: 5 * 60 * 1000, label: "5 分钟" },
  { value: 15 * 60 * 1000, label: "15 分钟" },
  { value: 30 * 60 * 1000, label: "30 分钟" },
] as const;

export const CLIPBOARD_CLEAR_OPTIONS_MS = [
  { value: 15 * 1000, label: "15 秒" },
  { value: 30 * 1000, label: "30 秒（默认）" },
  { value: 60 * 1000, label: "60 秒" },
] as const;

export const THEME_OPTIONS = [
  { value: "light", label: "浅色" },
  { value: "dark", label: "深色" },
  { value: "system", label: "跟随系统" },
] as const;

export type ThemePreference = (typeof THEME_OPTIONS)[number]["value"];

/** Placeholder until Product provides a real Issues URL. */
export const GITHUB_ISSUES_URL: string | undefined =
  "https://github.com/chunyangqiao/stay-key/issues";
