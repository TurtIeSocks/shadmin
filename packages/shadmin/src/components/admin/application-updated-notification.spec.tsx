import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { CoreAdminContext } from "ra-core";

import {
  Basic,
  CustomLabels,
} from "./application-updated-notification.stories";
import { ApplicationUpdatedNotification } from "@/components/admin/application-updated-notification";
import { ThemeProvider } from "@/components/admin/theme-provider";
import { i18nProvider } from "@/lib/i18n-provider";

describe("<ApplicationUpdatedNotification />", () => {
  it("renders the default update message and reload button", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByText(/a new version is available/i))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /reload/i }))
      .toBeInTheDocument();
  });

  it("renders custom message and button label", async () => {
    const screen = render(<CustomLabels />);
    await expect
      .element(screen.getByText("A shiny new version is ready."))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: "Refresh now" }))
      .toBeInTheDocument();
  });

  it("calls the onReload callback when the button is clicked", async () => {
    const onReload = vi.fn();
    const screen = render(
      <ThemeProvider>
        <CoreAdminContext i18nProvider={i18nProvider}>
          <ApplicationUpdatedNotification onReload={onReload} />
        </CoreAdminContext>
      </ThemeProvider>,
    );
    await screen.getByRole("button", { name: /reload/i }).click();
    expect(onReload).toHaveBeenCalledTimes(1);
  });
});
