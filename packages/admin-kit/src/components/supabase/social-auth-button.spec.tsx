import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

// Hoisted login mock so we can assert call shape independent of which story
// instantiates the button. ra-core's useLogin is replaced for the whole file.
const { loginMock } = vi.hoisted(() => ({ loginMock: vi.fn() }));

vi.mock("ra-core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ra-core")>();
  return {
    ...actual,
    useLogin: () => loginMock,
  };
});

import {
  CustomProvider,
  Github,
  Google,
} from "./social-auth-button.stories";

describe("<SocialAuthButton />", () => {
  it("renders the GithubButton with the translated label", async () => {
    loginMock.mockClear();
    loginMock.mockResolvedValue(undefined);
    const screen = render(<Github />);
    await expect
      .element(screen.getByRole("button", { name: /Sign in with Github/ }))
      .toBeInTheDocument();
  });

  it("renders the GoogleButton with the translated label", async () => {
    loginMock.mockClear();
    loginMock.mockResolvedValue(undefined);
    const screen = render(<Google />);
    await expect
      .element(screen.getByRole("button", { name: /Sign in with Google/ }))
      .toBeInTheDocument();
  });

  it("calls login with the provider name on click", async () => {
    loginMock.mockClear();
    loginMock.mockResolvedValue(undefined);
    const screen = render(<Github />);
    await screen.getByRole("button", { name: /Sign in with Github/ }).click();
    // useLogin's returned function is called with (params, redirectTo). The
    // second arg defaults to the current window location when no redirect is
    // supplied, hence the loose string match.
    expect(loginMock).toHaveBeenCalledWith(
      { provider: "github" },
      expect.any(String),
    );
  });

  it("renders a custom provider button with custom label", async () => {
    loginMock.mockClear();
    loginMock.mockResolvedValue(undefined);
    const screen = render(<CustomProvider />);
    await expect
      .element(screen.getByRole("button", { name: /Custom Apple label/ }))
      .toBeInTheDocument();
    await screen.getByRole("button", { name: /Custom Apple label/ }).click();
    expect(loginMock).toHaveBeenCalledWith(
      { provider: "apple" },
      expect.any(String),
    );
  });
});
