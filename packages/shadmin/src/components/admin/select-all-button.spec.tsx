import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import {
  CoreAdminContext,
  ListContext,
  ResourceContextProvider,
  memoryStore,
} from "shadmin-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";

import { SelectAllButton } from "@/components/admin/select-all-button";
import { ThemeProvider } from "@/components/admin/theme-provider";
import { Basic, CustomLabel } from "./select-all-button.stories";

const ContextHarness = ({
  selectedIds,
  total,
  pageSize = 10,
  limit,
}: {
  selectedIds: number[];
  total: number | undefined;
  pageSize?: number;
  limit?: number;
}) => {
  const data = Array.from({ length: pageSize }).map((_, i) => ({
    id: i + 1,
  }));
  return (
    <ThemeProvider>
      <CoreAdminContext
        i18nProvider={polyglotI18nProvider(
          () => defaultMessages,
          "en",
          undefined,
          { allowMissing: true },
        )}
        store={memoryStore()}
      >
        <ResourceContextProvider value="posts">
          <ListContext.Provider
            value={
              {
                selectedIds,
                onSelect: () => {},
                onSelectAll: () => {},
                data,
                total,
              } as never
            }
          >
            <SelectAllButton limit={limit} />
          </ListContext.Provider>
        </ResourceContextProvider>
      </CoreAdminContext>
    </ThemeProvider>
  );
};

describe("<SelectAllButton />", () => {
  it("renders a Select All button when all current-page items are selected and more remain", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("button", { name: /select all/i }))
      .toBeInTheDocument();
  });

  it("renders the custom label when provided", async () => {
    const screen = render(<CustomLabel />);
    await expect
      .element(screen.getByRole("button", { name: /select everything/i }))
      .toBeInTheDocument();
  });

  it("is hidden when not all current-page items are selected", async () => {
    const screen = render(
      <ContextHarness selectedIds={[1, 2, 3]} total={50} />,
    );
    await expect
      .element(screen.getByRole("button", { name: /select all/i }))
      .not.toBeInTheDocument();
  });

  it("is hidden when total === selectedIds.length", async () => {
    const selectedIds = Array.from({ length: 10 }).map((_, i) => i + 1);
    const screen = render(
      <ContextHarness selectedIds={selectedIds} total={10} />,
    );
    await expect
      .element(screen.getByRole("button", { name: /select all/i }))
      .not.toBeInTheDocument();
  });

  it("is hidden when selectedIds.length >= limit", async () => {
    const selectedIds = Array.from({ length: 10 }).map((_, i) => i + 1);
    const screen = render(
      <ContextHarness selectedIds={selectedIds} total={500} limit={10} />,
    );
    await expect
      .element(screen.getByRole("button", { name: /select all/i }))
      .not.toBeInTheDocument();
  });

  it("is shown when total is undefined and all current-page items are selected", async () => {
    const selectedIds = Array.from({ length: 10 }).map((_, i) => i + 1);
    const screen = render(
      <ContextHarness selectedIds={selectedIds} total={undefined} />,
    );
    await expect
      .element(screen.getByRole("button", { name: /select all/i }))
      .toBeInTheDocument();
  });
});
