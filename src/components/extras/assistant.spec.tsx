import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "@vitest/browser/context";
import { Basic } from "@/stories/extras/assistant.stories";

describe("<Assistant />", () => {
  it("opens the panel and echoes user input", async () => {
    const screen = render(<Basic />);
    // Click trigger
    await screen.getByRole("button", { name: /ask/i }).click();
    await expect
      .element(document.querySelector('[data-slot="assistant-panel"]'))
      .toBeTruthy();
    // Type and submit
    const input = document.querySelector(
      '[data-slot="assistant-input"]',
    ) as HTMLInputElement;
    input.focus();
    await userEvent.type(input, "Hello");
    await userEvent.keyboard("{Enter}");
    // Wait for echoed reply
    await expect
      .element(screen.getByText(/Echo: Hello/i))
      .toBeInTheDocument();
  });
});
