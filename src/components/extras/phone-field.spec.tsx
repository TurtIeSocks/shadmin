import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Empty,
  International,
  NoLink,
} from "@/stories/extras/phone-field.stories";

describe("<PhoneField />", () => {
  it("renders a tel: link with national format for a US number", async () => {
    const screen = render(<Basic />);
    const link = screen.container.querySelector("a") as HTMLAnchorElement;
    expect(link.href).toBe("tel:+14155552671");
    await expect.element(screen.getByText(/415.*555.*2671/)).toBeInTheDocument();
  });

  it("renders international format when displayFormat='international'", async () => {
    const screen = render(<International />);
    await expect.element(screen.getByText(/\+44 20 7123 4567/)).toBeInTheDocument();
  });

  it("renders a plain <span> when link=false", async () => {
    const screen = render(<NoLink />);
    expect(screen.container.querySelector("a")).toBeNull();
  });

  it("renders empty fallback for null", async () => {
    const screen = render(<Empty />);
    await expect.element(screen.getByText("—")).toBeInTheDocument();
  });
});
