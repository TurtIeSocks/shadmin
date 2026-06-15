import React from "react";
import {
  CoreAdminContext,
  RecordContextProvider,
  ResourceContextProvider,
  ResourceDefinitionContextProvider,
  memoryStore,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import fakeRestDataProvider from "ra-data-fakerest";
import { PrevNextButtons, ThemeProvider } from "@/components/admin";

export default {
  title: "Data Edition/PrevNextButtons",
};

const data = {
  posts: [
    { id: 1, title: "Hello world" },
    { id: 2, title: "Lorem ipsum" },
    { id: 3, title: "First post" },
  ],
};

const dataProvider = fakeRestDataProvider(data);

const Wrapper = ({
  children,
  recordId = 2,
}: React.PropsWithChildren<{ recordId?: number }>) => {
  const record = data.posts.find((p) => p.id === recordId);
  return (
    <MemoryRouter>
      <ThemeProvider>
        <CoreAdminContext
          dataProvider={dataProvider}
          i18nProvider={polyglotI18nProvider(
            () => defaultMessages,
            "en",
            undefined,
            { allowMissing: true },
          )}
          store={memoryStore()}
        >
          <ResourceDefinitionContextProvider
            definitions={{
              posts: {
                name: "posts",
                hasShow: true,
                hasEdit: true,
              },
            }}
          >
            <ResourceContextProvider value="posts">
              <RecordContextProvider value={record}>
                {children}
              </RecordContextProvider>
            </ResourceContextProvider>
          </ResourceDefinitionContextProvider>
        </CoreAdminContext>
      </ThemeProvider>
    </MemoryRouter>
  );
};

export const Default = () => (
  <Wrapper>
    <PrevNextButtons />
  </Wrapper>
);

export const LinkToShow = () => (
  <Wrapper>
    <PrevNextButtons linkType="show" />
  </Wrapper>
);

export const FirstRecord = () => (
  <Wrapper recordId={1}>
    <PrevNextButtons />
  </Wrapper>
);

export const LastRecord = () => (
  <Wrapper recordId={3}>
    <PrevNextButtons />
  </Wrapper>
);

export const Basic = Default;

export const WithRef = () => {
  const ref = React.useRef<HTMLElement>(null);
  return (
    <Wrapper>
      <PrevNextButtons ref={ref} />
    </Wrapper>
  );
};
