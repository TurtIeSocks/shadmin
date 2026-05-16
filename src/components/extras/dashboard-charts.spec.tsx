import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { DollarSignIcon } from "lucide-react";
import { Basic, Loading } from "@/stories/extras/dashboard-charts.stories";
import { BarChart, DonutChart, MetricCard, TrendChart } from "@/components/admin";

const trendData = [
  { date: "2026-01", revenue: 1000 },
  { date: "2026-02", revenue: 1500 },
  { date: "2026-03", revenue: 1200 },
];

const barData = [
  { category: "A", count: 12 },
  { category: "B", count: 8 },
];

const donutData = [
  { label: "Open", value: 30 },
  { label: "Closed", value: 70 },
];

describe("<MetricCard>", () => {
  it("renders value, label and positive delta", async () => {
    const { container } = render(
      <div style={{ width: 300 }}>
        <MetricCard
          label="Revenue"
          value={12500}
          delta={0.12}
          format={(v) => `$${v.toLocaleString()}`}
          icon={DollarSignIcon}
        />
      </div>,
    );

    // Use exact DOM queries to avoid ambiguity
    const labelEl = container.querySelector("[data-slot='metric-card'] span");
    expect(labelEl?.textContent).toBe("Revenue");

    const valueEl = container.querySelector(".text-2xl");
    expect(valueEl?.textContent).toBe("$12,500");

    const deltaEl = container.querySelector(".text-emerald-600");
    expect(deltaEl).toBeTruthy();
    expect(deltaEl?.textContent).toContain("12.0%");
  });

  it("renders negative delta with down arrow and rose color class", async () => {
    const { container } = render(
      <div style={{ width: 300 }}>
        <MetricCard label="Orders" value={348} delta={-0.05} />
      </div>,
    );

    const labelEl = container.querySelector("[data-slot='metric-card'] span");
    expect(labelEl?.textContent).toBe("Orders");

    const valueEl = container.querySelector(".text-2xl");
    expect(valueEl?.textContent).toBe("348");

    // The delta container should have rose color class
    const deltaParent = container.querySelector(".text-rose-600");
    expect(deltaParent).toBeTruthy();
    expect(deltaParent?.textContent).toContain("-5.0%");
  });

  it("shows skeleton when loading and hides label", async () => {
    const { container } = render(
      <div style={{ width: 300 }}>
        <MetricCard label="Revenue" value={0} loading />
      </div>,
    );

    // Card shell is still present
    const card = container.querySelector("[data-slot='metric-card']");
    expect(card).toBeTruthy();

    // Skeleton divs should be rendered
    const skeletons = container.querySelectorAll("[data-slot='skeleton']");
    expect(skeletons.length).toBeGreaterThan(0);

    // Label text should not be visible (skeleton replaces content)
    const labelEl = container.querySelector("[data-slot='metric-card'] span");
    expect(labelEl).toBeNull();
  });
});

describe("<TrendChart>", () => {
  it("renders an SVG", async () => {
    const { container } = render(
      <div style={{ width: 400, height: 250 }}>
        <TrendChart
          data={trendData}
          xField="date"
          yField="revenue"
          height={200}
        />
      </div>,
    );

    const card = container.querySelector("[data-slot='trend-chart']");
    expect(card).toBeTruthy();

    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
  });
});

describe("<BarChart>", () => {
  it("renders an SVG", async () => {
    const { container } = render(
      <div style={{ width: 400, height: 250 }}>
        <BarChart
          data={barData}
          xField="category"
          yField="count"
          height={200}
        />
      </div>,
    );

    const card = container.querySelector("[data-slot='bar-chart']");
    expect(card).toBeTruthy();

    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
  });
});

describe("<DonutChart>", () => {
  it("renders an SVG", async () => {
    const { container } = render(
      <div style={{ width: 400, height: 250 }}>
        <DonutChart
          data={donutData}
          labelField="label"
          valueField="value"
          height={200}
        />
      </div>,
    );

    const card = container.querySelector("[data-slot='donut-chart']");
    expect(card).toBeTruthy();

    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
  });
});

describe("stories", () => {
  it("Basic story renders metric cards and chart titles", async () => {
    const { container } = render(
      <div style={{ width: 1200, height: 800 }}>
        <Basic />
      </div>,
    );

    // Check metric cards are rendered
    const metricCards = container.querySelectorAll("[data-slot='metric-card']");
    expect(metricCards.length).toBeGreaterThan(0);

    // Check chart card titles
    const chartTitles = container.querySelectorAll("[data-slot='card-title']");
    const titleTexts = Array.from(chartTitles).map((el) => el.textContent);
    expect(titleTexts).toContain("Monthly Revenue");
    expect(titleTexts).toContain("Ticket Status");
  });

  it("Loading story renders skeleton metric cards", async () => {
    const { container } = render(
      <div style={{ width: 1200, height: 800 }}>
        <Loading />
      </div>,
    );
    const cards = container.querySelectorAll("[data-slot='metric-card']");
    expect(cards.length).toBeGreaterThan(0);
    // Skeletons are present instead of text content
    const skeletons = container.querySelectorAll("[data-slot='skeleton']");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
