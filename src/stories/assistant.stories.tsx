import { Admin, Assistant, echoTransport } from "@/components/admin";
import {
  type DataProvider,
  memoryStore,
  Resource,
  TestMemoryRouter,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import fakeRestDataProvider from "ra-data-fakerest";

const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  { allowMissing: true },
);

export default {
  title: "Display/Assistant",
  parameters: { docs: { codePanel: true } },
};

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/"]}>
    <Admin
      dataProvider={fakeRestDataProvider({}) as DataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="dummy"
        list={() => (
          <div className="p-4">
            <Assistant transport={echoTransport} />
          </div>
        )}
      />
    </Admin>
  </TestMemoryRouter>
);

export const BottomLeft = () => (
  <TestMemoryRouter initialEntries={["/"]}>
    <Admin
      dataProvider={fakeRestDataProvider({}) as DataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="dummy"
        list={() => (
          <div className="p-4">
            <Assistant transport={echoTransport} placement="bottom-left" />
          </div>
        )}
      />
    </Admin>
  </TestMemoryRouter>
);

export const SidebarPlacement = () => (
  <TestMemoryRouter initialEntries={["/"]}>
    <Admin
      dataProvider={fakeRestDataProvider({}) as DataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="dummy"
        list={() => (
          <div className="p-4">
            <Assistant transport={echoTransport} placement="sidebar" />
          </div>
        )}
      />
    </Admin>
  </TestMemoryRouter>
);

export const WithTools = () => {
  const transport = echoTransport;
  return (
    <TestMemoryRouter initialEntries={["/"]}>
      <Admin
        dataProvider={fakeRestDataProvider({}) as DataProvider}
        i18nProvider={i18nProvider}
        store={memoryStore()}
      >
        <Resource
          name="dummy"
          list={() => (
            <div className="p-4">
              <Assistant
                transport={transport}
                tools={{
                  greet: {
                    description: "Greet a person by name",
                    parameters: { name: "string" },
                    handler: ({ name }) => `Hello, ${name}!`,
                  },
                }}
              />
            </div>
          )}
        />
      </Admin>
    </TestMemoryRouter>
  );
};
