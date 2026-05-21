import { describe, expect, it, vi } from "vitest";
import { render, renderHook } from "vitest-browser-react";
import { useState, type PropsWithChildren } from "react";

import {
  ThemeProviderContext,
  type Theme,
} from "@/lib/themes/theme-context";
import { useResolvedTheme, useTheme } from "./use-theme";

const wrapper =
  (initialTheme: Theme = "light") =>
  ({ children }: PropsWithChildren) => {
    const ThemeWrapper = ({ children }: PropsWithChildren) => {
      const [theme, setTheme] = useState<Theme>(initialTheme);
      return (
        <ThemeProviderContext.Provider value={{ theme, setTheme }}>
          {children}
        </ThemeProviderContext.Provider>
      );
    };
    return <ThemeWrapper>{children}</ThemeWrapper>;
  };

describe("useTheme", () => {
  it("returns the current theme and a setter as a tuple", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: wrapper("dark"),
    });

    const [theme, setTheme] = result.current;
    expect(theme).toBe("dark");
    expect(typeof setTheme).toBe("function");
  });

  it("updates the theme when the setter is invoked", async () => {
    const Probe = () => {
      const [theme, setTheme] = useTheme();
      return (
        <>
          <span data-testid="theme">{theme}</span>
          <button type="button" onClick={() => setTheme("dark")}>
            switch
          </button>
        </>
      );
    };
    const screen = render(<Probe />, { wrapper: wrapper("light") });
    await expect.element(screen.getByTestId("theme")).toHaveTextContent("light");
    await screen.getByRole("button", { name: "switch" }).click();
    await expect.element(screen.getByTestId("theme")).toHaveTextContent("dark");
  });

});

describe("useResolvedTheme", () => {
  it("returns the theme as-is when not 'system'", () => {
    const { result } = renderHook(() => useResolvedTheme(), {
      wrapper: wrapper("dark"),
    });
    expect(result.current).toBe("dark");
  });

  it("resolves 'system' to 'dark' when prefers-color-scheme is dark", () => {
    const matchMediaSpy = vi
      .spyOn(window, "matchMedia")
      .mockImplementation(
        (query: string) =>
          ({
            matches: query === "(prefers-color-scheme: dark)",
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
          }) as MediaQueryList,
      );

    try {
      const { result } = renderHook(() => useResolvedTheme(), {
        wrapper: wrapper("system"),
      });
      expect(result.current).toBe("dark");
    } finally {
      matchMediaSpy.mockRestore();
    }
  });

  it("resolves 'system' to 'light' when prefers-color-scheme is light", () => {
    const matchMediaSpy = vi
      .spyOn(window, "matchMedia")
      .mockImplementation(
        (query: string) =>
          ({
            matches: false,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
          }) as MediaQueryList,
      );

    try {
      const { result } = renderHook(() => useResolvedTheme(), {
        wrapper: wrapper("system"),
      });
      expect(result.current).toBe("light");
    } finally {
      matchMediaSpy.mockRestore();
    }
  });
});
