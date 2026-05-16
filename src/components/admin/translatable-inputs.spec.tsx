import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/admin/translatable-inputs.stories";

describe("<TranslatableInputs />", () => {
  it("renders a tab for each declared locale", async () => {
    const screen = render(<Basic theme="system" />);
    // The story passes locales={["en", "fr", "tlh"]} — each becomes a TabsTrigger
    // labelled with the capitalized locale code.
    await expect
      .element(screen.getByRole("tab", { name: "En" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("tab", { name: "Fr" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("tab", { name: "Tlh" }))
      .toBeInTheDocument();
  });

  it("renders inputs prefilled with the per-locale values from the record", async () => {
    const screen = render(<Basic theme="system" />);
    // All locale tabs are mounted (TabsContent uses forceMount); each renders
    // its own input prefilled with the matching locale value from the record:
    // { en: "Hello", fr: "Bonjour", tlh: "nuqneH" }.
    const textboxes = await screen.getByRole("textbox").all();
    const values = textboxes.map(
      (tb) => (tb.element() as HTMLInputElement).value,
    );
    expect(values).toEqual(
      expect.arrayContaining(["Hello", "Bonjour", "nuqneH"]),
    );
  });
});
