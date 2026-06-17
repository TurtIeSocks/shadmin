import type { PropsWithChildren } from "react";
import { CoreAdminContext, memoryStore } from "shadmin-core";

import { ThemeProvider } from "@/components/admin";
import { ThemeStudio } from "@/components/extras/theme-studio";

export default {
  title: "Extras/ThemeStudio",
  parameters: { docs: { codePanel: true } },
};

// `ThemeProvider` uses ra-core's `useStore` for mode persistence, which only
// notifies subscribers once the surrounding `Store` has been `setup()`d.
// `CoreAdminContext` does that, so it must sit *outside* `ThemeProvider`
// (mirroring the order used in `<Admin>` itself).
const Wrapper = ({ children }: PropsWithChildren) => (
  <CoreAdminContext store={memoryStore()}>
    <ThemeProvider>{children}</ThemeProvider>
  </CoreAdminContext>
);

export const Basic = () => (
  <Wrapper>
    <div className="p-4">
      <p className="mb-2 text-sm text-muted-foreground">
        Background sample text — edit the variables to preview changes live.
      </p>
      <ThemeStudio />
    </div>
  </Wrapper>
);

export const NoExport = () => (
  <Wrapper>
    <div className="p-4">
      <p className="mb-2 text-sm text-muted-foreground">
        Export button hidden via <code>showExport=false</code>.
      </p>
      <ThemeStudio showExport={false} />
    </div>
  </Wrapper>
);

export const NoThemeToggle = () => (
  <Wrapper>
    <div className="p-4">
      <p className="mb-2 text-sm text-muted-foreground">
        Theme mode toggle hidden via <code>showThemeModeToggle=false</code>.
      </p>
      <ThemeStudio showThemeModeToggle={false} />
    </div>
  </Wrapper>
);
