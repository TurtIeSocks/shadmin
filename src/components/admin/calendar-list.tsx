"use client";

import {
  type ReactNode,
  useMemo,
  useState,
} from "react";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  type RaRecord,
  useGetRecordRepresentation,
  useListContext,
  useResourceContext,
  useTranslate,
} from "ra-core";
import { cn } from "@/lib/utils";

export type CalendarView = "month" | "week" | "agenda";

export interface CalendarEventInfo<R extends RaRecord = RaRecord> {
  record: R;
  start: Date;
  end?: Date;
  title: string;
  color?: string;
  isDragging?: boolean;
}

export interface EventRendererProps<R extends RaRecord = RaRecord>
  extends CalendarEventInfo<R> {}

export interface HeaderRendererProps {
  range: { start: Date; end: Date };
  anchor: Date;
  view: CalendarView;
  onNavigate: (dir: "prev" | "next" | "today") => void;
  onViewChange: (view: CalendarView) => void;
}

export interface CalendarListProps<R extends RaRecord = RaRecord> {
  startSource: string;
  endSource?: string;
  titleSource?: string;
  colorSource?: string;
  colorMap?: Record<string, string>;
  defaultView?: CalendarView;
  views?: CalendarView[];
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  onSelectEvent?: (record: R) => void;
  onSelectSlot?: (slot: { startISO: string; endISO: string; allDay: boolean }) => void;
  onDrop?: (record: R, range: { start: string; end?: string }) => Promise<void> | void;
  eventRenderer?: (props: EventRendererProps<R>) => ReactNode;
  headerRenderer?: (props: HeaderRendererProps) => ReactNode;
}

const defaultColors = "bg-primary text-primary-foreground";

const DefaultEvent = ({ title, color }: EventRendererProps) => (
  <div
    className={cn(
      "truncate rounded-sm px-1.5 py-0.5 text-xs",
      color ?? defaultColors,
    )}
  >
    {title}
  </div>
);

const DefaultHeader = ({ anchor }: HeaderRendererProps) => (
  <div className="flex items-center justify-between border-b p-2">
    <div className="text-sm font-medium">
      {format(anchor, "MMMM yyyy")}
    </div>
  </div>
);

export const CalendarList = <R extends RaRecord = RaRecord>({
  startSource,
  endSource,
  titleSource,
  colorSource,
  colorMap = {},
  defaultView = "month",
  weekStartsOn = 0,
  eventRenderer,
  headerRenderer,
}: CalendarListProps<R>) => {
  const { data = [] } = useListContext<R>();
  const resource = useResourceContext();
  const getRepresentation = useGetRecordRepresentation(resource ?? "");
  const translate = useTranslate();
  const [view] = useState<CalendarView>(defaultView);
  const [anchor] = useState<Date>(new Date());

  const range = useMemo(() => {
    const monthStart = startOfMonth(anchor);
    const monthEnd = endOfMonth(anchor);
    return {
      start: startOfWeek(monthStart, { weekStartsOn }),
      end: endOfWeek(monthEnd, { weekStartsOn }),
    };
  }, [anchor, weekStartsOn]);

  const events: CalendarEventInfo<R>[] = useMemo(() => {
    return data
      .map((record): CalendarEventInfo<R> | null => {
        const rawStart = record[startSource];
        if (!rawStart) return null;
        const start = typeof rawStart === "string" ? parseISO(rawStart) : new Date(rawStart as number);
        if (Number.isNaN(start.getTime())) return null;
        const rawEnd = endSource ? record[endSource] : undefined;
        const end = rawEnd
          ? typeof rawEnd === "string"
            ? parseISO(rawEnd)
            : new Date(rawEnd as number)
          : undefined;
        const title =
          (titleSource ? String(record[titleSource] ?? "") : "") ||
          String(getRepresentation(record));
        const colorKey = colorSource ? String(record[colorSource] ?? "") : "";
        const color = colorMap[colorKey];
        return { record, start, end, title, color };
      })
      .filter((e): e is CalendarEventInfo<R> => e !== null);
  }, [data, startSource, endSource, titleSource, colorSource, colorMap, getRepresentation]);

  const RenderEvent = eventRenderer ?? DefaultEvent;
  const RenderHeader = headerRenderer ?? DefaultHeader;

  return (
    <div className="flex h-full flex-col rounded-md border" data-slot="calendar-list">
      <RenderHeader
        range={range}
        anchor={anchor}
        view={view}
        onNavigate={() => {}}
        onViewChange={() => {}}
      />
      <CalendarMonthView
        range={range}
        anchor={anchor}
        events={events}
        weekStartsOn={weekStartsOn}
        renderEvent={RenderEvent as (props: EventRendererProps<RaRecord>) => ReactNode}
        emptyLabel={translate("ra.calendar.no_events", { _: "No events" })}
      />
    </div>
  );
};

interface CalendarMonthViewProps<R extends RaRecord = RaRecord> {
  range: { start: Date; end: Date };
  anchor: Date;
  events: CalendarEventInfo<R>[];
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  renderEvent: (props: EventRendererProps<R>) => ReactNode;
  emptyLabel: string;
}

const CalendarMonthView = <R extends RaRecord = RaRecord>({
  range,
  anchor,
  events,
  weekStartsOn,
  renderEvent: RenderEvent,
}: CalendarMonthViewProps<R>) => {
  const days = useMemo(() => {
    const out: Date[] = [];
    let cursor = range.start;
    while (cursor <= range.end) {
      out.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return out;
  }, [range]);

  const weekdayLabels = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn });
    return Array.from({ length: 7 }, (_, i) =>
      format(addDays(start, i), "EEE"),
    );
  }, [weekStartsOn]);

  const today = new Date();

  return (
    <div className="flex flex-1 flex-col" role="grid" data-calendar-view="month">
      <div className="grid grid-cols-7 border-b text-xs text-muted-foreground">
        {weekdayLabels.map((label) => (
          <div key={label} className="p-2 text-center">
            {label}
          </div>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-7">
        {days.map((day) => {
          const dayEvents = events.filter((e) => isSameDay(e.start, day));
          const inMonth = isSameMonth(day, anchor);
          const isToday = isSameDay(day, today);
          return (
            <div
              key={day.toISOString()}
              role="gridcell"
              data-day={format(day, "yyyy-MM-dd")}
              data-today={isToday || undefined}
              className={cn(
                "min-h-24 border-b border-r p-1 text-xs",
                !inMonth && "bg-muted/20 text-muted-foreground",
                isToday && "bg-accent/50",
              )}
            >
              <div className={cn("mb-1", isToday && "font-medium")}>
                {format(day, "d")}
              </div>
              <div className="flex flex-col gap-0.5">
                {dayEvents.map((e) => (
                  <RenderEvent key={String(e.record.id)} {...e} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
