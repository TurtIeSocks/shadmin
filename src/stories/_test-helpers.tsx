import type { PropsWithChildren } from "react";
import { CoreAdminContext, RecordContextProvider, memoryStore } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import fakeRestProvider from "ra-data-fakerest";
import { TestMemoryRouter } from "ra-core";

import { ThemeProvider, SimpleForm, Create } from "@/components/admin";

const i18nProvider = polyglotI18nProvider(() => englishMessages);
const defaultDataProvider = fakeRestProvider({}, false);

export interface StoryAdminProps extends PropsWithChildren {
  record?: Record<string, unknown>;
  resource?: string;
  mode?: "field" | "form";
}

export const StoryAdmin = ({
  children,
  record,
  resource = "locations",
  mode = "field",
}: StoryAdminProps) => (
  <ThemeProvider>
    <TestMemoryRouter>
      <CoreAdminContext
        dataProvider={defaultDataProvider}
        i18nProvider={i18nProvider}
        store={memoryStore()}
      >
        {mode === "form" ? (
          <Create resource={resource}>
            <SimpleForm toolbar={false} defaultValues={record}>
              {children}
            </SimpleForm>
          </Create>
        ) : (
          <RecordContextProvider value={record}>
            {children}
          </RecordContextProvider>
        )}
      </CoreAdminContext>
    </TestMemoryRouter>
  </ThemeProvider>
);
