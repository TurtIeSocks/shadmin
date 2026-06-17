import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  AutoLabel,
  CustomLabel,
  HiddenLabel,
  FullWidth,
  NoDoubleLabel,
} from "@/components/admin/views/labeled.stories";

describe("<Labeled />", () => {
  it("should render the field value", async () => {
    const { container } = render(<AutoLabel />);
    expect(container.textContent).toContain("War and Peace");
  });

  it("should render a label derived from the source prop", async () => {
    const { container } = render(<AutoLabel />);
    // FieldTitle humanizes "title" → "Title"
    expect(container.textContent).toMatch(/title/i);
  });

  it("should render a custom label when provided", async () => {
    const { container } = render(<CustomLabel />);
    expect(container.textContent).toContain("Book title");
    expect(container.textContent).toContain("Author name");
  });

  it("should not render a label when label={false}", async () => {
    const { container } = render(<HiddenLabel />);
    // The label span should not exist
    const labelSpan = container.querySelector("span.text-xs");
    expect(labelSpan).toBeFalsy();
  });

  it("should add w-full class when fullWidth is set", async () => {
    const { container } = render(<FullWidth />);
    const wrapper = container.querySelector(".inline-flex");
    expect(wrapper?.classList.contains("w-full")).toBe(true);
  });

  it("should not produce a double label for nested Labeled components", async () => {
    const { container } = render(<NoDoubleLabel />);
    // Should have exactly one label element (the outer Labeled's label)
    const labels = container.querySelectorAll("label.text-xs");
    expect(labels.length).toBe(1);
  });
});
