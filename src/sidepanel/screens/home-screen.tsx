import * as React from "react";

import { useNavigate } from "react-router";
import {
  ArrowLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Globe,
  Inbox,
  KeyRound,
  Lock,
  Plus,
  Search,
  Settings,
  Tag,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/utils";
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
import {
  readActiveTabHost,
  readActiveTabInfo,
  type ActiveTabInfo,
} from "@/shared/chrome/active-tab";
import { copySecret } from "@/shared/chrome/clipboard";
import {
  DEFAULT_CLIPBOARD_CLEAR_MS,
  DEFAULT_CURRENT_SITE_SEGMENT_ENABLED,
  DEFAULT_LIST_MASK_ENABLED,
} from "@/shared/constants";
import { createEntryId, parseTags, searchEntries } from "@/shared/entries/entries";
import { filterEntriesForHost, hostsMatch } from "@/shared/entries/host-match";
import { maskAccount } from "@/shared/entries/mask";
import { useSessionStore } from "@/shared/session/session-store";
import { saveVaultPayload } from "@/shared/vault/vault";

import { BrandHeader } from "../components/app-header";
import { panelPaths } from "../paths";
import { EntryTags } from "../components/entry-tags";
import { Screen, ScreenBody, ScreenFooter } from "../components/screen";

import type { VaultEntry } from "@/shared/vault/vault-types";

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

type ListSegment = "all" | "current" | "other";

type SiteGroup = {
  hostKey: string;
  host: string;
  entries: VaultEntry[];
  tags: string[];
};

function aggregateByHost(entries: VaultEntry[]): SiteGroup[] {
  const map = new Map<string, SiteGroup>();
  for (const entry of entries) {
    const host = entry.host.trim();
    const hostKey = host.toLowerCase();
    if (!hostKey) {
      continue;
    }
    const existing = map.get(hostKey);
    if (existing) {
      existing.entries.push(entry);
      for (const tag of entry.tags) {
        if (!existing.tags.includes(tag)) {
          existing.tags.push(tag);
        }
      }
    } else {
      map.set(hostKey, {
        hostKey,
        host,
        entries: [entry],
        tags: [...entry.tags],
      });
    }
  }
  return [...map.values()].sort((a, b) => a.host.localeCompare(b.host, "zh-CN"));
}

function siteLetter(host: string): string {
  const ch = host.trim().charAt(0);
  return ch ? ch.toUpperCase() : "?";
}

export function HomeScreen() {
  const navigate = useNavigate();
  const lock = useSessionStore((state) => state.lock);
  const payload = useSessionStore((state) => state.payload);
  const vault = useSessionStore((state) => state.vault);
  const dek = useSessionStore((state) => state.dek);
  const applyPayload = useSessionStore((state) => state.applyPayload);

  const [query, setQuery] = React.useState("");
  const [editor, setEditor] = React.useState<EditorMode>({ kind: "closed" });
  const [draft, setDraft] = React.useState<Draft>(emptyDraft);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();
  const [showPassword, setShowPassword] = React.useState(false);
  const [listSegment, setListSegment] = React.useState<ListSegment>("all");
  const [expandedHostKey, setExpandedHostKey] = React.useState<string | undefined>();
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
  const hasCurrentSite = Boolean(activeHost);
  const searched = React.useMemo(() => searchEntries(entries, query), [entries, query]);
  const segmentCounts = React.useMemo(() => {
    const current = activeHost ? filterEntriesForHost(searched, activeHost).length : 0;
    return {
      all: searched.length,
      current,
      other: searched.length - current,
    };
  }, [searched, activeHost]);
  const visibleGroups = React.useMemo(() => {
    let scoped = searched;
    if (listSegment === "current") {
      scoped = activeHost ? filterEntriesForHost(searched, activeHost) : [];
    } else if (listSegment === "other") {
      scoped = activeHost
        ? searched.filter((entry) => !hostsMatch(entry.host, activeHost))
        : searched;
    }
    return aggregateByHost(scoped);
  }, [searched, listSegment, activeHost]);
  const clipboardClearMs = vault?.settings.clipboardClearMs ?? DEFAULT_CLIPBOARD_CLEAR_MS;
  const listMaskEnabled = vault?.settings.listMaskEnabled ?? DEFAULT_LIST_MASK_ENABLED;
  const currentSiteSegmentEnabled =
    vault?.settings.currentSiteSegmentEnabled ?? DEFAULT_CURRENT_SITE_SEGMENT_ENABLED;

  React.useEffect(() => {
    if (!currentSiteSegmentEnabled && listSegment === "current") {
      setListSegment("all");
      return;
    }
    if (listSegment === "current" && !hasCurrentSite) {
      setListSegment("all");
    }
  }, [listSegment, hasCurrentSite, currentSiteSegmentEnabled]);

  React.useEffect(() => {
    if (!expandedHostKey) {
      return;
    }
    const stillVisible = visibleGroups.some((group) => group.hostKey === expandedHostKey);
    if (!stillVisible) {
      setExpandedHostKey(undefined);
    }
  }, [visibleGroups, expandedHostKey]);

  const openCreate = (prefillHost?: string) => {
    setDraft({ ...emptyDraft(), host: prefillHost ?? "" });
    setError(undefined);
    setShowPassword(false);
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
    setShowPassword(false);
    setEditor({ kind: "edit", entry });
  };

  const closeEditor = () => {
    setEditor({ kind: "closed" });
    setError(undefined);
    setShowPassword(false);
  };

  const persist = async (nextEntries: VaultEntry[]) => {
    if (!dek || !vault) {
      throw new Error("会话未解锁");
    }
    const nextPayload = { entries: nextEntries };
    const nextVault = await saveVaultPayload(dek, vault, nextPayload);
    if (!nextVault) {
      throw new Error("会话未解锁");
    }
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
    const isEdit = editor.kind === "edit";
    const parsedTags = parseTags(draft.tags);
    const fieldClass =
      "flex min-h-14 items-center gap-3 rounded-xl border border-border bg-background px-3 py-2";
    const fieldInputClass =
      "h-auto w-full border-0 bg-transparent p-0 text-sm text-foreground shadow-none outline-none focus-visible:ring-0";

    return (
      <Screen>
        <header className="relative flex h-12 shrink-0 items-center border-b border-border px-2.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="relative z-10 -ml-0.5"
            aria-label="返回"
            onClick={closeEditor}
          >
            <ArrowLeft />
          </Button>
          <h1 className="pointer-events-none absolute inset-x-0 text-center text-row font-semibold tracking-[-0.01em] text-foreground">
            {isEdit ? "编辑条目" : "保存密码"}
          </h1>
        </header>

        <ScreenBody className="px-4 pt-5 pb-10">
          <div className="flex flex-col items-center text-center">
            <div
              className="relative grid size-14 place-items-center rounded-full bg-primary text-primary-foreground"
              aria-hidden
            >
              <KeyRound className="size-6" strokeWidth={2} />
              <span className="absolute inset-0 m-auto h-0.5 w-8 -rotate-45 rounded-full bg-primary-foreground" />
            </div>
            <h2 className="mt-3 text-section font-semibold text-foreground">
              {isEdit ? "编辑本机已保存账号" : "保存当前站点账号？"}
            </h2>
            <p className="mt-1 text-meta text-muted-foreground">仅加密保存在本机</p>
          </div>

          <form className="mt-6 flex flex-col gap-3" onSubmit={(event) => void onSave(event)}>
            <div className={fieldClass}>
              <Globe className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="h-8 w-px shrink-0 bg-border" aria-hidden />
              <div className="min-w-0 flex-1">
                <Label htmlFor="entry-host" className="text-micro text-muted-foreground">
                  网站
                </Label>
                <Input
                  id="entry-host"
                  className={fieldInputClass}
                  value={draft.host}
                  onChange={(event) => setDraft((prev) => ({ ...prev, host: event.target.value }))}
                  placeholder="example.com"
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            <div className={fieldClass}>
              <User className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="h-8 w-px shrink-0 bg-border" aria-hidden />
              <div className="min-w-0 flex-1">
                <Label htmlFor="entry-username" className="text-micro text-muted-foreground">
                  账号
                </Label>
                <Input
                  id="entry-username"
                  className={fieldInputClass}
                  value={draft.username}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, username: event.target.value }))
                  }
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className={fieldClass}>
              <Lock className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="h-8 w-px shrink-0 bg-border" aria-hidden />
              <div className="min-w-0 flex-1">
                <Label htmlFor="entry-password" className="text-micro text-muted-foreground">
                  密码
                </Label>
                <Input
                  id="entry-password"
                  className={fieldInputClass}
                  type={showPassword ? "text" : "password"}
                  value={draft.password}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, password: event.target.value }))
                  }
                  autoComplete="new-password"
                  required
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label={showPassword ? "隐藏密码" : "显示密码"}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>

            <div className={fieldClass}>
              <Tag className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="h-8 w-px shrink-0 bg-border" aria-hidden />
              <div className="min-w-0 flex-1">
                <Label htmlFor="entry-tags" className="text-micro text-muted-foreground">
                  标签
                </Label>
                <Input
                  id="entry-tags"
                  className={fieldInputClass}
                  value={draft.tags}
                  onChange={(event) => setDraft((prev) => ({ ...prev, tags: event.target.value }))}
                  placeholder="添加标签（可选）"
                  autoComplete="off"
                />
              </div>
              {parsedTags[0] ? (
                <Badge variant="default" className="max-w-[5.5rem] shrink-0 truncate rounded-md">
                  {parsedTags[0]}
                </Badge>
              ) : null}
            </div>

            <p className="min-h-5 text-micro text-destructive">{error}</p>

            <Button type="submit" className="mt-1 w-full" disabled={saving}>
              {saving ? "保存中…" : "保存"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={saving}
              onClick={closeEditor}
            >
              取消
            </Button>

            {isEdit ? (
              <Button
                type="button"
                variant="ghost"
                className="mt-2 w-full text-destructive hover:text-destructive"
                disabled={saving}
                onClick={() => void onDelete()}
              >
                删除
              </Button>
            ) : null}
          </form>
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
              aria-label="锁定"
              onClick={() => void lock()}
            >
              <Lock />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="设置"
              onClick={() => void navigate(panelPaths.settings)}
            >
              <Settings />
            </Button>
          </>
        }
      />

      <div className="flex shrink-0 flex-col gap-3 border-b border-border px-4 py-3">
        <div className="relative min-w-0">
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

        <div className="flex gap-2" role="radiogroup" aria-label="列表筛选">
          {(
            [
              { id: "all" as const, label: "全部", count: segmentCounts.all, disabled: false },
              ...(currentSiteSegmentEnabled
                ? [
                    {
                      id: "current" as const,
                      label: "当前站",
                      count: segmentCounts.current,
                      disabled: !hasCurrentSite,
                    },
                  ]
                : []),
              { id: "other" as const, label: "其他", count: segmentCounts.other, disabled: false },
            ] as const
          ).map((segment) => {
            const selected = listSegment === segment.id;
            return (
              <button
                key={segment.id}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={segment.disabled}
                onClick={() => setListSegment(segment.id)}
                className={cn(
                  "inline-flex h-8 min-w-0 flex-1 items-center justify-center gap-1 rounded-full px-2.5 text-xs font-medium transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
                  segment.disabled && "cursor-not-allowed opacity-40",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="truncate">{segment.label}</span>
                <span className="tabular-nums">{segment.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <ScreenBody>
        {visibleGroups.length === 0 ? (
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
            {visibleGroups.map((group) => {
              const expanded = expandedHostKey === group.hostKey;
              return (
                <li key={group.hostKey} className="border-b border-border/70">
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                    aria-expanded={expanded}
                    onClick={() =>
                      setExpandedHostKey((prev) =>
                        prev === group.hostKey ? undefined : group.hostKey,
                      )
                    }
                  >
                    <span
                      className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-sm font-semibold text-foreground"
                      aria-hidden
                    >
                      {siteLetter(group.host)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-row font-medium text-foreground">
                        {group.host}
                      </span>
                      <span className="mt-0.5 flex min-w-0 items-center gap-1.5">
                        <span className="shrink-0 text-meta text-muted-foreground">
                          {group.entries.length} 个账号
                        </span>
                        <EntryTags tags={group.tags} />
                      </span>
                    </span>
                    <ChevronRight
                      className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform",
                        expanded && "rotate-90",
                      )}
                      aria-hidden
                    />
                  </button>

                  {expanded ? (
                    <ul className="space-y-2 px-4 pb-3">
                      {group.entries.map((entry) => (
                        <li
                          key={entry.id}
                          className="rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm"
                        >
                          <div className="flex min-w-0 items-center gap-1.5">
                            <p className="min-w-0 truncate text-row font-medium text-foreground">
                              {listMaskEnabled ? maskAccount(entry.username) : entry.username}
                            </p>
                            <EntryTags tags={entry.tags} />
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-meta">
                            <button
                              type="button"
                              className="text-primary hover:underline"
                              onClick={() => void onCopy("账号", entry.username)}
                            >
                              复制账号
                            </button>
                            <span className="text-border" aria-hidden>
                              ·
                            </span>
                            <button
                              type="button"
                              className="text-primary hover:underline"
                              onClick={() => void onCopy("密码", entry.password)}
                            >
                              复制密码
                            </button>
                            <span className="text-border" aria-hidden>
                              ·
                            </span>
                            <button
                              type="button"
                              className="text-primary hover:underline"
                              onClick={() => openEdit(entry)}
                            >
                              编辑
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </ScreenBody>

      <ScreenFooter className="justify-center border-t border-border px-4 py-3">
        <Button type="button" size="lg" className="w-full" onClick={() => openCreate()}>
          <Plus />
          保存密码
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
