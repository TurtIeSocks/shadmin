import type { PropsWithChildren } from "react";
import type { DataProvider } from "ra-core";
import { CoreAdminContext, RecordContextProvider, memoryStore } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import fakeRestProvider from "ra-data-fakerest";
import { TestMemoryRouter } from "ra-core";

import { ThemeProvider, SimpleForm, Create } from "@/components/admin";
import { realtimeDataProvider } from "@/components/realtime/realtime-data-provider";
import {
  fakeTransport,
  type FakeTransport,
} from "@/components/realtime/transports/fake-transport";
import type {
  LockProvider,
  RealtimeTransport,
} from "@/components/realtime/types";

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

export interface RealtimeStoryAdminProps extends StoryAdminProps {
  transport?: RealtimeTransport;
  locks?: LockProvider;
  baseDataProvider?: DataProvider;
}

export const RealtimeStoryAdmin = ({
  children,
  record,
  resource = "locations",
  mode = "field",
  transport,
  locks,
  baseDataProvider,
}: RealtimeStoryAdminProps) => {
  const effectiveTransport = transport ?? fakeTransport();
  const effectiveBase = baseDataProvider ?? fakeRestProvider({}, false);
  const dataProvider = realtimeDataProvider(effectiveBase, effectiveTransport, {
    locks,
  });
  return (
    <ThemeProvider>
      <TestMemoryRouter>
        <CoreAdminContext
          dataProvider={dataProvider}
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
};

export type { FakeTransport };
