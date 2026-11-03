import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  busy,
  onConfirm,
  onCancel,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-end bg-foreground/25 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full rounded-xl border border-border bg-background p-4 shadow-lg"
      >
        <h2 id="confirm-dialog-title" className="text-sm font-semibold text-foreground">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-5 text-muted-foreground">{body}</p>
        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={busy}
            autoFocus
            onClick={onCancel}
          >
            取消
          </Button>
          <Button type="button" className="flex-1" disabled={busy} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
