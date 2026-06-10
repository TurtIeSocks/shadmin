export interface ReportSnapshot {
  revenue: number;
  customers: number;
}

export interface ReportTimelineEntry {
  date: string;
  event: string;
  actor: string;
}

export interface Report {
  id: number;
  name: string;
  region: "EU" | "US" | "APAC";
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  revenue: number;
  customers: number;
  snapshot: ReportSnapshot;
  previousSnapshot: ReportSnapshot;
  timeline: ReportTimelineEntry[];
}

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86400000).toISOString();

export const reportsSeed: Report[] = [
  {
    id: 1,
    name: "EU Q1 Revenue Recap",
    region: "EU",
    quarter: "Q1",
    revenue: 124000,
    customers: 412,
    snapshot: { revenue: 124000, customers: 412 },
    previousSnapshot: { revenue: 109500, customers: 398 },
    timeline: [
      { date: daysAgo(30), event: "Report drafted", actor: "alice" },
      { date: daysAgo(22), event: "Numbers reviewed by finance", actor: "bob" },
      { date: daysAgo(14), event: "Published to stakeholders", actor: "carol" },
    ],
  },
  {
    id: 2,
    name: "US Q1 Revenue Recap",
    region: "US",
    quarter: "Q1",
    revenue: 198400,
    customers: 624,
    snapshot: { revenue: 198400, customers: 624 },
    previousSnapshot: { revenue: 201200, customers: 631 },
    timeline: [
      { date: daysAgo(28), event: "Report drafted", actor: "dave" },
      { date: daysAgo(20), event: "Region lead sign-off", actor: "erin" },
    ],
  },
  {
    id: 3,
    name: "APAC Q1 Revenue Recap",
    region: "APAC",
    quarter: "Q1",
    revenue: 76800,
    customers: 188,
    snapshot: { revenue: 76800, customers: 188 },
    previousSnapshot: { revenue: 70100, customers: 174 },
    timeline: [
      { date: daysAgo(25), event: "Report drafted", actor: "frank" },
      { date: daysAgo(18), event: "Translation review", actor: "gina" },
      { date: daysAgo(10), event: "Published", actor: "frank" },
    ],
  },
  {
    id: 4,
    name: "EU Q2 Revenue Recap",
    region: "EU",
    quarter: "Q2",
    revenue: 142500,
    customers: 455,
    snapshot: { revenue: 142500, customers: 455 },
    previousSnapshot: { revenue: 124000, customers: 412 },
    timeline: [
      { date: daysAgo(12), event: "Report drafted", actor: "alice" },
      { date: daysAgo(8), event: "Finance review", actor: "bob" },
      { date: daysAgo(5), event: "Published", actor: "carol" },
      { date: daysAgo(2), event: "Stakeholder Q&A", actor: "alice" },
    ],
  },
  {
    id: 5,
    name: "US Q2 Revenue Recap",
    region: "US",
    quarter: "Q2",
    revenue: 215300,
    customers: 671,
    snapshot: { revenue: 215300, customers: 671 },
    previousSnapshot: { revenue: 198400, customers: 624 },
    timeline: [
      { date: daysAgo(11), event: "Report drafted", actor: "dave" },
      { date: daysAgo(6), event: "Numbers verified", actor: "erin" },
      { date: daysAgo(3), event: "Published", actor: "dave" },
    ],
  },
  {
    id: 6,
    name: "APAC Q2 Revenue Recap",
    region: "APAC",
    quarter: "Q2",
    revenue: 88200,
    customers: 204,
    snapshot: { revenue: 88200, customers: 204 },
    previousSnapshot: { revenue: 76800, customers: 188 },
    timeline: [
      { date: daysAgo(13), event: "Report drafted", actor: "frank" },
      { date: daysAgo(7), event: "Published", actor: "gina" },
    ],
  },
  {
    id: 7,
    name: "EU Q3 Revenue Forecast",
    region: "EU",
    quarter: "Q3",
    revenue: 158000,
    customers: 478,
    snapshot: { revenue: 158000, customers: 478 },
    previousSnapshot: { revenue: 142500, customers: 455 },
    timeline: [
      { date: daysAgo(4), event: "Forecast drafted", actor: "alice" },
      { date: daysAgo(1), event: "Submitted for review", actor: "alice" },
    ],
  },
  {
    id: 8,
    name: "US Q3 Revenue Forecast",
    region: "US",
    quarter: "Q3",
    revenue: 230000,
    customers: 702,
    snapshot: { revenue: 230000, customers: 702 },
    previousSnapshot: { revenue: 215300, customers: 671 },
    timeline: [
      { date: daysAgo(5), event: "Forecast drafted", actor: "dave" },
      { date: daysAgo(2), event: "Region lead review", actor: "erin" },
    ],
  },
];
