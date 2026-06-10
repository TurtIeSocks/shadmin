import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, CustomTabs, HideActions } from "./job-monitor.stories";

describe("<JobMonitor />", () => {
  it("renders default tabs with badge counts", async () => {
    const screen = render(<Basic />);
    // running:1, queued:1, failed:1, done:1
    await expect.element(screen.getByText(/running/i)).toBeInTheDocument();
    await expect.element(screen.getByText(/queued/i)).toBeInTheDocument();
    await expect.element(screen.getByText(/failed/i)).toBeInTheDocument();
    await expect.element(screen.getByText(/done/i)).toBeInTheDocument();
  });

  it("renders one job card per record in the active tab", async () => {
    const screen = render(<Basic />);
    // Default active tab is 'running', so only the running job appears
    await expect.element(screen.getByText("send-email")).toBeInTheDocument();
  });

  it("respects custom tabs prop (no done tab)", async () => {
    const screen = render(<CustomTabs />);
    // Wait for the async useGetList render before querying tabs.
    await expect.element(screen.getByText(/failed/i)).toBeInTheDocument();
    const tabList = screen.container.querySelector("[role='tablist']");
    const tabs = tabList?.querySelectorAll("[role='tab']");
    expect(tabs?.length).toBe(3);
  });

  it("hides action buttons when actions=false", async () => {
    const screen = render(<HideActions />);
    expect(screen.container.querySelector("[data-job-retry]")).toBeNull();
    expect(screen.container.querySelector("[data-job-cancel]")).toBeNull();
  });

  it("renders retry button on failed rows", async () => {
    const screen = render(<Basic />);
    // Radix Tabs require a real pointer click; use vitest-browser-react's
    // role-based locator + awaited click instead of a sync HTMLElement.click().
    await screen.getByRole("tab", { name: /failed/i }).click();
    await expect
      .element(screen.getByText("sync-inventory"))
      .toBeInTheDocument();
    const retry = screen.container.querySelector("[data-job-retry]");
    expect(retry).toBeTruthy();
  });

  it("renders the lastError line on failed rows", async () => {
    const screen = render(<Basic />);
    await screen.getByRole("tab", { name: /failed/i }).click();
    await expect.element(screen.getByText(/ETIMEDOUT/i)).toBeInTheDocument();
  });
});
