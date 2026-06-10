import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

// Token state container so the MissingTokens story can swap return values for
// useSupabaseAccessToken without remounting the mock.
const { mutateAsync, tokenValues } = vi.hoisted(() => ({
  mutateAsync: vi.fn().mockResolvedValue(undefined),
  tokenValues: {
    access_token: "ACCESS" as string | undefined,
    refresh_token: "REFRESH" as string | undefined,
  },
}));

vi.mock("ra-supabase-core", () => ({
  useSetPassword: () => [{} as never, { mutateAsync }],
  useSupabaseAccessToken: ({
    parameterName,
  }: { parameterName?: string } = {}) =>
    tokenValues[
      (parameterName ?? "access_token") as "access_token" | "refresh_token"
    ],
}));

import {
  MissingTokens,
  WithTokens,
} from "./set-password-page.stories";

describe("<SetPasswordPage />", () => {
  it("renders the password and confirm fields when tokens are present", async () => {
    tokenValues.access_token = "ACCESS";
    tokenValues.refresh_token = "REFRESH";
    const screen = render(<WithTokens />);
    await expect
      .element(screen.getByLabelText("Password *", { exact: true }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByLabelText("Confirm password *", { exact: true }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /Save/ }))
      .toBeInTheDocument();
  });

  it("renders the missing-tokens message when tokens are absent", async () => {
    tokenValues.access_token = undefined;
    tokenValues.refresh_token = undefined;
    const screen = render(<MissingTokens />);
    await expect
      .element(screen.getByText(/Access and refresh tokens are missing/))
      .toBeInTheDocument();
    // Restore for any later test files that import this module's mocks.
    tokenValues.access_token = "ACCESS";
    tokenValues.refresh_token = "REFRESH";
  });
});
