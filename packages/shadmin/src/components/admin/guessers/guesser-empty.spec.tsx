import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  English,
} from "@/components/admin/guessers/guesser-empty.stories";

describe("<GuesserEmpty />", () => {
  it("falls back to the raw translation keys when no i18n provider is available", async () => {
    const screen = render(<Basic theme="system" />);
    // The Basic story doesn't wrap in an I18nContextProvider, so useTranslate
    // returns the keys unchanged.
    await expect
      .element(screen.getByText("ra.guesser.empty.title"))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("ra.guesser.empty.message"))
      .toBeInTheDocument();
  });

  it("renders the English title and message when wrapped in an English i18n provider", async () => {
    const screen = render(<English theme="system" />);
    await expect
      .element(screen.getByText(/no data to display/i))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText(/please check your data provider/i))
      .toBeInTheDocument();
  });
});
