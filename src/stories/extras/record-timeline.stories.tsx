import { type DataProvider, memoryStore, RecordContextProvider, Resource, TestMemoryRouter } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import fakeRestDataProvider from "ra-data-fakerest";
import { PlusIcon, EditIcon, TrashIcon } from "lucide-react";
import { Admin, RecordTimeline } from "@/components/admin";

const i18nProvider = polyglotI18nProvider(() => defaultMessages, "en", undefined, {
  allowMissing: true,
});

const explicitEntries = [
  { id: 1, message: "Created", timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), user: "alice", icon: PlusIcon },
  { id: 2, message: "Updated price", timestamp: new Date(Date.now() - 86400000).toISOString(), user: "bob", icon: EditIcon },
  { id: 3, message: "Deleted entry", timestamp: new Date().toISOString(), user: "carol", icon: TrashIcon },
];

export default {
  title: "Extras/RecordTimeline",
  parameters: { docs: { codePanel: true } },
};

export const ExplicitEntries = () => (
  <TestMemoryRouter initialEntries={["/"]}>
    <Admin
      dataProvider={fakeRestDataProvider({}) as DataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="ignored"
        list={() => (
          <div className="p-4">
            <RecordTimeline entries={explicitEntries} />
          </div>
        )}
      />
    </Admin>
  </TestMemoryRouter>
);

const auditData = {
  products: [{ id: 1, name: "Notebook" }],
  audit_logs: [
    { id: 10, record_id: 1, message: "Created product", created_at: new Date(Date.now() - 86400000).toISOString(), user_name: "alice", event_type: "created" },
    { id: 11, record_id: 1, message: "Updated price to $19.99", created_at: new Date().toISOString(), user_name: "bob", event_type: "updated" },
  ],
};

const auditProvider = fakeRestDataProvider(auditData) as DataProvider;

export const FromReference = () => (
  <TestMemoryRouter initialEntries={["/products/1/show"]}>
    <Admin
      dataProvider={auditProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="products"
        show={() => (
          <RecordContextProvider value={{ id: 1, name: "Notebook" }}>
            <RecordTimeline
              reference="audit_logs"
              target="record_id"
              iconSource="event_type"
              iconMap={{ created: PlusIcon, updated: EditIcon }}
              userSource="user_name"
            />
          </RecordContextProvider>
        )}
      />
    </Admin>
  </TestMemoryRouter>
);

export const Basic = ExplicitEntries;
