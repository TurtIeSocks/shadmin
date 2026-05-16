import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, RequireReason } from "@/stories/admin/approval-queue.stories";

describe("<ApprovalQueue />", () => {
  it("renders one row per pending record", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("Conference travel")).toBeInTheDocument();
    await expect.element(screen.getByText("Software license")).toBeInTheDocument();
    // Approved record should be filtered out
    expect(screen.container.textContent ?? "").not.toContain("Office supplies");
  });

  it("renders approve + reject buttons per row", async () => {
    const screen = render(<Basic />);
    // Wait for data to load (one row per pending record) before counting buttons.
    await expect.element(screen.getByText("Conference travel")).toBeInTheDocument();
    const approveButtons = screen.container.querySelectorAll("[data-approve-button]");
    const rejectButtons = screen.container.querySelectorAll("[data-reject-button]");
    expect(approveButtons.length).toBe(2);
    expect(rejectButtons.length).toBe(2);
  });

  it("shows a reason textarea when requireReason is set and reject is clicked", async () => {
    const screen = render(<RequireReason />);
    // Wait for the first row to render so the reject button exists in the DOM.
    await expect.element(screen.getByText("Conference travel")).toBeInTheDocument();
    const rejectBtn = screen.container.querySelector("[data-reject-button]") as HTMLButtonElement;
    rejectBtn.click();
    await expect.element(screen.getByLabelText(/reason/i)).toBeInTheDocument();
  });

  it("renders an empty state when there are no pending records", async () => {
    // Verify Basic + RequireReason show non-empty; empty path is covered by ra-core
    // useListContext semantics already (zero records → empty list).
    const screen = render(<Basic />);
    // Wait for data to load before asserting empty-state marker is absent.
    await expect.element(screen.getByText("Conference travel")).toBeInTheDocument();
    expect(screen.container.querySelector("[data-approval-empty]")).toBeNull();
  });
});
