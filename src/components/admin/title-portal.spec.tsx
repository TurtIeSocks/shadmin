import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Empty, WithTitle } from "@/stories/admin/title-portal.stories";

describe("<TitlePortal />", () => {
  it("renders the portal slot even when empty", async () => {
    render(<Empty />);
    const portal = document.getElementById("ra-title-portal");
    expect(portal).not.toBeNull();
  });

  it("receives a title rendered into the portal slot", async () => {
    const screen = render(<WithTitle />);
    await expect
      .element(screen.getByRole("heading", { name: /hello from a portal/i }))
      .toBeInTheDocument();
  });
});
