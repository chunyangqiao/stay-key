import * as React from "react";
import { Copy, Inbox, KeyRound, Pencil, Search, Settings } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readActiveTabHost, readActiveTabInfo, type ActiveTabInfo } from "@/shared/active-tab";
import { copySecret } from "@/shared/clipboard";
import { DEFAULT_CLIPBOARD_CLEAR_MS } from "@/shared/constants";
import { createEntryId, parseTags, searchEntries } from "@/shared/entries";
import { filterEntriesForHost } from "@/shared/host-match";
import { maskAccount } from "@/shared/mask";
import { useSessionStore } from "@/shared/session-store";
import { saveVaultPayload } from "@/shared/vault";

import { BrandHeader, AppHeader } from "../components/app-header";
import { Screen, ScreenBody, ScreenFooter } from "../components/screen";

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
  const [tabInfo, setTabInfo] = React.useState<ActiveTabInfo | undefined>();

  const refreshTab = React.useCallback(() => {
    void (async () => {
      setTabInfo(await readActiveTabInfo());
    })();
  }, []);

  React.useEffect(() => {
    refreshTab();
    const onActivated = () => refreshTab();
    const onUpdated = (
      _tabId: number,
      changeInfo: { url?: string; status?: string },
      tab: { active?: boolean },
    ) => {
      if (changeInfo.url || changeInfo.status === "complete") {
        if (tab.active) {
          refreshTab();
        }
      }
    };
    chrome.tabs.onActivated.addListener(onActivated);
    chrome.tabs.onUpdated.addListener(onUpdated);
    return () => {
      chrome.tabs.onActivated.removeListener(onActivated);
      chrome.tabs.onUpdated.removeListener(onUpdated);
    };
  }, [refreshTab]);

  const entries = payload?.entries ?? [];
  const activeHost = tabInfo?.kind === "host" ? tabInfo.host : undefined;
  const siteEntries = React.useMemo(
    () => (activeHost ? filterEntriesForHost(entries, activeHost) : []),
    [entries, activeHost],
  );
  const visible = React.useMemo(() => searchEntries(entries, query), [entries, query]);
  const clipboardClearMs = vault?.settings.clipboardClearMs ?? DEFAULT_CLIPBOARD_CLEAR_MS;
  const openCreate = (prefillHost?: string) => {
    setDraft({ ...emptyDraft(), host: prefillHost ?? "" });
    setError(undefined);
    setEditor({ kind: "create" });
    if (!prefillHost) {
      void (async () => {
        const host = await readActiveTabHost();
        if (!host) {
          return;
        }
        setDraft((prev) => (prev.host.trim() ? prev : { ...prev, host }));
      })();
    }
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
      <Screen>
        <AppHeader title={editor.kind === "edit" ? "编辑条目" : "新建条目"} onBack={closeEditor} />
        <ScreenBody className="px-4 pt-5 pb-10">
          <form className="flex flex-col gap-4" onSubmit={(event) => void onSave(event)}>
            <div>
              <Label htmlFor="entry-host">站点 / 主机</Label>
              <Input
                className="mt-1.5"
                id="entry-host"
                value={draft.host}
                onChange={(event) => setDraft((prev) => ({ ...prev, host: event.target.value }))}
                placeholder="example.com"
                autoComplete="off"
                required
              />
            </div>
            <div>
              <Label htmlFor="entry-username">账号</Label>
              <Input
                className="mt-1.5"
                id="entry-username"
                value={draft.username}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, username: event.target.value }))
                }
                autoComplete="username"
                required
              />
            </div>
            <div>
              <Label htmlFor="entry-password">密码</Label>
              <Input
                className="mt-1.5"
                id="entry-password"
                type="password"
                value={draft.password}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, password: event.target.value }))
                }
                autoComplete="new-password"
                required
              />
            </div>
            <div>
              <Label htmlFor="entry-tags">标签（可选）</Label>
              <Input
                className="mt-1.5"
                id="entry-tags"
                value={draft.tags}
                onChange={(event) => setDraft((prev) => ({ ...prev, tags: event.target.value }))}
                placeholder="工作, 邮箱"
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="min-h-5 text-micro text-destructive">{error}</p>
              <Button type="submit" disabled={saving}>
                {saving ? "保存中…" : "保存"}
              </Button>
            </div>
          </form>

          {editor.kind === "edit" ? (
            <div className="mt-7 border-t border-border pt-4">
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                disabled={saving}
                onClick={() => void onDelete()}
              >
                删除
              </Button>
            </div>
          ) : null}
        </ScreenBody>
      </Screen>
    );
  }

  return (
    <Screen>
      <BrandHeader
        actions={
          <>
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
          </>
        }
      />

      {tabInfo === undefined ? null : tabInfo.kind === "none" ? (
        <div className="shrink-0 border-b border-border px-4 py-2.5">
          <p className="text-meta text-muted-foreground">当前页无站点</p>
        </div>
      ) : (
        <section aria-labelledby="current-site" className="shrink-0 border-b border-border bg-band">
          <div className="flex items-baseline justify-between gap-3 px-4 pt-3">
            <h2
              id="current-site"
              className="min-w-0 truncate text-lg font-semibold tracking-[-0.01em] text-foreground"
            >
              {tabInfo.host}
            </h2>
            <span className="shrink-0 text-micro text-muted-foreground">当前站点</span>
          </div>
          {siteEntries.length > 0 ? (
            <ul className="mt-1 pb-1">
              {siteEntries.map((entry) => (
                <li key={entry.id} className="flex items-center gap-1.5 px-4 py-1.5">
                  <button
                    type="button"
                    className="min-h-8 min-w-0 flex-1 truncate text-left text-meta text-foreground hover:underline"
                    onClick={() => openEdit(entry)}
                  >
                    {maskAccount(entry.username)}
                  </button>
                  <Button
                    type="button"
                    size="row"
                    variant="quiet"
                    onClick={() => void onCopy("账号", entry.username)}
                  >
                    复制账号
                  </Button>
                  <Button
                    type="button"
                    size="row"
                    variant="quiet"
                    onClick={() => void onCopy("密码", entry.password)}
                  >
                    复制密码
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-2.5">
              <p className="text-meta text-muted-foreground">暂无匹配条目</p>
            </div>
          )}
        </section>
      )}

      <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            aria-label="搜索账号或站点"
            placeholder="搜索账号或站点"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-8"
          />
        </div>
        <Button type="button" variant="secondary" onClick={() => openCreate()}>
          新建
        </Button>
      </div>

      <ScreenBody>
        <div className="flex items-baseline justify-between px-4 pt-4 pb-1.5">
          <h2 className="text-micro font-medium text-muted-foreground">全部条目</h2>
          <span className="text-micro tabular-nums text-muted-foreground">{entries.length} 条</span>
        </div>

        {visible.length === 0 ? (
          <Empty className="min-h-56 border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Inbox />
              </EmptyMedia>
              <EmptyTitle>{entries.length === 0 ? "保险库为空" : "没有匹配的条目"}</EmptyTitle>
              <EmptyDescription>
                {entries.length === 0 ? "点底部「保存密码」添加第一条" : "暂无匹配条目"}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul>
            {visible.map((entry) => (
              <li key={entry.id} className="border-b border-border/70">
                <div className="px-4 pt-2.5 pb-2">
                  <button
                    type="button"
                    className="flex min-h-8 w-full items-center text-left text-row font-medium text-foreground hover:underline"
                    onClick={() => openEdit(entry)}
                    title={entry.host}
                  >
                    <span className="min-w-0 truncate">{entry.host}</span>
                  </button>
                  <div className="mt-0.5 flex items-center gap-1">
                    <p className="min-w-0 flex-1 truncate text-meta text-muted-foreground">
                      {maskAccount(entry.username)}
                    </p>
                    <Button
                      type="button"
                      size="row"
                      variant="quiet"
                      onClick={() => void onCopy("账号", entry.username)}
                    >
                      <Copy />
                      复制账号
                    </Button>
                    <Button
                      type="button"
                      size="row"
                      variant="quiet"
                      onClick={() => void onCopy("密码", entry.password)}
                    >
                      <KeyRound />
                      复制密码
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="编辑"
                      onClick={() => openEdit(entry)}
                    >
                      <Pencil />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ScreenBody>

      <ScreenFooter className="justify-center border-t border-border px-4 py-3">
        <Button type="button" className="w-full" onClick={() => openCreate()}>
          保存密码
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
