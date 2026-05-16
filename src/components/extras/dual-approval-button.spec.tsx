import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  FirstApproverPending,
  SelfApprovalBlocked,
  ThresholdReached,
} from "@/stories/extras/dual-approval-button.stories";

describe("<DualApprovalButton />", () => {
  it("renders an enabled approve button with 0/2 count", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText(/0 of 2/i)).toBeInTheDocument();
    // useGetIdentity() resolves asynchronously; poll until the button is
    // enabled rather than reading .disabled synchronously.
    await expect
      .element(screen.getByRole("button", { name: /approve/i }))
      .toBeEnabled();
  });

  it("renders 1/2 when one approver is already recorded", async () => {
    const screen = render(<FirstApproverPending />);
    await expect.element(screen.getByText(/1 of 2/i)).toBeInTheDocument();
  });

  it("disables the button when the current user already approved", async () => {
    const screen = render(<SelfApprovalBlocked />);
    await expect
      .element(screen.getByText(/already approved/i))
      .toBeInTheDocument();
    const btn = screen.container.querySelector(
      "[data-dual-approve]",
    ) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("renders a 'Fully approved' badge when the threshold is met", async () => {
    const screen = render(<ThresholdReached />);
    await expect
      .element(screen.getByText(/fully approved/i))
      .toBeInTheDocument();
  });
});
