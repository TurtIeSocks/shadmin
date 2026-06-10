import { CoreAdminContext } from "ra-core";
import { useEffect, type ReactNode } from "react";

import { Offline } from "@/components/admin/offline";
import { ThemeProvider } from "@/components/admin/theme-provider";
import { i18nProvider } from "@/lib/i18n-provider";

export default {
  title: "UI & Layout/Offline",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>
    <CoreAdminContext i18nProvider={i18nProvider}>{children}</CoreAdminContext>
  </ThemeProvider>
);

/**
 * Force the offline banner to render regardless of the real connectivity
 * state by overriding `navigator.onLine` and firing the matching event for
 * the duration of the story. This makes the visual easy to inspect in
 * Storybook without disconnecting the network.
 */
const useForceOnline = (online: boolean) => {
  useEffect(() => {
    if (typeof navigator === "undefined" || typeof window === "undefined") {
      return;
    }
    const descriptor = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(navigator),
      "onLine",
    );
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => online,
    });
    window.dispatchEvent(new Event(online ? "online" : "offline"));
    return () => {
      if (descriptor) {
        Object.defineProperty(navigator, "onLine", descriptor);
      } else {
        // Best-effort cleanup if no original descriptor existed.
        try {
          delete (navigator as unknown as { onLine?: boolean }).onLine;
        } catch {
          /* ignore */
        }
      }
      window.dispatchEvent(new Event("online"));
    };
  }, [online]);
};

const Demo = ({ online }: { online: boolean }) => {
  useForceOnline(online);
  return (
    <Wrapper>
      <div className="min-h-[200px] p-4 text-sm text-muted-foreground">
        Toggle the <code>online</code> control to render the default offline
        banner.
      </div>
      <Offline />
    </Wrapper>
  );
};

export const Basic = ({ online }: { online: boolean }) => (
  <Demo online={online} />
);

Basic.args = {
  online: false,
};

Basic.argTypes = {
  online: {
    control: { type: "boolean" },
  },
};

const CustomChildrenInner = ({ online }: { online: boolean }) => {
  useForceOnline(online);
  return (
    <Wrapper>
      <Offline className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-destructive text-sm">
        Working from cache — changes will sync once you reconnect.
      </Offline>
      <div className="p-4 text-sm text-muted-foreground">
        The custom content is only rendered when offline.
      </div>
    </Wrapper>
  );
};

export const CustomChildren = ({ online }: { online: boolean }) => (
  <CustomChildrenInner online={online} />
);

CustomChildren.args = {
  online: false,
};

CustomChildren.argTypes = {
  online: {
    control: { type: "boolean" },
  },
};
