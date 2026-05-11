import { CoreAdminContext } from "ra-core";
import type { ReactNode } from "react";

import { ApplicationUpdatedNotification } from "@/components/admin/application-updated-notification";
import { CheckForApplicationUpdate } from "@/components/admin/check-for-application-update";
import { ThemeProvider } from "@/components/admin/theme-provider";
import { i18nProvider } from "@/lib/i18nProvider";

/**
 * `<CheckForApplicationUpdate>` polls a URL and shows a notification when the
 * response body changes — this is hard to demonstrate inside Storybook because
 * it requires a real polling URL and a deploy. This story therefore renders
 * the notification directly via the `notification` prop and disables polling.
 */
export default {
  title: "Layout/CheckForApplicationUpdate",
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
      In a real app, mount{" "}
      <code>{"<CheckForApplicationUpdate />"}</code> at the root of the layout.
      It will poll <code>/index.html</code> every minute and surface a reload
      banner when the hash of the response changes.
    </div>
    {/* Disabled here to avoid real network polling inside Storybook. */}
    <CheckForApplicationUpdate disabled />
    {/* Render the notification directly for visual reference. */}
    <ApplicationUpdatedNotification onReload={() => {}} />
  </Wrapper>
);
