import * as React from "react";

import { toast } from "sonner";

import { createEntryId } from "@/shared/entries/entries";
import {
  EXPORT_WARNING,
  entryFileIssueMessage,
  importConfirmMessage,
  importNoNewMessage,
  importSuccessMessage,
  parseEntryFile,
  planImport,
  serializeEntryFile,
  type ImportPlan,
} from "@/shared/entries/entry-file";
import { sessionIsCurrent, sessionStamp, useSessionStore } from "@/shared/session/session-store";
import { saveVaultPayload } from "@/shared/vault/vault";
import { ConfirmDialog } from "../components/confirm-dialog";
import { SectionLabel } from "../components/screen";
import { isPickerAbort, readEntryFile, writeEntryFile } from "../entry-file-client";
import { SettingsActionRow, SettingsGroup } from "./settings-shell";

type DialogState = { kind: "export" } | { kind: "import"; plan: ImportPlan };

export function SettingsEntryFileSection() {
  const unlocked = useSessionStore((state) => state.unlocked);
  const [dialog, setDialog] = React.useState<DialogState | undefined>();
  const [busy, setBusy] = React.useState(false);
  const busyRef = React.useRef(false);

  React.useEffect(() => {
    if (!unlocked) {
      setDialog(undefined);
    }
  }, [unlocked]);

  async function withBusy(action: () => Promise<void>): Promise<void> {
    if (busyRef.current) {
      return;
    }
    busyRef.current = true;
    setBusy(true);
    try {
      await action();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function startImport() {
    await withBusy(async () => {
      const stamp = sessionStamp();
      try {
        const text = await readEntryFile();
        if (!sessionIsCurrent(stamp)) {
          return;
        }
        const parsed = parseEntryFile(text);
        if (!parsed.ok) {
          toast.message(entryFileIssueMessage(parsed.issue));
          return;
        }
        const existing = useSessionStore.getState().payload?.entries ?? [];
        const plan = planImport(existing, parsed.entries, new Date().toISOString(), createEntryId);
        if (!sessionIsCurrent(stamp)) {
          return;
        }
        if (plan.added === 0) {
          toast.message(importNoNewMessage(plan.skipped));
          return;
        }
        setDialog({ kind: "import", plan });
      } catch (error) {
        if (!isPickerAbort(error)) {
          toast.message("保存失败");
        }
      }
    });
  }

  async function confirmExport() {
    await withBusy(async () => {
      const stamp = sessionStamp();
      const payload = useSessionStore.getState().payload;
      if (!sessionIsCurrent(stamp) || !payload) {
        setDialog(undefined);
        return;
      }
      const contents = serializeEntryFile(payload.entries);
      try {
        await writeEntryFile(contents, () => sessionIsCurrent(stamp), window);
      } catch (error) {
        if (!isPickerAbort(error)) {
          toast.message("保存失败");
        }
      } finally {
        setDialog(undefined);
      }
    });
  }

  async function confirmImport() {
    if (dialog?.kind !== "import") {
      return;
    }
    const plan = dialog.plan;
    await withBusy(async () => {
      const stamp = sessionStamp();
      const { dek, vault } = useSessionStore.getState();
      if (!sessionIsCurrent(stamp) || !dek || !vault) {
        setDialog(undefined);
        return;
      }
      try {
        const nextPayload = { entries: plan.entries };
        const nextVault = await saveVaultPayload(dek, vault, nextPayload, () =>
          sessionIsCurrent(stamp),
        );
        if (!nextVault || !sessionIsCurrent(stamp)) {
          setDialog(undefined);
          return;
        }
        useSessionStore.getState().applyPayload(nextPayload, nextVault);
        toast.message(importSuccessMessage(plan));
        setDialog(undefined);
      } catch {
        toast.message("保存失败");
        setDialog(undefined);
      }
    });
  }

  return (
    <>
      <SectionLabel className="mt-6">数据</SectionLabel>
      <SettingsGroup className="mt-2">
        <SettingsActionRow
          label="导出条目"
          disabled={busy}
          onClick={() => setDialog({ kind: "export" })}
        />
        <SettingsActionRow
          label="导入条目"
          disabled={busy}
          onClick={() => {
            void startImport();
          }}
        />
      </SettingsGroup>
      {dialog?.kind === "export" ? (
        <ConfirmDialog
          title="导出条目"
          body={EXPORT_WARNING}
          confirmLabel="继续导出"
          busy={busy}
          onCancel={() => setDialog(undefined)}
          onConfirm={() => {
            void confirmExport();
          }}
        />
      ) : null}
      {dialog?.kind === "import" ? (
        <ConfirmDialog
          title="导入条目"
          body={importConfirmMessage(dialog.plan)}
          confirmLabel="导入"
          busy={busy}
          onCancel={() => setDialog(undefined)}
          onConfirm={() => {
            void confirmImport();
          }}
        />
      ) : null}
    </>
  );
}
