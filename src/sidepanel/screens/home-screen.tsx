import * as React from "react";
import { Settings } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readActiveTabHost } from "@/shared/active-tab";
import { copySecret } from "@/shared/clipboard";
import { maskAccount } from "@/shared/mask";
import { DEFAULT_CLIPBOARD_CLEAR_MS } from "@/shared/constants";
import { createEntryId, parseTags, searchEntries } from "@/shared/entries";
import { useSessionStore } from "@/shared/session-store";
import { saveVaultPayload } from "@/shared/vault";

import type { VaultEntry } from "@/shared/vault-types";

type EditorMode = { kind: "closed" } | { kind: "create" } | { kind: "edit"; entry: VaultEntry };

type Draft = {
  host: string;
  username: string;
  password: string;
  tags: string;
};

const emptyDraft = (): Draft => ({
  host: "",
  username: "",
  password: "",
  tags: "",
});

export function HomeScreen() {
  const lock = useSessionStore((state) => state.lock);
  const setScreen = useSessionStore((state) => state.setScreen);
  const payload = useSessionStore((state) => state.payload);
  const vault = useSessionStore((state) => state.vault);
  const dek = useSessionStore((state) => state.dek);
  const applyPayload = useSessionStore((state) => state.applyPayload);

  const [query, setQuery] = React.useState("");
  const [editor, setEditor] = React.useState<EditorMode>({ kind: "closed" });
  const [draft, setDraft] = React.useState<Draft>(emptyDraft);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();
  const [activeHost, setActiveHost] = React.useState<string | undefined>();

  React.useEffect(() => {
    void (async () => {
      setActiveHost(await readActiveTabHost());
    })();
  }, []);

  const entries = payload?.entries ?? [];
  const visible = React.useMemo(() => {
    const matched = searchEntries(entries, query);
    if (!activeHost) {
      return matched;
    }
    return [...matched].sort((a, b) => {
      const aHit = a.host === activeHost || a.host.endsWith(`.${activeHost}`) ? 0 : 1;
      const bHit = b.host === activeHost || b.host.endsWith(`.${activeHost}`) ? 0 : 1;
      return aHit - bHit;
    });
  }, [entries, query, activeHost]);
  const clipboardClearMs = vault?.settings.clipboardClearMs ?? DEFAULT_CLIPBOARD_CLEAR_MS;

  const openCreate = () => {
    setDraft(emptyDraft());
    setError(undefined);
    setEditor({ kind: "create" });
    void (async () => {
      const host = await readActiveTabHost();
      if (!host) {
        return;
      }
      setDraft((prev) => (prev.host.trim() ? prev : { ...prev, host }));
    })();
  };

  const openEdit = (entry: VaultEntry) => {
    setDraft({
      host: entry.host,
      username: entry.username,
      password: entry.password,
      tags: entry.tags.join(", "),
    });
    setError(undefined);
    setEditor({ kind: "edit", entry });
  };

  const closeEditor = () => {
    setEditor({ kind: "closed" });
    setError(undefined);
  };

  const persist = async (nextEntries: VaultEntry[]) => {
    if (!dek || !vault) {
      throw new Error("会话未解锁");
    }
    const nextPayload = { entries: nextEntries };
    const nextVault = await saveVaultPayload(dek, vault, nextPayload);
    applyPayload(nextPayload, nextVault);
  };

  const onSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const host = draft.host.trim();
    const username = draft.username.trim();
    const password = draft.password;
    if (!host || !username || !password) {
      setError("站点、账号和密码都要填。");
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      const tags = parseTags(draft.tags);
      const updatedAt = new Date().toISOString();
      let nextEntries: VaultEntry[];
      if (editor.kind === "edit") {
        nextEntries = entries.map((entry) =>
          entry.id === editor.entry.id
            ? { ...entry, host, username, password, tags, updatedAt }
            : entry,
        );
      } else {
        nextEntries = [
          ...entries,
          {
            id: createEntryId(),
            host,
            username,
            password,
            tags,
            updatedAt,
          },
        ];
      }
      await persist(nextEntries);
      toast.message(editor.kind === "edit" ? "已更新" : "已保存");
      closeEditor();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (editor.kind !== "edit") {
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      await persist(entries.filter((entry) => entry.id !== editor.entry.id));
      toast.message("已删除");
      closeEditor();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "删除失败");
    } finally {
      setSaving(false);
    }
  };

  const onCopy = async (label: string, value: string) => {
    try {
      await copySecret(value, clipboardClearMs);
      toast.message(`已复制${label}，约 ${Math.round(clipboardClearMs / 1000)} 秒后清除`);
    } catch {
      toast.message("复制失败，请再试一次");
    }
  };

  if (editor.kind !== "closed") {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-semibold text-foreground">
            {editor.kind === "edit" ? "编辑条目" : "新建条目"}
          </h1>
          <Button variant="ghost" size="sm" type="button" onClick={closeEditor}>
            返回
          </Button>
        </div>
        <form className="flex flex-col gap-3" onSubmit={(event) => void onSave(event)}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="entry-host">站点 / 主机</Label>
            <Input
              id="entry-host"
              value={draft.host}
              onChange={(event) => setDraft((prev) => ({ ...prev, host: event.target.value }))}
              placeholder="example.com"
              autoComplete="off"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="entry-username">账号</Label>
            <Input
              id="entry-username"
              value={draft.username}
              onChange={(event) => setDraft((prev) => ({ ...prev, username: event.target.value }))}
              autoComplete="username"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="entry-password">密码</Label>
            <Input
              id="entry-password"
              type="password"
              value={draft.password}
              onChange={(event) => setDraft((prev) => ({ ...prev, password: event.target.value }))}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="entry-tags">标签（可选）</Label>
            <Input
              id="entry-tags"
              value={draft.tags}
              onChange={(event) => setDraft((prev) => ({ ...prev, tags: event.target.value }))}
              placeholder="工作, 邮箱"
              autoComplete="off"
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={saving}>
            {saving ? "保存中…" : "保存"}
          </Button>
          {editor.kind === "edit" ? (
            <Button
              type="button"
              variant="destructive"
              disabled={saving}
              onClick={() => void onDelete()}
            >
              删除
            </Button>
          ) : null}
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-foreground">Stay Key</h1>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="设置"
            onClick={() => setScreen("settings")}
          >
            <Settings />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => void lock()}>
            锁定
          </Button>
        </div>
      </div>
      <div className="flex gap-2">
        <Input
          type="search"
          placeholder="搜索账号或站点"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="flex-1"
        />
        <Button type="button" onClick={openCreate}>
          新建
        </Button>
      </div>
      {visible.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          {entries.length === 0 ? "暂无条目。点「新建」保存第一条。" : "没有匹配的条目。"}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((entry) => (
            <li key={entry.id} className="rounded-xl border border-border bg-card p-3">
              <button type="button" className="w-full text-left" onClick={() => openEdit(entry)}>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{entry.host}</p>
                  {activeHost &&
                  (entry.host === activeHost || entry.host.endsWith(`.${activeHost}`)) ? (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[0.75rem] font-medium text-secondary-foreground">
                      当前站
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">{maskAccount(entry.username)}</p>
              </button>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => void onCopy("账号", entry.username)}
                >
                  复制账号
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => void onCopy("密码", entry.password)}
                >
                  复制密码
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => openEdit(entry)}>
                  编辑
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">
        复制后约 {Math.round(clipboardClearMs / 1000)} 秒清空剪贴板
      </p>
    </div>
  );
}
