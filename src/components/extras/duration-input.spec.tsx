import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Disabled,
  HoursMinutesOnly,
} from "@/stories/extras/duration-input.stories";

describe("<DurationInput />", () => {
  it("renders separate inputs for each unit (default d/h/m/s)", async () => {
    const screen = render(<Basic />);
    const inputs = screen.container.querySelectorAll("input[type='number']");
    expect(inputs.length).toBe(4);
  });

  it("only renders h/m inputs when units=['h','m']", async () => {
    const screen = render(<HoursMinutesOnly />);
    const inputs = screen.container.querySelectorAll("input[type='number']");
    expect(inputs.length).toBe(2);
    const m = (inputs[1] as HTMLInputElement).value;
    expect(m).toBe("45");
  });

  it("disables all unit inputs when disabled prop is set", async () => {
    const screen = render(<Disabled />);
    const inputs = screen.container.querySelectorAll("input[type='number']");
    Array.from(inputs).forEach((i) => expect((i as HTMLInputElement).disabled).toBe(true));
  });
});
