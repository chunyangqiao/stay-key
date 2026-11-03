import type { VaultEntry } from "../vault/vault-types";

export const ENTRY_FILE_NAME = "stay-key-entries.json";
const ENTRY_FILE_VERSION = 1;

export const EXPORT_WARNING = "导出的文件包含明文密码。保存之后，锁定保险库不会加密这份文件。";

type EntryFileIssue = "invalid-json" | "unsupported-version" | "missing-fields" | "bad-tags";

type ParsedEntry = {
  host: string;
  username: string;
  password: string;
  tags: string[];
};

type ParseEntryFileResult =
  | { ok: true; entries: ParsedEntry[] }
  | { ok: false; issue: EntryFileIssue };

export type ImportPlan = {
  added: number;
  skipped: number;
  entries: VaultEntry[];
};

export function entryFileIssueMessage(issue: EntryFileIssue): string {
  switch (issue) {
    case "invalid-json":
      return "不是合法的 JSON";
    case "unsupported-version":
      return "版本不受支持";
    case "missing-fields":
      return "有条目缺少站点、账号或密码";
    case "bad-tags":
      return "标签格式不对";
  }
}

export function importConfirmMessage(added: number, skipped: number): string {
  return `将新增 ${added} 条条目，跳过 ${skipped} 条完全相同的条目。不会覆盖或删除已有条目。`;
}

export function importSuccessMessage(added: number, skipped: number): string {
  return `已新增 ${added} 条，跳过 ${skipped} 条。`;
}

export function importNoNewMessage(skipped: number): string {
  if (skipped === 0) {
    return "没有新条目。";
  }
  return `没有新条目，已跳过 ${skipped} 条。`;
}

export function serializeEntryFile(entries: readonly VaultEntry[]): string {
  const file = {
    version: ENTRY_FILE_VERSION,
    entries: entries
      .filter((entry) => !isBlankEntry(entry.host, entry.username, entry.password))
      .map((entry) => ({
        host: entry.host,
        username: entry.username,
        password: entry.password,
        tags: entry.tags,
      })),
  };
  return `${JSON.stringify(file, null, 2)}\n`;
}

export function parseEntryFile(raw: string): ParseEntryFileResult {
  const text = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, issue: "invalid-json" };
  }

  if (!isRecord(parsed)) {
    return { ok: false, issue: "invalid-json" };
  }
  if (parsed.version !== ENTRY_FILE_VERSION) {
    return { ok: false, issue: "unsupported-version" };
  }
  if (!Array.isArray(parsed.entries)) {
    return { ok: false, issue: "invalid-json" };
  }

  const entries: ParsedEntry[] = [];
  for (const item of parsed.entries) {
    const parsedEntry = parseEntry(item);
    if (!parsedEntry.ok) {
      return parsedEntry;
    }
    if (!parsedEntry.entry) {
      continue;
    }
    entries.push(parsedEntry.entry);
  }
  return { ok: true, entries };
}

export function planImport(
  existing: readonly VaultEntry[],
  incoming: readonly ParsedEntry[],
  now: string,
  createId: () => string,
): ImportPlan {
  const seen = new Set<string>();
  for (const entry of existing) {
    seen.add(entryIdentity(entry));
  }

  const entries = [...existing];
  let added = 0;
  let skipped = 0;
  for (const entry of incoming) {
    const key = entryIdentity(entry);
    if (seen.has(key)) {
      skipped += 1;
      continue;
    }
    seen.add(key);
    added += 1;
    entries.push({
      id: createId(),
      host: entry.host,
      username: entry.username,
      password: entry.password,
      tags: entry.tags,
      updatedAt: now,
    });
  }

  return { added, skipped, entries };
}

function parseEntry(
  value: unknown,
): { ok: true; entry: ParsedEntry | undefined } | { ok: false; issue: EntryFileIssue } {
  if (!isRecord(value)) {
    return { ok: false, issue: "missing-fields" };
  }

  const host = value.host;
  const username = value.username;
  const password = value.password;
  if (typeof host !== "string" || typeof username !== "string" || typeof password !== "string") {
    return { ok: false, issue: "missing-fields" };
  }

  if (isBlankEntry(host, username, password)) {
    return { ok: true, entry: undefined };
  }

  if ("tags" in value && value.tags !== undefined) {
    const tags = readTags(value.tags);
    if (!tags) {
      return { ok: false, issue: "bad-tags" };
    }
    return {
      ok: true,
      entry: { host, username, password, tags },
    };
  }

  return {
    ok: true,
    entry: { host, username, password, tags: [] },
  };
}

function readTags(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const tags: string[] = [];
  for (const tag of value) {
    if (typeof tag !== "string") {
      return undefined;
    }
    tags.push(tag);
  }
  return tags;
}

function isBlankEntry(host: string, username: string, password: string): boolean {
  return host.length === 0 && username.length === 0 && password.length === 0;
}

function entryIdentity(entry: ParsedEntry): string {
  return JSON.stringify([entry.host, entry.username, entry.password, entry.tags]);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
