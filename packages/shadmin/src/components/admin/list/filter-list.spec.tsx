import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic as FilterListBasic } from "@/components/admin/list/filter-list.stories";
import { Basic as FilterListItemBasic } from "@/components/admin/list/filter-list-item.stories";
import { Basic as FilterListSectionBasic } from "@/components/admin/list/filter-list-section.stories";
import { Basic as FilterLiveFormBasic } from "@/components/extras/filter-live-form.stories";
import { Basic as FilterLiveSearchBasic } from "@/components/admin/list/filter-live-search.stories";

describe("<FilterList /> family", () => {
  it("renders FilterList with its items", async () => {
    const screen = render(<FilterListBasic />);
    await expect.element(screen.getByText("Status")).toBeInTheDocument();
    await expect.element(screen.getByText("Newsletter")).toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /Published/i }))
      .toBeInTheDocument();
  });

  it("renders FilterListItem inside a FilterList", async () => {
    const screen = render(<FilterListItemBasic />);
    await expect
      .element(screen.getByRole("button", { name: /Novel/i }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /Tale/i }))
      .toBeInTheDocument();
  });

  it("renders FilterListSection alongside FilterList", async () => {
    const screen = render(<FilterListSectionBasic />);
    await expect.element(screen.getByText("Title")).toBeInTheDocument();
    await expect.element(screen.getByText("Category")).toBeInTheDocument();
  });

  it("renders FilterLiveForm with text inputs", async () => {
    const screen = render(<FilterLiveFormBasic />);
    await expect
      .element(screen.getByPlaceholder("War and Peace"))
      .toBeInTheDocument();
  });

  it("renders FilterLiveSearch with a search input", async () => {
    const screen = render(<FilterLiveSearchBasic />);
    await expect
      .element(screen.getByPlaceholder(/search/i))
      .toBeInTheDocument();
  });
});
