import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  DefaultCountryUS,
  Disabled,
  RestrictedCountries,
} from "./phone-input.stories";

describe("<PhoneInput />", () => {
  it("renders a tel input with the value formatted for the country", async () => {
    const screen = render(<Basic />);
    const input = screen.container.querySelector(
      "input[type='tel']",
    ) as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value.replace(/\D/g, "")).toContain("4155552671");
  });

  it("renders a country selector with all countries by default", async () => {
    const screen = render(<DefaultCountryUS />);
    const select = screen.container.querySelector(
      "select[data-country-select]",
    ) as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.value).toBe("US");
  });

  it("limits country options when allowedCountries is set", async () => {
    const screen = render(<RestrictedCountries />);
    const select = screen.container.querySelector(
      "select[data-country-select]",
    ) as HTMLSelectElement;
    expect(select.options.length).toBe(3);
  });

  it("disables both country and number inputs when disabled prop is set", async () => {
    const screen = render(<Disabled />);
    const select = screen.container.querySelector(
      "select[data-country-select]",
    ) as HTMLSelectElement;
    const input = screen.container.querySelector(
      "input[type='tel']",
    ) as HTMLInputElement;
    expect(select.disabled).toBe(true);
    expect(input.disabled).toBe(true);
  });
});
