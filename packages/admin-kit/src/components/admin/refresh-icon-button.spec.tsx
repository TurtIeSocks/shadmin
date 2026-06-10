import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  CustomLabel,
  Default,
} from "./refresh-icon-button.stories";
import { RefreshIconButton } from "@/components/admin/refresh-icon-button";
import { ThemeProvider } from "@/components/admin/theme-provider";
import { CoreAdminContext, memoryStore } from "ra-core";
import { MemoryRouter } from "react-router";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import { vi } from "vitest";

describe("<RefreshIconButton />", () => {
  it("renders an accessible refresh icon button", async () => {
    const screen = render(<Default />);
    await expect
      .element(screen.getByRole("button", { name: /refresh/i }))
      .toBeInTheDocument();
  });

  it("preserves a user-supplied literal label", async () => {
    const screen = render(<CustomLabel />);
    await expect
      .element(screen.getByRole("button", { name: /reload data/i }))
      .toBeInTheDocument();
  });

  it("invokes the onClick handler when the button is clicked", async () => {
    const handleClick = vi.fn();
    const i18nProvider = polyglotI18nProvider(
      () => englishMessages,
      "en",
      undefined,
      { allowMissing: true },
    );
    const screen = render(
      <MemoryRouter>
        <ThemeProvider>
          <CoreAdminContext i18nProvider={i18nProvider} store={memoryStore()}>
            <RefreshIconButton onClick={handleClick} />
          </CoreAdminContext>
        </ThemeProvider>
      </MemoryRouter>,
    );
    await screen.getByRole("button", { name: /refresh/i }).click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
