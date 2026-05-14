"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
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

const DefaultCalendarHeader = ({
  range,
  view,
  anchor,
  views,
  onNavigate,
  onViewChange,
  translate,
}: {
  range: { start: Date; end: Date };
  view: CalendarView;
  anchor: Date;
  views: CalendarView[];
  onNavigate: (dir: "prev" | "next" | "today") => void;
  onViewChange: (view: CalendarView) => void;
  translate: (key: string, opts?: Record<string, unknown>) => string;
}) => {
  const label =
    view === "month"
      ? format(anchor, "MMMM yyyy")
      : `${format(range.start, "MMM d")} – ${format(range.end, "MMM d, yyyy")}`;
  return (
    <div className="flex items-center justify-between border-b p-2">
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={translate("ra.calendar.previous", { _: "Previous" })}
          onClick={() => onNavigate("prev")}
          className="rounded-md px-2 py-1 text-sm hover:bg-accent"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => onNavigate("today")}
          className="rounded-md px-2 py-1 text-sm hover:bg-accent"
        >
          {translate("ra.calendar.today", { _: "Today" })}
        </button>
        <button
          type="button"
          aria-label={translate("ra.calendar.next", { _: "Next" })}
          onClick={() => onNavigate("next")}
          className="rounded-md px-2 py-1 text-sm hover:bg-accent"
        >
          ›
        </button>
        <div className="ml-2 text-sm font-medium">{label}</div>
      </div>
      <div className="flex items-center gap-1">
        {views.map((v) => (
          <button
            key={v}
            type="button"
            data-view-btn={v}
            onClick={() => onViewChange(v)}
            className={cn(
              "rounded-md px-2 py-1 text-sm capitalize hover:bg-accent",
              v === view && "bg-accent text-accent-foreground",
            )}
          >
            {translate(`ra.calendar.view.${v}`, {
              _: v.charAt(0).toUpperCase() + v.slice(1),
            })}
          </button>
        ))}
      </div>
    </div>
  );
};

export const CalendarList = <R extends RaRecord = RaRecord>({
  startSource,
  endSource,
  titleSource,
  colorSource,
  colorMap = {},
  defaultView = "month",
  views,
  weekStartsOn = 0,
  eventRenderer,
  headerRenderer,
}: CalendarListProps<R>) => {
  const { data = [], filterValues = {}, setFilters } = useListContext<R>();
  const resource = useResourceContext();
  const getRepresentation = useGetRecordRepresentation(resource ?? "");
  const translate = useTranslate();
  const [view, setView] = useState<CalendarView>(defaultView);
  const [anchor, setAnchor] = useState<Date>(new Date());

  const range = useMemo(() => {
    if (view === "month") {
      const monthStart = startOfMonth(anchor);
      const monthEnd = endOfMonth(anchor);
      return {
        start: startOfWeek(monthStart, { weekStartsOn }),
        end: endOfWeek(monthEnd, { weekStartsOn }),
      };
    }
    if (view === "week") {
      return {
        start: startOfWeek(anchor, { weekStartsOn }),
        end: endOfWeek(anchor, { weekStartsOn }),
      };
    }
    // agenda: ±2 weeks around anchor
    return {
      start: startOfDay(addDays(anchor, -14)),
      end: endOfDay(addDays(anchor, 14)),
    };
  }, [anchor, weekStartsOn, view]);

  const onNavigate = useCallback(
    (dir: "prev" | "next" | "today") => {
      setAnchor((current) => {
        if (dir === "today") return new Date();
        const delta = dir === "prev" ? -1 : 1;
        if (view === "month")
          return delta > 0 ? addMonths(current, 1) : subMonths(current, 1);
        if (view === "week")
          return delta > 0 ? addWeeks(current, 1) : subWeeks(current, 1);
        return addDays(current, delta * 14);
      });
    },
    [view],
  );

  const onViewChange = useCallback((next: CalendarView) => setView(next), []);

  const startKey = `${startSource}_gte`;
  const endKey = `${startSource}_lte`;
  const rangeStartISO = range.start.toISOString();
  const rangeEndISO = range.end.toISOString();

  useEffect(() => {
    if (!setFilters) return;
    const current = filterValues as Record<string, unknown>;
    if (current[startKey] === rangeStartISO && current[endKey] === rangeEndISO) {
      return;
    }
    setFilters(
      {
        ...current,
        [startKey]: rangeStartISO,
        [endKey]: rangeEndISO,
      },
      undefined,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeStartISO, rangeEndISO, startKey, endKey, setFilters]);

  const events: CalendarEventInfo<R>[] = useMemo(() => {
    return data
      .map((record): CalendarEventInfo<R> | null => {
        const rawStart = record[startSource];
        if (!rawStart) return null;
        const start =
          typeof rawStart === "string"
            ? parseISO(rawStart)
            : new Date(rawStart as number);
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
  const resolvedViews = views ?? ["month", "week", "agenda"];

  return (
    <div className="flex h-full flex-col rounded-md border" data-slot="calendar-list">
      {headerRenderer ? (
        headerRenderer({
          range,
          view,
          anchor,
          onNavigate,
          onViewChange,
        })
      ) : (
        <DefaultCalendarHeader
          range={range}
          view={view}
          anchor={anchor}
          views={resolvedViews}
          onNavigate={onNavigate}
          onViewChange={onViewChange}
          translate={translate}
        />
      )}
      {view === "month" ? (
        <CalendarMonthView
          range={range}
          anchor={anchor}
          events={events}
          weekStartsOn={weekStartsOn}
          renderEvent={RenderEvent as (props: EventRendererProps<RaRecord>) => ReactNode}
          emptyLabel={translate("ra.calendar.no_events", { _: "No events" })}
        />
      ) : view === "agenda" ? (
        <CalendarAgendaView
          events={events}
          range={range}
          emptyLabel={translate("ra.calendar.no_events", { _: "No events" })}
          renderEvent={RenderEvent as (props: EventRendererProps<RaRecord>) => ReactNode}
        />
      ) : (
        // Week view — implemented in Task 4. For now render agenda as placeholder.
        <CalendarAgendaView
          events={events}
          range={range}
          emptyLabel={translate("ra.calendar.no_events", { _: "No events" })}
          renderEvent={RenderEvent as (props: EventRendererProps<RaRecord>) => ReactNode}
        />
      )}
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

interface CalendarAgendaViewProps<R extends RaRecord = RaRecord> {
  events: CalendarEventInfo<R>[];
  emptyLabel: string;
  renderEvent: (props: EventRendererProps<R>) => ReactNode;
  range: { start: Date; end: Date };
}

const CalendarAgendaView = <R extends RaRecord = RaRecord>({
  events,
  emptyLabel,
  renderEvent: RenderEvent,
  range,
}: CalendarAgendaViewProps<R>) => {
  const inRange = useMemo(
    () =>
      events
        .filter((e) => e.start >= range.start && e.start <= range.end)
        .sort((a, b) => a.start.getTime() - b.start.getTime()),
    [events, range.start, range.end],
  );

  if (inRange.length === 0) {
    return (
      <div
        className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground"
        data-calendar-view="agenda"
      >
        {emptyLabel}
      </div>
    );
  }

  const grouped = inRange.reduce<Record<string, CalendarEventInfo<R>[]>>(
    (acc, e) => {
      const key = format(e.start, "yyyy-MM-dd");
      (acc[key] ??= []).push(e);
      return acc;
    },
    {},
  );

  return (
    <div
      className="flex flex-1 flex-col gap-4 overflow-auto p-3"
      data-calendar-view="agenda"
    >
      {Object.entries(grouped).map(([day, dayEvents]) => (
        <div key={day} className="flex flex-col gap-1">
          <div className="text-sm font-medium">
            {format(parseISO(day + "T00:00:00"), "EEEE, MMMM d")}
          </div>
          <div className="flex flex-col gap-1 pl-2">
            {dayEvents.map((e) => (
              <RenderEvent key={String(e.record.id)} {...e} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
