import {
  CoreAdminContext,
  ResourceContextProvider,
  TestMemoryRouter,
} from "shadmin-core";
import fakeRestProvider from "ra-data-fakerest";
import { Count, ThemeProvider } from "@/components/admin";
import { i18nProvider } from "@/lib/i18n-provider";
import type { PropsWithChildren } from "react";

export default { title: "Data Display/Count" };

const dataProvider = fakeRestProvider(
  {
    posts: [
      { id: 1, title: "Post 1", published: true },
      { id: 2, title: "Post 2", published: true },
      { id: 3, title: "Draft", published: false },
    ],
  },
  false,
);

const Wrapper = ({ children }: PropsWithChildren) => (
  <ThemeProvider>
    <TestMemoryRouter>
      <CoreAdminContext dataProvider={dataProvider} i18nProvider={i18nProvider}>
        <ResourceContextProvider value="posts">
          {children}
        </ResourceContextProvider>
      </CoreAdminContext>
    </TestMemoryRouter>
  </ThemeProvider>
);

export const Basic = () => (
  <Wrapper>
    <Count />
  </Wrapper>
);

export const WithFilter = () => (
  <Wrapper>
    <Count filter={{ published: true }} />
  </Wrapper>
);

export const ExplicitResource = () => (
  <Wrapper>
    <Count resource="posts" />
  </Wrapper>
);

export const AsLink = () => (
  <Wrapper>
    <Count link />
  </Wrapper>
);
