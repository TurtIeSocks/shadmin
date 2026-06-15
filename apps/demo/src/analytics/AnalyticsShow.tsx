import { useRecordContext } from "ra-core";
import { Show } from "shadmin/components/admin";
import { RecordTimeline } from "shadmin/components/extras";
import { DiffViewer } from "shadmin/components/extras/diff-viewer";
import type { Report, ReportTimelineEntry } from "./reports-seed";

const currency = (v: unknown) =>
  typeof v === "number" ? `$${v.toLocaleString()}` : "—";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-2">
    <h3 className="text-sm font-semibold">{title}</h3>
    {children}
  </section>
);

const Header = () => {
  const record = useRecordContext<Report>();
  if (!record) return null;
  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {record.region} · {record.quarter}
      </div>
      <div className="text-lg font-medium">{record.name}</div>
    </div>
  );
};

const SnapshotDiff = () => {
  const record = useRecordContext<Report>();
  if (!record) return null;
  return (
    <DiffViewer
      before={record.previousSnapshot as unknown as Record<string, unknown>}
      after={record.snapshot as unknown as Record<string, unknown>}
      labels={{ revenue: "Revenue", customers: "Customers" }}
      formatters={{
        revenue: currency,
        customers: (v) => (typeof v === "number" ? v.toLocaleString() : "—"),
      }}
    />
  );
};

const Timeline = () => {
  const record = useRecordContext<Report>();
  if (!record) return null;
  const entries = (record.timeline ?? []).map(
    (entry: ReportTimelineEntry, idx: number) => ({
      id: idx,
      message: entry.event,
      timestamp: entry.date,
      user: entry.actor,
    }),
  );
  return <RecordTimeline entries={entries} />;
};

export const AnalyticsShow = () => (
  <Show>
    <div className="flex flex-col gap-6">
      <Header />
      <Section title="Snapshot diff (previous vs current)">
        <SnapshotDiff />
      </Section>
      <Section title="Activity">
        <Timeline />
      </Section>
    </div>
  </Show>
);
