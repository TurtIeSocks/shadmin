import { type DataProvider, memoryStore, Resource, TestMemoryRouter } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import fakeRestDataProvider from "ra-data-fakerest";
import { Admin, CalendarList } from "@/components/admin";
import { List } from "@/components/admin/list";

// Seed events: a few records on today and surrounding days
const today = new Date();
const iso = (d: Date) => d.toISOString();
const addDaysLocal = (d: Date, n: number) => {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + n);
  return nd;
};

const data = {
  events: [
    { id: 1, title: "Standup", start_at: iso(today), status: "open" },
    { id: 2, title: "Demo", start_at: iso(addDaysLocal(today, 1)), status: "confirmed" },
    { id: 3, title: "Retro", start_at: iso(addDaysLocal(today, -1)), status: "open" },
  ],
};

const dataProvider = fakeRestDataProvider(data) as DataProvider;
const i18nProvider = polyglotI18nProvider(() => defaultMessages, "en", undefined, {
  allowMissing: true,
});

export default {
  title: "Views/CalendarList",
  parameters: { docs: { codePanel: true } },
};

const farPast = new Date(today);
farPast.setFullYear(farPast.getFullYear() - 1);

const farFuture = new Date(today);
farFuture.setFullYear(farFuture.getFullYear() + 1);

const rangeData = {
  events: [
    { id: 1, title: "Standup", start_at: iso(today) },
    { id: 2, title: "PastEvent", start_at: iso(farPast) },
    { id: 3, title: "FutureEvent", start_at: iso(farFuture) },
  ],
};

const rangeDataProvider = fakeRestDataProvider(rangeData) as DataProvider;

export const RangeLoading = () => (
  <TestMemoryRouter initialEntries={["/events"]}>
    <Admin
      dataProvider={rangeDataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="events"
        list={() => (
          <List perPage={500}>
            <CalendarList startSource="start_at" titleSource="title" />
          </List>
        )}
        recordRepresentation="title"
      />
    </Admin>
  </TestMemoryRouter>
);

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/events"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="events"
        list={() => (
          <List perPage={500}>
            <CalendarList startSource="start_at" titleSource="title" />
          </List>
        )}
        recordRepresentation="title"
      />
    </Admin>
  </TestMemoryRouter>
);

export const Navigation = Basic;

export const Agenda = () => (
  <TestMemoryRouter initialEntries={["/events"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="events"
        list={() => (
          <List perPage={500}>
            <CalendarList
              startSource="start_at"
              titleSource="title"
              defaultView="agenda"
            />
          </List>
        )}
        recordRepresentation="title"
      />
    </Admin>
  </TestMemoryRouter>
);
