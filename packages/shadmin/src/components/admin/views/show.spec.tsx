import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  CustomTitle,
  NoActions,
} from "@/components/admin/views/show.stories";

describe("<Show />", () => {
  it("renders the record's fields once loaded", async () => {
    const screen = render(<Basic />);
    // "Hello world" appears in the breadcrumb, the page heading, and the
    // title field; assert on the unique body content instead.
    await expect
      .element(screen.getByText("Lorem ipsum dolor sit amet"))
      .toBeInTheDocument();
    // The id field renders the raw number.
    await expect.element(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders the explicit title when provided", async () => {
    const screen = render(<CustomTitle />);
    await expect.element(screen.getByText("Post details")).toBeInTheDocument();
  });

  it("does not render the default action buttons when actions={false}", async () => {
    const screen = render(<NoActions />);
    await expect
      .element(screen.getByText("Lorem ipsum dolor sit amet"))
      .toBeInTheDocument();
    // Default actions include an Edit link.
    await expect
      .element(screen.getByRole("link", { name: /edit/i }))
      .not.toBeInTheDocument();
  });
});
