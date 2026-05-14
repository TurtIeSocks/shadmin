import { useState } from "react";
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

const todayAt = (h: number) => {
  const d = new Date(today);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
};

const weekData = {
  events: [
    { id: 1, title: "Standup", start_at: todayAt(9) },
    { id: 2, title: "Lunch", start_at: todayAt(12) },
  ],
};

const weekDataProvider = fakeRestDataProvider(weekData) as DataProvider;

export const Week = () => (
  <TestMemoryRouter initialEntries={["/events"]}>
    <Admin
      dataProvider={weekDataProvider}
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
              defaultView="week"
            />
          </List>
        )}
        recordRepresentation="title"
      />
    </Admin>
  </TestMemoryRouter>
);

export const Interactions = () => {
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const [slotISO, setSlotISO] = useState<string | null>(null);
  return (
    <TestMemoryRouter initialEntries={["/events"]}>
      <Admin
        dataProvider={dataProvider}
        i18nProvider={i18nProvider}
        store={memoryStore()}
      >
        <Resource
          name="events"
          list={() => (
            <div>
              <List perPage={500}>
                <CalendarList
                  startSource="start_at"
                  titleSource="title"
                  onSelectEvent={(record) => setSelectedId(record.id)}
                  onSelectSlot={(slot) => setSlotISO(slot.startISO)}
                />
              </List>
              <div data-testid="selected-event">{selectedId ?? ""}</div>
              <div data-testid="selected-slot">{slotISO ?? ""}</div>
            </div>
          )}
          recordRepresentation="title"
        />
      </Admin>
    </TestMemoryRouter>
  );
};

export const Drag = () => {
  const [lastDrop, setLastDrop] = useState<string | null>(null);
  return (
    <TestMemoryRouter initialEntries={["/events"]}>
      <Admin
        dataProvider={dataProvider}
        i18nProvider={i18nProvider}
        store={memoryStore()}
      >
        <Resource
          name="events"
          list={() => (
            <div>
              <List perPage={500}>
                <CalendarList
                  startSource="start_at"
                  titleSource="title"
                  onDrop={async (record, range) => {
                    setLastDrop(`${record.id}@${range.start}`);
                  }}
                />
              </List>
              <div data-testid="last-drop">{lastDrop ?? ""}</div>
            </div>
          )}
          recordRepresentation="title"
        />
      </Admin>
    </TestMemoryRouter>
  );
};
