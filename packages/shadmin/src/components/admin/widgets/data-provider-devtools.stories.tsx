import { useEffect } from "react";
import {
  CoreAdminContext,
  ResourceContextProvider,
  TestMemoryRouter,
  memoryStore,
  useDataProvider,
} from "shadmin-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import fakeRestProvider from "ra-data-fakerest";
import { ThemeProvider } from "@/components/admin";
import { DataProviderDevtools } from "@/components/admin/widgets/data-provider-devtools";

const i18nProvider = polyglotI18nProvider(() => englishMessages);

const records = {
  posts: [
    { id: 1, title: "First post" },
    { id: 2, title: "Second post" },
  ],
};

const DemoCaller = () => {
  const dataProvider = useDataProvider();
  useEffect(() => {
    dataProvider.getList("posts", {
      pagination: { page: 1, perPage: 10 },
      sort: { field: "id", order: "ASC" },
      filter: {},
    });
    dataProvider.getOne("posts", { id: 1 });
  }, [dataProvider]);
  return <div data-demo-caller>Triggered 2 calls</div>;
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <TestMemoryRouter>
      <CoreAdminContext
        dataProvider={fakeRestProvider(records, false)}
        i18nProvider={i18nProvider}
        store={memoryStore()}
      >
        <ResourceContextProvider value="posts">
          {children}
        </ResourceContextProvider>
      </CoreAdminContext>
    </TestMemoryRouter>
  </ThemeProvider>
);

export default { title: "Extras/DataProviderDevtools" };

export const Basic = () => (
  <Wrapper>
    <DataProviderDevtools>
      <DemoCaller />
    </DataProviderDevtools>
  </Wrapper>
);

export const Hidden = () => (
  <Wrapper>
    <DataProviderDevtools defaultOpen={false}>
      <DemoCaller />
    </DataProviderDevtools>
  </Wrapper>
);

export const CustomLimit = () => (
  <Wrapper>
    <DataProviderDevtools maxLogs={10}>
      <DemoCaller />
    </DataProviderDevtools>
  </Wrapper>
);
