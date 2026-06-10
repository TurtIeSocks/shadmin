import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Empty, WithTitle } from "./title-portal.stories";
import { TITLE_PORTAL_ID } from "@/lib/title-portal-id";

describe("<TitlePortal />", () => {
  it("renders the portal slot even when empty", async () => {
    render(<Empty />);
    const portal = document.getElementById(TITLE_PORTAL_ID);
    expect(portal).not.toBeNull();
  });

  it("receives a title rendered into the portal slot", async () => {
    const screen = render(<WithTitle />);
    await expect
      .element(screen.getByRole("heading", { name: /hello from a portal/i }))
      .toBeInTheDocument();
  });
});
