import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "@vitest/browser/context";
import { Basic, CustomPlacement } from "@/stories/extras/onboarding-tour.stories";

describe("<OnboardingTour />", () => {
  it("should render the tour when not yet completed", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByText("Resources"))
      .toBeInTheDocument();
  });

  it("should advance to the next step when Next is clicked", async () => {
    const screen = render(<Basic />);
    // First step should show "Resources"
    await expect
      .element(screen.getByText("Resources"))
      .toBeInTheDocument();
    // Click Next
    const nextBtn = screen.getByRole("button", { name: "Next" });
    await userEvent.click(nextBtn);
    // Second step should show "Quick search"
    await expect
      .element(screen.getByText("Quick search"))
      .toBeInTheDocument();
  });

  it("should close and mark completion when Skip is clicked", async () => {
    const screen = render(
      <Basic />
    );
    // Tour card should be present
    const skipBtn = screen.getByRole("button", { name: "Skip" });
    await expect.element(skipBtn).toBeInTheDocument();
    await userEvent.click(skipBtn);
    // Tour card should be gone after skip
    await expect
      .element(document.querySelector('[data-slot="tour-card"]'))
      .not.toBeInTheDocument();
  });

  it("should show a Back button on the second step", async () => {
    const screen = render(<Basic />);
    // Move to step 2
    const nextBtn = screen.getByRole("button", { name: "Next" });
    await userEvent.click(nextBtn);
    await expect
      .element(screen.getByRole("button", { name: "Back" }))
      .toBeInTheDocument();
  });

  it("should show Finish on the last step instead of Next", async () => {
    const screen = render(<CustomPlacement />);
    // Advance to last step (2 steps total)
    const nextBtn = screen.getByRole("button", { name: "Next" });
    await userEvent.click(nextBtn);
    await expect
      .element(screen.getByRole("button", { name: "Finish" }))
      .toBeInTheDocument();
  });

  it("should close the tour when Finish is clicked", async () => {
    const screen = render(<CustomPlacement />);
    // Move to last step
    const nextBtn = screen.getByRole("button", { name: "Next" });
    await userEvent.click(nextBtn);
    const finishBtn = screen.getByRole("button", { name: "Finish" });
    await userEvent.click(finishBtn);
    await expect
      .element(document.querySelector('[data-slot="tour-card"]'))
      .not.toBeInTheDocument();
  });
});
