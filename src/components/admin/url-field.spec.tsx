import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, NewTab, Empty } from "@/stories/admin/url-field.stories";

describe("<UrlField />", () => {
  it("renders the URL as a clickable anchor", async () => {
    const screen = render(<Basic />);
    const link = screen.getByRole("link", { name: "https://example.org" });
    await expect.element(link).toBeInTheDocument();
    await expect.element(link).toHaveAttribute("href", "https://example.org");
  });

  it("forwards the target attribute when provided", async () => {
    const screen = render(<NewTab />);
    const link = screen.getByRole("link", { name: "https://example.org" });
    await expect.element(link).toHaveAttribute("target", "_blank");
  });

  it("renders the empty placeholder when the URL is missing", async () => {
    const screen = render(<Empty />);
    await expect.element(screen.getByText("No website")).toBeInTheDocument();
  });
});
