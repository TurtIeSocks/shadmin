import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Disabled,
  HalfStep,
  Max10,
  NoLabel,
} from "@/stories/admin/rating-input.stories";

describe("<RatingInput />", () => {
  it("renders five radio inputs labelled by source", async () => {
    const screen = render(<Basic />);
    const stars = screen.container.querySelectorAll("[role='radio']");
    expect(stars.length).toBe(5);
    await expect.element(screen.getByText(/^rating$/i)).toBeInTheDocument();
  });

  it("shows 10 stars when max=10", async () => {
    const screen = render(<Max10 />);
    const stars = screen.container.querySelectorAll("[role='radio']");
    expect(stars.length).toBe(10);
  });

  it("renders half-step inputs when allowHalf", async () => {
    const screen = render(<HalfStep />);
    const stars = screen.container.querySelectorAll("[role='radio']");
    expect(stars.length).toBe(10);
  });

  it("respects the disabled prop", async () => {
    const screen = render(<Disabled />);
    const star = screen.container.querySelector("[role='radio']");
    expect(star?.getAttribute("aria-disabled")).toBe("true");
  });

  it("hides the label when label=false", async () => {
    const screen = render(<NoLabel />);
    await expect.element(screen.getByText(/^rating$/i)).not.toBeInTheDocument();
  });
});
