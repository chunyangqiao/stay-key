import { describe, expect, it } from "vitest";

import { parseEntryFile, planImport, serializeEntryFile } from "../src/shared/entries/entry-file";

import type { VaultEntry } from "../src/shared/vault/vault-types";

function saved(
  overrides: Partial<VaultEntry> & Pick<VaultEntry, "host" | "username" | "password">,
): VaultEntry {
  return {
    id: overrides.id ?? "existing",
    host: overrides.host,
    username: overrides.username,
    password: overrides.password,
    tags: overrides.tags ?? [],
    updatedAt: overrides.updatedAt ?? "2020-01-01T00:00:00.000Z",
  };
}

function ids(): () => string {
  let next = 0;
  return () => {
    next += 1;
    return `new-${next}`;
  };
}

describe("serializeEntryFile", () => {
  it("writes version 1 entries in list order with a trailing newline", () => {
    const text = serializeEntryFile([
      saved({ id: "2", host: "b.example", username: "zoe", password: "b" }),
      saved({
        id: "1",
        host: "a.example",
        username: "amy",
        password: "a",
        tags: ["work"],
        updatedAt: "2024-01-01T00:00:00.000Z",
      }),
    ]);

    expect(text.endsWith("\n")).toBe(true);
    expect(JSON.parse(text)).toEqual({
      version: 1,
      entries: [
        { host: "b.example", username: "zoe", password: "b", tags: [] },
        { host: "a.example", username: "amy", password: "a", tags: ["work"] },
      ],
    });
    const first = JSON.parse(text).entries[0] as Record<string, unknown>;
    expect(Object.keys(first)).toEqual(["host", "username", "password", "tags"]);
    expect(text).not.toContain("existing");
    expect(text).not.toContain("2024-01-01");
  });

  it("keeps the stored host string", () => {
    const text = serializeEntryFile([
      saved({ host: "https://github.com/acme", username: "a", password: "p" }),
      saved({ host: "www.example.com", username: "a", password: "p" }),
    ]);
    const parsed = parseEntryFile(text);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      return;
    }
    expect(parsed.entries.map((entry) => entry.host)).toEqual([
      "https://github.com/acme",
      "www.example.com",
    ]);
  });
});

describe("parseEntryFile", () => {
  it("accepts a UTF-8 BOM and omitted tags", () => {
    const parsed = parseEntryFile(
      '\uFEFF{ "version": 1, "entries": [{ "host": " a.example ", "username": " amy ", "password": "  p  " }], "extra": true }',
    );
    expect(parsed).toEqual({
      ok: true,
      entries: [{ host: " a.example ", username: " amy ", password: "  p  ", tags: [] }],
    });
  });

  it("rejects a string version, bad tags, and empty secrets without keeping earlier rows", () => {
    expect(parseEntryFile('{ "version": "1", "entries": [] }')).toEqual({
      ok: false,
      issue: "unsupported-version",
    });
    expect(parseEntryFile("not json")).toEqual({ ok: false, issue: "invalid-json" });
    expect(parseEntryFile('{ "version": 1, "entries": { } }')).toEqual({
      ok: false,
      issue: "invalid-json",
    });
    expect(
      parseEntryFile(
        '{ "version": 1, "entries": [{ "host": "a.example", "username": "amy", "password": "p" }, { "host": "", "username": "amy", "password": "p" }] }',
      ),
    ).toEqual({ ok: false, issue: "missing-fields" });
    expect(
      parseEntryFile(
        '{ "version": 1, "entries": [{ "host": "a.example", "username": "amy", "password": "p", "tags": "work" }] }',
      ),
    ).toEqual({ ok: false, issue: "bad-tags" });
    expect(
      parseEntryFile(
        '{ "version": 1, "entries": [{ "host": "a.example", "username": "amy", "password": 1 }] }',
      ),
    ).toEqual({ ok: false, issue: "missing-fields" });
  });

  it("keeps tag strings and does not split on commas", () => {
    const parsed = parseEntryFile(
      '{ "version": 1, "entries": [{ "host": "a.example", "username": "amy", "password": " ", "tags": ["  ", "a, b", "work"] }] }',
    );
    expect(parsed).toEqual({
      ok: true,
      entries: [
        { host: "a.example", username: "amy", password: " ", tags: ["  ", "a, b", "work"] },
      ],
    });
  });
});

describe("planImport", () => {
  const now = "2026-11-02T00:00:00.000Z";

  it("appends a file entry that differs only by spaces and keeps the file's strings", () => {
    const existing = [
      saved({ host: "github.com", username: "Amy", password: "secret", tags: ["work"] }),
    ];
    const parsed = parseEntryFile(
      '{ "version": 1, "entries": [{ "host": " github.com ", "username": " Amy ", "password": "secret", "tags": [" work ", ""] }] }',
    );
    if (!parsed.ok) {
      throw new Error("expected a valid file");
    }

    const plan = planImport(existing, parsed.entries, now, ids());
    expect(plan.added).toBe(1);
    expect(plan.skipped).toBe(0);
    expect(plan.entries).toEqual([
      existing[0],
      {
        id: "new-1",
        host: " github.com ",
        username: " Amy ",
        password: "secret",
        tags: [" work ", ""],
        updatedAt: now,
      },
    ]);
  });

  it("appends a changed password or tag order and skips a later duplicate in the file", () => {
    const existing = [
      saved({ host: "github.com", username: "amy", password: "old", tags: ["a", "b"] }),
    ];
    const parsed = parseEntryFile(
      JSON.stringify({
        version: 1,
        entries: [
          { host: "github.com", username: "amy", password: "new", tags: ["b", "a"] },
          { host: "github.com", username: "amy", password: "new", tags: ["b", "a"] },
          { host: "gist.github.com", username: "amy", password: "new", tags: [] },
          { host: "www.example.com", username: "amy", password: "new", tags: [] },
        ],
      }),
    );
    if (!parsed.ok) {
      throw new Error("expected a valid file");
    }

    const plan = planImport(existing, parsed.entries, now, ids());
    expect(plan.added).toBe(3);
    expect(plan.skipped).toBe(1);
    expect(plan.entries.slice(1)).toEqual([
      {
        id: "new-1",
        host: "github.com",
        username: "amy",
        password: "new",
        tags: ["b", "a"],
        updatedAt: now,
      },
      {
        id: "new-2",
        host: "gist.github.com",
        username: "amy",
        password: "new",
        tags: [],
        updatedAt: now,
      },
      {
        id: "new-3",
        host: "www.example.com",
        username: "amy",
        password: "new",
        tags: [],
        updatedAt: now,
      },
    ]);
  });

  it("keeps entries that are absent from the file", () => {
    const existing = [saved({ host: "keep.example", username: "amy", password: "p" })];
    const plan = planImport(existing, [], now, ids());
    expect(plan).toEqual({ added: 0, skipped: 0, entries: existing });
  });
});
