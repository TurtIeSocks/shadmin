import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  NoToolbar,
  CustomToolbar,
} from "@/components/admin/form/simple-form.stories";

describe("<SimpleForm />", () => {
  it("renders every declared input plus the default Save button", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByLabelText(/^title$/i)).toBeInTheDocument();
    await expect.element(screen.getByLabelText(/^body$/i)).toBeInTheDocument();
    await expect
      .element(screen.getByLabelText(/^published$/i))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /save/i }))
      .toBeInTheDocument();
  });

  it("omits the default toolbar when toolbar={false}", async () => {
    const screen = render(<NoToolbar />);
    await expect.element(screen.getByLabelText(/^title$/i)).toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /^save$/i }))
      .not.toBeInTheDocument();
  });

  it("renders the custom toolbar with the custom Publish label", async () => {
    const screen = render(<CustomToolbar />);
    await expect
      .element(screen.getByRole("button", { name: /publish/i }))
      .toBeInTheDocument();
  });
});
