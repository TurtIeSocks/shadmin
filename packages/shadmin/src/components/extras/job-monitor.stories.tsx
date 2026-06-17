import {
  CoreAdminContext,
  ResourceContextProvider,
  TestMemoryRouter,
  memoryStore,
} from "shadmin-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import fakeRestProvider from "ra-data-fakerest";
import { ThemeProvider } from "@/components/admin";
import { JobMonitor } from "@/components/extras";

const i18nProvider = polyglotI18nProvider(() => englishMessages);

const now = Date.now();

const records = {
  jobs: [
    {
      id: 1,
      type: "send-email",
      status: "running",
      payload: { to: "alice@example.com" },
      attempts: 1,
      createdAt: new Date(now - 60_000).toISOString(),
    },
    {
      id: 2,
      type: "build-report",
      status: "queued",
      payload: { reportId: "weekly-42" },
      attempts: 0,
      createdAt: new Date(now - 30_000).toISOString(),
    },
    {
      id: 3,
      type: "sync-inventory",
      status: "failed",
      payload: { warehouseId: "WH-1" },
      attempts: 3,
      lastError: "ETIMEDOUT contacting upstream",
      createdAt: new Date(now - 300_000).toISOString(),
    },
    {
      id: 4,
      type: "purge-old",
      status: "done",
      payload: { ttlDays: 90 },
      attempts: 1,
      createdAt: new Date(now - 600_000).toISOString(),
    },
  ],
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <TestMemoryRouter>
      <CoreAdminContext
        dataProvider={fakeRestProvider(records, false)}
        i18nProvider={i18nProvider}
        store={memoryStore()}
      >
        <ResourceContextProvider value="jobs">
          {children}
        </ResourceContextProvider>
      </CoreAdminContext>
    </TestMemoryRouter>
  </ThemeProvider>
);

export default { title: "Extras/JobMonitor" };

export const Basic = () => (
  <Wrapper>
    <JobMonitor resource="jobs" pollInterval={0} />
  </Wrapper>
);

export const NoPolling = () => (
  <Wrapper>
    <JobMonitor resource="jobs" pollInterval={0} />
  </Wrapper>
);

export const CustomTabs = () => (
  <Wrapper>
    <JobMonitor
      resource="jobs"
      pollInterval={0}
      tabs={["failed", "running", "queued"]}
    />
  </Wrapper>
);

export const HideActions = () => (
  <Wrapper>
    <JobMonitor resource="jobs" pollInterval={0} actions={false} />
  </Wrapper>
);
