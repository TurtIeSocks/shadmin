import { CoreAdminContext } from "shadmin-core";
import type { ReactNode } from "react";

import { ApplicationUpdatedNotification } from "@/components/admin/common/application-updated-notification";
import { ThemeProvider } from "@/components/admin/layout/theme-provider";
import { i18nProvider } from "@/lib/i18n-provider";

export default {
  title: "UI & Layout/ApplicationUpdatedNotification",
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

export const Basic = () => (
  <Wrapper>
    <div className="min-h-[200px] p-4 text-sm text-muted-foreground">
      The banner appears fixed near the bottom of the viewport.
    </div>
    <ApplicationUpdatedNotification onReload={() => {}} />
  </Wrapper>
);

export const CustomLabels = () => (
  <Wrapper>
    <div className="min-h-[200px] p-4 text-sm text-muted-foreground">
      Customize the message and the button label.
    </div>
    <ApplicationUpdatedNotification
      message="A shiny new version is ready."
      buttonLabel="Refresh now"
      onReload={() => {}}
    />
  </Wrapper>
);
