import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { InputHelperText } from "@/components/admin/common/input-helper-text";
import { render } from "vitest-browser-react";
import { MemoryRouter } from "react-router";

const TestWrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <div role="group">{children}</div>
  </MemoryRouter>
);

describe("InputHelperText", () => {
  it("should render helper text when provided", async () => {
    const screen = render(<InputHelperText helperText={"helper text"} />, {
      wrapper: TestWrapper,
    });

    await expect.element(screen.getByText("helper text")).toBeInTheDocument();
  });

  it("should not render anything when helperText is not provided", async () => {
    const screen = render(<InputHelperText />, {
      wrapper: TestWrapper,
    });
    await expect.element(screen.getByRole("group")).toBeEmptyDOMElement();
  });
});
