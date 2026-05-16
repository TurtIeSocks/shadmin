import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  ThreeTabs,
  WithCount,
  CustomLabel,
} from "@/stories/admin/tabbed-show-layout.stories";

describe("<TabbedShowLayout />", () => {
  it("should render tab headers", async () => {
    const screen = render(<Basic theme="system" />);
    await expect
      .element(screen.getByRole("tab", { name: "Content" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("tab", { name: "Metadata" }))
      .toBeInTheDocument();
  });

  it("should show the first tab content by default", async () => {
    const { container } = render(<Basic theme="system" />);
    // First tab panel should be visible (not hidden)
    const firstPanel = container.querySelector('[role="tabpanel"]');
    expect(firstPanel).toBeTruthy();
    expect(firstPanel?.textContent).toContain("War and Peace");
  });

  it("should switch to second tab when its header is clicked", async () => {
    const screen = render(<Basic theme="system" />);
    await screen.getByRole("tab", { name: "Metadata" }).click();
    // Radix sets data-state="active" on the selected trigger synchronously
    const metadataTab = screen.getByRole("tab", { name: "Metadata" });
    await expect.element(metadataTab).toHaveAttribute("data-state", "active");
  });

  it("should wrap fields in Labeled components", async () => {
    const { container } = render(<Basic theme="system" />);
    // Labeled renders a span.text-xs for the label
    const labels = container.querySelectorAll("span.text-xs");
    expect(labels.length).toBeGreaterThan(0);
  });

  it("should render three tabs", async () => {
    const screen = render(<ThreeTabs theme="system" />);
    await expect
      .element(screen.getByRole("tab", { name: "Title" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("tab", { name: "Author" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("tab", { name: "Stats" }))
      .toBeInTheDocument();
  });

  it("should render a count badge in the tab trigger", async () => {
    const screen = render(<WithCount theme="system" />);
    const reviewsTab = screen.getByRole("tab", { name: /reviews/i });
    await expect.element(reviewsTab).toBeInTheDocument();
    // Count is shown as "(27)" inside the trigger text
    const el = reviewsTab.element() as HTMLElement;
    expect(el.textContent).toContain("27");
  });

  it("should use a custom field label when provided", async () => {
    const { container } = render(<CustomLabel theme="system" />);
    expect(container.textContent).toContain("Book Title");
    expect(container.textContent).toContain("Written By");
  });

  it("should associate tab panels with tab triggers via aria attributes", async () => {
    const { container } = render(<Basic theme="system" />);
    // Radix manages the ARIA wiring: the active trigger has aria-controls
    // pointing to the panel's id, and the panel has aria-labelledby pointing
    // back at the trigger.
    const trigger = container.querySelector(
      '[role="tab"][aria-controls]',
    ) as HTMLElement;
    expect(trigger).toBeTruthy();
    const panelId = trigger.getAttribute("aria-controls")!;
    const panel = container.querySelector(`#${panelId}`) as HTMLElement;
    expect(panel).toBeTruthy();
    expect(panel.getAttribute("role")).toBe("tabpanel");
    expect(panel.getAttribute("aria-labelledby")).toBe(trigger.id);
  });
});
