import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Empty,
  Half,
  MaxTen,
  WithCount,
} from "./rating-field.stories";

describe("<RatingField />", () => {
  it("renders 5 stars with 3 filled by default", async () => {
    const screen = render(<Basic />);
    const stars = screen.container.querySelectorAll("[data-rating-star]");
    expect(stars.length).toBe(5);
    const filled = screen.container.querySelectorAll(
      "[data-rating-star='filled']",
    );
    expect(filled.length).toBe(3);
  });

  it("renders 7 stars filled out of 10 when max=10", async () => {
    const screen = render(<MaxTen />);
    const stars = screen.container.querySelectorAll("[data-rating-star]");
    expect(stars.length).toBe(10);
    expect(
      screen.container.querySelectorAll("[data-rating-star='filled']").length,
    ).toBe(7);
  });

  it("renders a half star when allowHalf and value=2.5", async () => {
    const screen = render(<Half />);
    expect(
      screen.container.querySelectorAll("[data-rating-star='half']").length,
    ).toBe(1);
    expect(
      screen.container.querySelectorAll("[data-rating-star='filled']").length,
    ).toBe(2);
  });

  it("renders the count when countSource is set", async () => {
    const screen = render(<WithCount />);
    await expect.element(screen.getByText("(128)")).toBeInTheDocument();
  });

  it("renders the empty fallback when value is null", async () => {
    const screen = render(<Empty />);
    await expect.element(screen.getByText("—")).toBeInTheDocument();
  });
});
