import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

// Mock the hook from ra-supabase-core. The form only uses the mutation tuple's
// second element; mutateAsync is a no-op resolved promise so the form renders
// without contacting Supabase.
const { mutateAsync } = vi.hoisted(() => ({
  mutateAsync: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("ra-supabase-core", () => ({
  useResetPassword: () => [{} as never, { mutateAsync }],
}));

import { Default } from "./forgot-password-page.stories";

describe("<ForgotPasswordPage />", () => {
  it("renders the password-reset form with email field and submit button", async () => {
    const screen = render(<Default />);
    await expect.element(screen.getByLabelText(/Email/)).toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /Reset password/ }))
      .toBeInTheDocument();
  });

  it("renders the back-to-login link", async () => {
    const screen = render(<Default />);
    await expect
      .element(screen.getByRole("link", { name: /Back to login/ }))
      .toBeInTheDocument();
  });
});
