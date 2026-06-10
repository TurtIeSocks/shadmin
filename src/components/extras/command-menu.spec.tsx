import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "@vitest/browser/context";
import {
  Basic,
  Hotkey,
  AdminShorthand,
  RecordSearch,
  BuiltinActions,
  RegisteredCommand,
  PermissionDenied,
  Recents,
} from "./command-menu.stories";

describe("<CommandMenu />", () => {
  it("renders the command dialog when opened", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("opens on cmd+k", async () => {
    const screen = render(<Hotkey />);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    await userEvent.keyboard("{Meta>}k{/Meta}");
    await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes on escape", async () => {
    const screen = render(<Hotkey />);
    await userEvent.keyboard("{Meta>}k{/Meta}");
    await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();
  });

  it("mounts via <AdminContext><CommandMenu><AdminUI/></CommandMenu></AdminContext>", async () => {
    const screen = render(<AdminShorthand />);
    await userEvent.keyboard("{Meta>}k{/Meta}");
    await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("lists resources and navigates to the list view on selection", async () => {
    const screen = render(<AdminShorthand />);
    await userEvent.keyboard("{Meta>}k{/Meta}");
    const productsItem = screen.getByRole("option", { name: /products/i });
    await expect.element(productsItem).toBeInTheDocument();
    await productsItem.click();
    // dialog should close after selection
    await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();
    // navigation must have fired
    await expect
      .element(screen.getByTestId("cm-location"))
      .toHaveTextContent("/products");
  });

  it("shows matched records and navigates to Show on select", async () => {
    const screen = render(<RecordSearch />);
    // Wait for debounced search to fire and render a result item
    const result = screen.getByRole("option", { name: /notebook/i });
    await expect.element(result).toBeInTheDocument();
    await result.click();
    await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();
    await expect
      .element(screen.getByTestId("cm-location"))
      .toHaveTextContent("/products/1/show");
  });

  it("renders built-in actions: refresh, theme, logout", async () => {
    const screen = render(<BuiltinActions />);
    await expect
      .element(screen.getByRole("option", { name: /refresh data/i }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("option", { name: /switch to light theme/i }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("option", { name: /switch to dark theme/i }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("option", { name: /use system theme/i }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("option", { name: /logout/i }))
      .toBeInTheDocument();
  });

  it("renders commands registered via useRegisterCommand", async () => {
    const screen = render(<RegisteredCommand />);
    await expect
      .element(screen.getByRole("option", { name: /duplicate product/i }))
      .toBeInTheDocument();
  });

  it("hides resources the user cannot list", async () => {
    const screen = render(<PermissionDenied />);
    await expect
      .element(screen.getByRole("option", { name: /products/i }))
      .toBeInTheDocument();
    // Orders is denied via canAccess — the option must not appear
    await expect
      .element(screen.getByRole("option", { name: /^orders$/i }))
      .not.toBeInTheDocument();
  });

  it("shows recents in the empty state", async () => {
    const screen = render(<Recents />);
    // The empty state (no query) renders the recents group
    await expect
      .element(screen.getByRole("option", { name: /notebook/i }))
      .toBeInTheDocument();
  });

  it("renders keyboard hint footer", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByText(/navigate/i, { exact: false }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText(/select/i, { exact: false }))
      .toBeInTheDocument();
  });

  it("renders inside a sheet on mobile", async () => {
    // Simulate small viewport before mount; useIsMobile reads window.innerWidth
    vi.stubGlobal("innerWidth", 500);
    window.dispatchEvent(new Event("resize"));
    render(<Basic />);
    // Sheet adds data-slot="sheet-content" — wait for it to mount
    await expect
      .poll(() => document.querySelector('[data-slot="sheet-content"]'))
      .toBeTruthy();
    vi.unstubAllGlobals();
  });
});
