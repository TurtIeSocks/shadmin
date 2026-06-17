import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/components/admin/layout/dashboard-menu-item.stories";

describe("<DashboardMenuItem />", () => {
  it("renders a link to the dashboard with the translated label", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("link", { name: /dashboard/i }))
      .toBeInTheDocument();
  });
});
