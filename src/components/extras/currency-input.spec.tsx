import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  AllowCurrencyChange,
  Basic,
  Disabled,
  MinorUnits,
} from "@/stories/extras/currency-input.stories";

describe("<CurrencyInput />", () => {
  it("renders a number input with the USD symbol", async () => {
    const screen = render(<Basic />);
    const input = screen.container.querySelector("input[type='number']") as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value).toBe("1234.5");
    await expect.element(screen.getByText("$")).toBeInTheDocument();
  });

  it("renders a currency selector when currencies array is set", async () => {
    const screen = render(<AllowCurrencyChange />);
    const select = screen.container.querySelector("select[data-currency-select]") as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.value).toBe("EUR");
  });

  it("displays a divided major value when storeAsMinorUnits=true", async () => {
    const screen = render(<MinorUnits />);
    const input = screen.container.querySelector("input[type='number']") as HTMLInputElement;
    expect(input.value).toBe("123.45");
  });

  it("respects the disabled prop", async () => {
    const screen = render(<Disabled />);
    const input = screen.container.querySelector("input[type='number']") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});
