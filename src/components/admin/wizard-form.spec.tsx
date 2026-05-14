import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  MultipleSteps,
  OptionalStep,
  SubmitClosesDialog,
  WithValidation,
} from "@/stories/wizard-form.stories";

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
    const dialog = document.body.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    const panels = dialog!.querySelectorAll(
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
    const dialog = document.body.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    const panels = dialog!.querySelectorAll(
      '[role="group"][data-wizard-step]',
    );
    expect(panels[0].getAttribute("aria-hidden")).not.toBe("true");
    expect(panels[1].getAttribute("aria-hidden")).toBe("true");
  });

  it("should keep inputs from non-active steps registered in the DOM", async () => {
    render(<MultipleSteps theme="system" />);
    const dialog = document.body.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    const inputs = dialog!.querySelectorAll("input[name]");
    // 3 source inputs: name, price, notes
    expect(inputs.length).toBeGreaterThanOrEqual(3);
  });

  it("should show only a Next button on the first step (no Back)", async () => {
    const screen = render(<MultipleSteps theme="system" />);
    await expect
      .element(screen.getByRole("button", { name: /next/i }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /back/i }))
      .not.toBeInTheDocument();
  });

  it("should advance to step 2 when Next is clicked", async () => {
    const screen = render(<MultipleSteps theme="system" />);
    await screen.getByRole("button", { name: /next/i }).click();
    const dialog = document.body.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    const panels = dialog!.querySelectorAll('[role="group"][data-wizard-step]');
    expect((panels[0] as HTMLElement).style.display).toBe("none");
    expect((panels[1] as HTMLElement).style.display).not.toBe("none");
  });

  it("should show a Back button after advancing past the first step", async () => {
    const screen = render(<MultipleSteps theme="system" />);
    await screen.getByRole("button", { name: /next/i }).click();
    await expect
      .element(screen.getByRole("button", { name: /back/i }))
      .toBeInTheDocument();
  });

  it("should retreat to step 1 when Back is clicked", async () => {
    const screen = render(<MultipleSteps theme="system" />);
    await screen.getByRole("button", { name: /next/i }).click();
    await screen.getByRole("button", { name: /back/i }).click();
    const dialog = document.body.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    const panels = dialog!.querySelectorAll('[role="group"][data-wizard-step]');
    expect((panels[0] as HTMLElement).style.display).not.toBe("none");
  });

  it("should swap Next for Save on the last step", async () => {
    const screen = render(<MultipleSteps theme="system" />);
    await screen.getByRole("button", { name: /next/i }).click();
    await screen.getByRole("button", { name: /next/i }).click();
    await expect
      .element(screen.getByRole("button", { name: /save/i }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /next/i }))
      .not.toBeInTheDocument();
  });

  it("should not advance to next step when current step has invalid required field", async () => {
    const { getByRole } = render(<WithValidation theme="system" />);
    await getByRole("button", { name: /next/i }).click();
    const dialog = document.body.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    const panels = dialog!.querySelectorAll('[role="group"][data-wizard-step]');
    expect((panels[0] as HTMLElement).style.display).not.toBe("none");
  });

  it("should mark required input as aria-invalid after a blocked Next", async () => {
    const { getByRole } = render(<WithValidation theme="system" />);
    await getByRole("button", { name: /next/i }).click();
    const dialog = document.body.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    const invalid = dialog!.querySelector('[aria-invalid="true"]');
    expect(invalid).toBeTruthy();
  });

  it("should advance when required field is filled", async () => {
    const screen = render(<WithValidation theme="system" />);
    const nameInput = screen.getByRole("textbox", { name: /name/i });
    await nameInput.fill("Widget");
    await screen.getByRole("button", { name: /next/i }).click();
    const dialog = document.body.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    const panels = dialog!.querySelectorAll('[role="group"][data-wizard-step]');
    expect((panels[1] as HTMLElement).style.display).not.toBe("none");
  });

  it("should advance from an optional step even when its required field is empty", async () => {
    const { getByRole } = render(<OptionalStep theme="system" />);
    await getByRole("button", { name: /next/i }).click();
    const dialog = document.body.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    const panels = dialog!.querySelectorAll('[role="group"][data-wizard-step]');
    expect((panels[1] as HTMLElement).style.display).not.toBe("none");
  });

  it("should call onSubmit with form values and close the dialog on Save", async () => {
    const screen = render(<SubmitClosesDialog theme="system" />);
    await screen.getByRole("textbox", { name: /name/i }).fill("Widget");
    await screen.getByRole("button", { name: /next/i }).click();
    await screen.getByRole("textbox", { name: /notes/i }).fill("Cool product");
    await screen.getByRole("button", { name: /save/i }).click();
    // The dialog closes; the submitted payload is rendered
    await expect.element(screen.getByTestId("submitted")).toBeInTheDocument();
    await expect
      .element(screen.getByTestId("submitted"))
      .toHaveTextContent("Widget");
    await expect
      .element(screen.getByTestId("submitted"))
      .toHaveTextContent("Cool product");
  });
});
