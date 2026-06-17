import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  CustomTitle,
  NoBreadcrumb,
} from "@/components/admin/views/create.stories";

describe("<Create />", () => {
  it("renders the create form with empty inputs and a Save button", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByLabelText(/^title$/i)).toBeInTheDocument();
    await expect.element(screen.getByLabelText(/^title$/i)).toHaveValue("");
    await expect
      .element(screen.getByRole("button", { name: /save/i }))
      .toBeInTheDocument();
  });

  it("renders the explicit title when provided", async () => {
    const screen = render(<CustomTitle />);
    await expect.element(screen.getByText("New blog post")).toBeInTheDocument();
  });

  it("hides the breadcrumb when disableBreadcrumb is set", async () => {
    const screen = render(<NoBreadcrumb />);
    await expect.element(screen.getByLabelText(/^title$/i)).toBeInTheDocument();
    // The Breadcrumb component renders a <nav> with aria-label.
    const breadcrumb = screen.container.querySelector(
      'nav[aria-label="breadcrumb"]',
    );
    expect(breadcrumb).toBeNull();
  });
});
