# JobMonitor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `<JobMonitor>` (idea 14 of the 21-component-ideas spec, deferred to Tier 5 originally) — a background-job queue dashboard reading a polled `useGetList`, grouping rows by status, exposing retry/cancel actions.

**Architecture:** Single component in `src/components/extras/job-monitor.tsx`. Wraps `useGetList` with TanStack Query's `refetchInterval` polling. Renders rows grouped by status into a tabbed/sectioned card. Retry/cancel via `useUpdate`. Caller is responsible for dataProvider supporting a `jobs` resource (or whatever `resource` prop value).

**Tech Stack:** React 19, TypeScript, ra-core, shadcn/ui (`Card`, `Tabs`, `Button`, `Badge`), Tailwind v4, Vitest + Playwright browser. No new runtime deps.

**Spec:** [docs/superpowers/specs/2026-05-16-twenty-one-component-ideas-design.md](../specs/2026-05-16-twenty-one-component-ideas-design.md) — idea 14.

## Assumptions

1. Job record shape: `{ id, type, status: "queued" | "running" | "failed" | "done" | "cancelled", payload?, attempts?, lastError?, createdAt, updatedAt? }`. The component reads these via configurable `*Source` props with sensible defaults.
2. `pollInterval` defaults to `5000` ms. Set to `0` to disable polling.
3. Default tabs: `running`, `queued`, `failed`, `done`. Tab counts are surfaced in the tab label as a badge.
4. Retry action sets `{ status: 'queued', attempts: (attempts ?? 0) + 1 }` via `useUpdate`. Only visible on `failed` rows.
5. Cancel action sets `{ status: 'cancelled' }`. Visible on `queued` and `running` rows.
6. Payload reveal toggles a `<pre>` block per row. Truncates long payloads via CSS.
7. `lastError` rendered as a muted line under the row when present.
8. Component must be mounted inside a `<ListBase>` parent OR rely on `useGetList` directly (we choose: direct `useGetList`, so the component is self-contained and doesn't require a parent List context).
9. The component lives in `src/components/extras/` per the established convention.

## File structure

| File                                              | Status                                                                                                          |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `src/components/extras/job-monitor.tsx`           | **Create**                                                                                                      |
| `src/components/extras/job-monitor.spec.tsx`      | **Create**                                                                                                      |
| `src/stories/extras/job-monitor.stories.tsx`      | **Create**                                                                                                      |
| `docs/src/content/docs/job-monitor.md`            | **Create**                                                                                                      |
| `src/components/extras/index.ts`                  | **Modify** (append export in alpha order between `i18n-key-editor` and `in-place-editor`)                       |
| `src/demo/component-gallery/ComponentGallery.tsx` | **Modify** (append `{ name: "JobMonitor", family: "Views", docs: "JobMonitor" }` in alpha position)             |
| `docs/sidebar.config.mjs`                         | **Modify** (append `"job-monitor"` in alpha position under Extras between `in-place-editor` and `kanban-board`) |

---

## Task 1: Story file

**Files:** Create `src/stories/extras/job-monitor.stories.tsx`

- [ ] **Step 1** — create:

```tsx
import {
  CoreAdminContext,
  ResourceContextProvider,
  TestMemoryRouter,
  memoryStore,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import fakeRestProvider from "ra-data-fakerest";
import { JobMonitor, ThemeProvider } from "@/components/admin";

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
```

## Task 2: Implement `<JobMonitor>` + spec

**Files:** Create `src/components/extras/job-monitor.tsx`, `src/components/extras/job-monitor.spec.tsx`

- [ ] **Step 1** — write spec:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  CustomTabs,
  HideActions,
} from "@/stories/extras/job-monitor.stories";

describe("<JobMonitor />", () => {
  it("renders default tabs with badge counts", async () => {
    const screen = render(<Basic />);
    // running:1, queued:1, failed:1, done:1
    await expect.element(screen.getByText(/running/i)).toBeInTheDocument();
    await expect.element(screen.getByText(/queued/i)).toBeInTheDocument();
    await expect.element(screen.getByText(/failed/i)).toBeInTheDocument();
    await expect.element(screen.getByText(/done/i)).toBeInTheDocument();
  });

  it("renders one job card per record in the active tab", async () => {
    const screen = render(<Basic />);
    // Default active tab is 'running', so only the running job appears
    await expect.element(screen.getByText("send-email")).toBeInTheDocument();
  });

  it("respects custom tabs prop (no done tab)", async () => {
    const screen = render(<CustomTabs />);
    const tabList = screen.container.querySelector("[role='tablist']");
    const tabs = tabList?.querySelectorAll("[role='tab']");
    expect(tabs?.length).toBe(3);
  });

  it("hides action buttons when actions=false", async () => {
    const screen = render(<HideActions />);
    expect(screen.container.querySelector("[data-job-retry]")).toBeNull();
    expect(screen.container.querySelector("[data-job-cancel]")).toBeNull();
  });

  it("renders retry button on failed rows", async () => {
    const screen = render(<Basic />);
    const failedTab = Array.from(
      screen.container.querySelectorAll("[role='tab']"),
    ).find((t) => /failed/i.test(t.textContent ?? "")) as HTMLElement;
    failedTab.click();
    await expect
      .element(screen.getByText("sync-inventory"))
      .toBeInTheDocument();
    const retry = screen.container.querySelector("[data-job-retry]");
    expect(retry).toBeTruthy();
  });

  it("renders the lastError line on failed rows", async () => {
    const screen = render(<Basic />);
    const failedTab = Array.from(
      screen.container.querySelectorAll("[role='tab']"),
    ).find((t) => /failed/i.test(t.textContent ?? "")) as HTMLElement;
    failedTab.click();
    await expect.element(screen.getByText(/ETIMEDOUT/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2** — run spec, expect FAIL.

- [ ] **Step 3** — implement:

```tsx
// src/components/extras/job-monitor.tsx
import { useState } from "react";
import {
  type RaRecord,
  useGetList,
  useResourceContext,
  useUpdate,
} from "ra-core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type JobStatus = "queued" | "running" | "failed" | "done" | "cancelled";

export interface JobRecord extends RaRecord {
  type?: string;
  status: JobStatus;
  payload?: unknown;
  attempts?: number;
  lastError?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_TABS: JobStatus[] = ["running", "queued", "failed", "done"];

/**
 * Background job queue dashboard. Reads a polled `useGetList(resource)` and
 * groups rows by status into tabs. Each row exposes retry (for failed) and
 * cancel (for running/queued) actions.
 *
 * @example
 * <JobMonitor resource="jobs" pollInterval={5000} />
 */
export const JobMonitor = (props: JobMonitorProps) => {
  const {
    resource: resourceProp,
    pollInterval = 5000,
    tabs = DEFAULT_TABS,
    statusSource = "status",
    typeSource = "type",
    payloadSource = "payload",
    errorSource = "lastError",
    attemptsSource = "attempts",
    actions = true,
  } = props;
  const resource = useResourceContext({ resource: resourceProp });
  const { data, isLoading } = useGetList<JobRecord>(
    resource ?? "jobs",
    {
      pagination: { page: 1, perPage: 200 },
      sort: { field: "createdAt", order: "DESC" },
    },
    {
      refetchInterval: pollInterval > 0 ? pollInterval : false,
    },
  );
  const [update] = useUpdate();
  const [activeTab, setActiveTab] = useState<JobStatus>(tabs[0]);
  const [expanded, setExpanded] = useState<Set<string | number>>(new Set());

  if (isLoading || !data) return null;

  const byStatus = tabs.reduce<Record<JobStatus, JobRecord[]>>(
    (acc, status) => {
      acc[status] = data.filter(
        (r) => (r[statusSource] as JobStatus) === status,
      );
      return acc;
    },
    {} as Record<JobStatus, JobRecord[]>,
  );

  const handleRetry = (record: JobRecord) => {
    update(resource ?? "jobs", {
      id: record.id,
      data: {
        [statusSource]: "queued",
        [attemptsSource]: ((record[attemptsSource] as number) ?? 0) + 1,
      },
      previousData: record,
    });
  };

  const handleCancel = (record: JobRecord) => {
    update(resource ?? "jobs", {
      id: record.id,
      data: { [statusSource]: "cancelled" },
      previousData: record,
    });
  };

  const togglePayload = (id: string | number) => {
    setExpanded((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Job Monitor</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as JobStatus)}
        >
          <TabsList>
            {tabs.map((status) => (
              <TabsTrigger key={status} value={status}>
                {status}
                <Badge variant="secondary" className="ml-2">
                  {byStatus[status]?.length ?? 0}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((status) => (
            <TabsContent key={status} value={status}>
              {byStatus[status]?.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No {status} jobs.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {byStatus[status]?.map((job) => (
                    <li
                      key={job.id}
                      data-job-row
                      data-job-id={job.id}
                      className="rounded border p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {String(job[typeSource] ?? "(no type)")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            id: {job.id} · attempts:{" "}
                            {String(job[attemptsSource] ?? 0)}
                            {job.createdAt && (
                              <>
                                {" "}
                                · created{" "}
                                {new Date(job.createdAt).toLocaleString()}
                              </>
                            )}
                          </span>
                        </div>
                        {actions && (
                          <div className="flex gap-1">
                            {status === "failed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                data-job-retry
                                onClick={() => handleRetry(job)}
                              >
                                <RotateCcw className="mr-1 h-3 w-3" />
                                Retry
                              </Button>
                            )}
                            {(status === "running" || status === "queued") && (
                              <Button
                                size="sm"
                                variant="outline"
                                data-job-cancel
                                onClick={() => handleCancel(job)}
                              >
                                <X className="mr-1 h-3 w-3" />
                                Cancel
                              </Button>
                            )}
                            {status === "done" && (
                              <Badge variant="secondary">
                                <Check className="mr-1 h-3 w-3" />
                                Done
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      {Boolean(job[errorSource]) && (
                        <p className="mt-1 text-xs text-red-700">
                          {String(job[errorSource])}
                        </p>
                      )}
                      {Boolean(job[payloadSource]) && (
                        <div className="mt-2">
                          <button
                            type="button"
                            className="text-xs text-muted-foreground underline"
                            onClick={() => togglePayload(job.id)}
                          >
                            {expanded.has(job.id) ? "Hide" : "Show"} payload
                          </button>
                          {expanded.has(job.id) && (
                            <pre
                              data-job-payload
                              className={cn(
                                "mt-1 max-h-40 overflow-y-auto rounded bg-muted p-2 text-xs",
                              )}
                            >
                              {JSON.stringify(job[payloadSource], null, 2)}
                            </pre>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export interface JobMonitorProps {
  /** Override resource (defaults to surrounding ResourceContext). */
  resource?: string;
  /** Polling interval in ms. `0` disables polling. Default `5000`. */
  pollInterval?: number;
  /** Status tabs to surface, in order. Default `["running","queued","failed","done"]`. */
  tabs?: JobStatus[];
  /** Record field holding the status string. Default `"status"`. */
  statusSource?: string;
  /** Record field holding the job kind / type. Default `"type"`. */
  typeSource?: string;
  /** Record field holding the payload object. Default `"payload"`. */
  payloadSource?: string;
  /** Record field holding the last-error string. Default `"lastError"`. */
  errorSource?: string;
  /** Record field holding the attempt count. Default `"attempts"`. */
  attemptsSource?: string;
  /** When false, hides retry/cancel buttons. Default `true`. */
  actions?: boolean;
}
```

- [ ] **Step 4** — append export to `src/components/extras/index.ts`:

```ts
export * from "./job-monitor";
```

- [ ] **Step 5** — append entry to `src/demo/component-gallery/ComponentGallery.tsx`:

```ts
{ name: "JobMonitor", family: "Views", docs: "JobMonitor" },
```

- [ ] **Step 6** — append `"job-monitor"` to `docs/sidebar.config.mjs` under the Extras `items:` array in alpha position (between `in-place-editor` and `kanban-board`).

- [ ] **Step 7** — run spec, expect PASS 6/6.

- [ ] **Step 8** — run lint + typecheck.

- [ ] **Step 9** — commit:

```bash
git add src/stories/extras/job-monitor.stories.tsx src/components/extras/job-monitor.tsx src/components/extras/job-monitor.spec.tsx src/components/extras/index.ts src/demo/component-gallery/ComponentGallery.tsx docs/sidebar.config.mjs
git commit -m "feat(job-monitor): add JobMonitor component + story + spec + wiring"
```

## Task 3: Doc page

**Files:** Create `docs/src/content/docs/job-monitor.md`

- [ ] **Step 1** — write:

````markdown
---
title: "JobMonitor"
---

Background job queue dashboard. Polls a `jobs` resource (or whichever you
pass), groups rows by `status`, and exposes retry / cancel actions per row.

## Usage

```tsx
import { JobMonitor } from '@/components/admin';

<JobMonitor resource="jobs" pollInterval={5000} />
<JobMonitor
  resource="jobs"
  pollInterval={2000}
  tabs={["failed", "running", "queued"]}
/>
```

## Job record shape

```ts
interface JobRecord {
  id: string | number;
  type?: string;
  status: "queued" | "running" | "failed" | "done" | "cancelled";
  payload?: unknown;
  attempts?: number;
  lastError?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
```

## Props

| Prop             | Required | Type          | Default                                | Description                             |
| ---------------- | -------- | ------------- | -------------------------------------- | --------------------------------------- |
| `resource`       | Optional | `string`      | Context                                | Override resource                       |
| `pollInterval`   | Optional | `number`      | `5000`                                 | Polling interval in ms (`0` = disabled) |
| `tabs`           | Optional | `JobStatus[]` | `["running","queued","failed","done"]` | Tab order                               |
| `statusSource`   | Optional | `string`      | `"status"`                             | Record field name                       |
| `typeSource`     | Optional | `string`      | `"type"`                               | Record field name                       |
| `payloadSource`  | Optional | `string`      | `"payload"`                            | Record field name                       |
| `errorSource`    | Optional | `string`      | `"lastError"`                          | Record field name                       |
| `attemptsSource` | Optional | `string`      | `"attempts"`                           | Record field name                       |
| `actions`        | Optional | `boolean`     | `true`                                 | Show retry/cancel buttons               |

## Actions

- **Retry** — visible on `failed` rows. Sets `status: 'queued'` and increments `attempts`.
- **Cancel** — visible on `running` and `queued` rows. Sets `status: 'cancelled'`.

## Polling

Wraps `useGetList` with TanStack Query's `refetchInterval`. Set
`pollInterval={0}` to disable. Recommended values: `2000`–`10000` ms.

## Limitations (v1)

- No log-tail (would require a separate streaming endpoint).
- No payload editing — payload is read-only.
- No bulk-retry / bulk-cancel across many rows.
- Cache hit/miss tracking deferred to `<DataProviderDevtools>`.
````

- [ ] **Step 2** — commit:

```bash
git add docs/src/content/docs/job-monitor.md
git commit -m "docs(job-monitor): add documentation"
```

## Final task: Verification

- [ ] **Step 1** — run all 5 doc-drift checks from `docs/` dir:

```bash
pnpm run check-docs
pnpm run check-sidebar
pnpm run check-stories
pnpm run check-specs
pnpm run check-demo-coverage
```

Expected: all green.

- [ ] **Step 2** — run lint + typecheck + full test suite in parallel:

```bash
pnpm run lint
pnpm run typecheck
pnpm run test
```

Expected: 0 errors, all green.

---

## Self-review notes

- Single component pair: implementation + spec + story + docs. Wiring (index.ts + gallery + sidebar) bundled into the impl commit.
- Tests cover: default tabs render, counts, custom tabs, actions toggle, retry on failed, error display. Not directly tested: polling cadence (deterministic in 2s tests is fragile; rely on `refetchInterval` semantics from TanStack Query).
- Filters jobs client-side. v1 fetches up to `perPage: 200` — beyond that, callers should filter server-side via `useListController` integration (future work).
- No new runtime deps.
- Lives in `extras/`, sidebar group `Extras`, gallery family `Views`.
