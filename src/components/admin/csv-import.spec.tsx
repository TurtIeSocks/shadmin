import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Basic } from "@/stories/csv-import.stories";

describe("<CsvImport />", () => {
  it("renders an Import button", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByRole("button", { name: /import/i })).toBeInTheDocument();
  });
});
