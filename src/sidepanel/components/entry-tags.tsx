import { Badge } from "@/components/ui/badge";

const MAX_VISIBLE = 2;
const LABEL_MAX = 8;

function truncateLabel(tag: string): string {
  if (tag.length <= LABEL_MAX) {
    return tag;
  }
  return `${tag.slice(0, LABEL_MAX)}…`;
}

export function EntryTags({ tags }: { tags: string[] }) {
  if (tags.length === 0) {
    return null;
  }

  const visible = tags.slice(0, MAX_VISIBLE);
  const overflow = tags.length - visible.length;

  return (
    <span className="flex min-w-0 shrink items-center gap-1">
      {visible.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="max-w-[6.5rem] truncate rounded-full"
          title={tag}
        >
          {truncateLabel(tag)}
        </Badge>
      ))}
      {overflow > 0 ? (
        <Badge
          variant="outline"
          className="rounded-full tabular-nums"
          title={tags.slice(MAX_VISIBLE).join("、")}
        >
          +{overflow}
        </Badge>
      ) : null}
    </span>
  );
}
