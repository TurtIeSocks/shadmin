import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, MultipleSteps } from "@/stories/wizard-form.stories";

describe("<WizardForm />", () => {
  it("should render the dialog when isOpen is true", async () => {
    const screen = render(<Basic theme="system" />);
    await expect
      .element(screen.getByRole("dialog"))
      .toBeInTheDocument();
  });

  it("should render the title in the dialog header", async () => {
    const screen = render(<Basic theme="system" />);
    await expect
      .element(screen.getByText("Create a product"))
      .toBeInTheDocument();
  });

  it("should mount all steps but hide inactive ones via display:none", async () => {
    render(<MultipleSteps theme="system" />);
    const panels = document.body.querySelectorAll(
      '[role="group"][data-wizard-step]',
    );
    expect(panels.length).toBe(3);
    // Only first panel is visible
    expect((panels[0] as HTMLElement).style.display).not.toBe("none");
    expect((panels[1] as HTMLElement).style.display).toBe("none");
    expect((panels[2] as HTMLElement).style.display).toBe("none");
  });

  it("should mark inactive step panels with aria-hidden", async () => {
    render(<MultipleSteps theme="system" />);
    const panels = document.body.querySelectorAll(
      '[role="group"][data-wizard-step]',
    );
    expect(panels[0].getAttribute("aria-hidden")).not.toBe("true");
    expect(panels[1].getAttribute("aria-hidden")).toBe("true");
  });

  it("should keep inputs from non-active steps registered in the DOM", async () => {
    render(<MultipleSteps theme="system" />);
    const inputs = document.body.querySelectorAll("input[name]");
    // 3 source inputs: name, price, notes
    expect(inputs.length).toBeGreaterThanOrEqual(3);
  });
});
