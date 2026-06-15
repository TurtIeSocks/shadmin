import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, CustomLabel, WithRender } from "./record-field.stories";

describe("<RecordField />", () => {
  it("renders the source label and value for each field", async () => {
    const screen = render(<Basic />);
    // Three fields with sources: title, reference, status
    await expect.element(screen.getByText("Hello world")).toBeInTheDocument();
    await expect.element(screen.getByText("REF-001")).toBeInTheDocument();
    await expect.element(screen.getByText("published")).toBeInTheDocument();
  });

  it("uses the custom label when provided", async () => {
    const screen = render(<CustomLabel />);
    await expect.element(screen.getByText("Ref.")).toBeInTheDocument();
    await expect.element(screen.getByText("Title")).toBeInTheDocument();
  });

  it("renders the value returned by the render prop", async () => {
    const screen = render(<WithRender />);
    await expect.element(screen.getByText("100x200")).toBeInTheDocument();
    await expect.element(screen.getByText("$49.99")).toBeInTheDocument();
  });
});
