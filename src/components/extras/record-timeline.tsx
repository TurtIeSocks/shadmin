"use client";

import { type ComponentType, type ReactNode } from "react";
import { ClockIcon } from "lucide-react";
import {
  ReferenceManyFieldBase,
  type RaRecord,
  useListContext,
  useTranslate,
} from "ra-core";
import { formatRelative } from "date-fns";

export interface TimelineEntry {
  id: string | number;
  message: ReactNode;
  timestamp: string;
  user?: string;
  icon?: ComponentType<{ className?: string }>;
}

export interface RecordTimelineProps {
  entries?: TimelineEntry[];
  reference?: string;
  target?: string;
  sort?: { field: string; order: "ASC" | "DESC" };
  messageSource?: string;
  timestampSource?: string;
  userSource?: string;
  iconSource?: string;
  iconMap?: Record<string, ComponentType<{ className?: string }>>;
  emptyLabel?: string;
}

const EMPTY_ICON_MAP: Record<
  string,
  ComponentType<{ className?: string }>
> = {};

const TimelineList = ({
  items,
  emptyLabel,
}: {
  items: TimelineEntry[];
  emptyLabel: string;
}) => {
  if (items.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }
  return (
    <ol className="flex flex-col gap-4" data-slot="record-timeline">
      {items.map((entry) => {
        const Icon = entry.icon ?? ClockIcon;
        return (
          <li key={entry.id} className="flex gap-3" data-entry-id={entry.id}>
            <div className="flex flex-col items-center">
              <div className="flex size-8 items-center justify-center rounded-full border bg-muted">
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <div className="w-px flex-1 bg-border" />
            </div>
            <div className="flex flex-1 flex-col gap-1 pb-4">
              <div className="text-sm">{entry.message}</div>
              <div className="text-xs text-muted-foreground">
                {entry.user ? <span>{entry.user} · </span> : null}
                <time dateTime={entry.timestamp}>
                  {formatRelative(new Date(entry.timestamp), new Date())}
                </time>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

const TimelineFromReference = ({
  messageSource,
  timestampSource,
  userSource,
  iconSource,
  iconMap,
  emptyLabel,
}: {
  messageSource: string;
  timestampSource: string;
  userSource?: string;
  iconSource?: string;
  iconMap: Record<string, ComponentType<{ className?: string }>>;
  emptyLabel: string;
}) => {
  const { data = [] } = useListContext<RaRecord>();
  const items = data.map((row) => ({
    id: row.id,
    message: String(row[messageSource] ?? ""),
    timestamp: String(row[timestampSource] ?? ""),
    user: userSource ? String(row[userSource] ?? "") : undefined,
    icon: iconSource ? iconMap[String(row[iconSource] ?? "")] : undefined,
  })) as TimelineEntry[];
  return <TimelineList items={items} emptyLabel={emptyLabel} />;
};

export const RecordTimeline = ({
  entries,
  reference,
  target,
  sort = { field: "created_at", order: "DESC" },
  messageSource = "message",
  timestampSource = "created_at",
  userSource,
  iconSource,
  iconMap = EMPTY_ICON_MAP,
  emptyLabel,
}: RecordTimelineProps) => {
  const translate = useTranslate();
  const empty =
    emptyLabel ??
    translate("ra.record_timeline.empty", { _: "No activity yet" });

  if (entries) {
    return <TimelineList items={entries} emptyLabel={empty} />;
  }
  if (!reference || !target) {
    throw new Error(
      "<RecordTimeline> requires either `entries` or both `reference` and `target`.",
    );
  }
  return (
    <ReferenceManyFieldBase reference={reference} target={target} sort={sort}>
      <TimelineFromReference
        messageSource={messageSource}
        timestampSource={timestampSource}
        userSource={userSource}
        iconSource={iconSource}
        iconMap={iconMap}
        emptyLabel={empty}
      />
    </ReferenceManyFieldBase>
  );
};
