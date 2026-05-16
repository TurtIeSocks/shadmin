# Extras Phase B — New Resources Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 5 new fake resources to the demo app — subscriptions, api_keys, webhooks, scheduled_jobs, approvals — each hosting net-new extras components.

**Architecture:** Each new resource gets a folder under `src/demo/<resource>/` mirroring existing resources (List/Edit/Show/Create as needed + `index.ts`). Seed data is added to `dataProvider.ts` or per-resource seed files. `App.tsx` registers `<Resource>` entries; `DemoSidebar.tsx` adds menu items grouped under SaaS / Workflow sections.

**Tech Stack:** ra-core, fakerest dataProvider, shadcn/ui, lucide-react icons.

**Related spec:** [extras-phase-b-new-resources](../specs/2026-05-16-extras-phase-b-new-resources-design.md)

---

## Task B0: Sidebar restructuring + types

**Files:**
- Modify: `src/demo/types.ts`
- Modify: `src/demo/DemoSidebar.tsx`

- [ ] **Step 1: Add 5 new interfaces to `types.ts`**

```ts
export interface Subscription {
  id: number;
  customer_id: number;
  plan: "free" | "starter" | "pro" | "enterprise";
  status: "active" | "trialing" | "past_due" | "canceled";
  start_date: string;
  usage: {
    api_calls: { used: number; limit: number };
    storage_mb: { used: number; limit: number };
  };
}

export interface ApiKey {
  id: number;
  name: string;
  key: string;
  key_truncated: string;
  scopes: string[];
  created_at: string;
  last_used: string | null;
}

export interface Webhook {
  id: number;
  url: string;
  event_types: string[];
  status: "active" | "paused" | "failing";
  last_triggered: string | null;
  failure_count: number;
}

export interface ScheduledJob {
  id: number;
  name: string;
  cron: string;
  description: string;
  status: "running" | "idle" | "failed" | "disabled";
  last_run: string | null;
  next_run: string | null;
  last_duration_ms: number | null;
}

export interface Approval {
  id: number;
  resource_type: "order" | "subscription_upgrade" | "refund";
  record_id: number;
  amount?: number;
  reason: string;
  requested_by: number;
  approved_by_1: number | null;
  approved_by_2: number | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}
```

- [ ] **Step 2: Restructure sidebar with groups**

Read current `DemoSidebar.tsx` to understand existing menu pattern. Refactor menu sections into shadcn `<SidebarGroup>` + `<SidebarGroupLabel>`:

- **Catalog:** Products, Categories
- **Sales:** Orders, Customers, Reviews, Segments
- **SaaS:** Subscriptions, API Keys, Webhooks
- **Workflow:** Approvals, Scheduled Jobs
- **Analytics:** Analytics, Planning, Map
- **Setup:** Onboarding, Workspace

Add icons via `lucide-react` (CreditCardIcon, KeyIcon, WebhookIcon, ClockIcon, CheckCircleIcon).

- [ ] **Step 3: Typecheck**

```bash
make typecheck
```

- [ ] **Step 4: Commit**

```bash
git add src/demo/types.ts src/demo/DemoSidebar.tsx
git commit -m "$(cat <<'EOF'
chore(demo): add types for 5 new resources + group sidebar by domain

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task B1: subscriptions resource

**Files:**
- Create: `src/demo/subscriptions/plans.ts`
- Create: `src/demo/subscriptions/SubscriptionList.tsx`
- Create: `src/demo/subscriptions/SubscriptionEdit.tsx`
- Create: `src/demo/subscriptions/SubscriptionShow.tsx`
- Create: `src/demo/subscriptions/index.ts`
- Create: `src/demo/subscriptions/seed.ts`
- Modify: `src/demo/dataProvider.ts`
- Modify: `src/demo/App.tsx`

- [ ] **Step 1: plans.ts constant**

```ts
export const PLANS = [
  { id: "free", name: "Free", price: 0, features: ["1 user", "100 API calls/month", "100 MB storage"] },
  { id: "starter", name: "Starter", price: 29, features: ["5 users", "10k API calls/month", "10 GB storage"] },
  { id: "pro", name: "Pro", price: 99, features: ["unlimited users", "1M API calls/month", "100 GB storage"] },
  { id: "enterprise", name: "Enterprise", price: 999, features: ["custom"] },
];
```

- [ ] **Step 2: seed.ts**

```ts
import type { Subscription } from "../types";
import { PLANS } from "./plans";

const PLAN_IDS = PLANS.map((p) => p.id) as Subscription["plan"][];

export const subscriptionsSeed: Subscription[] = Array.from({ length: 30 }, (_, i) => {
  const plan = PLAN_IDS[i % PLAN_IDS.length];
  const apiLimit = plan === "free" ? 100 : plan === "starter" ? 10000 : plan === "pro" ? 1_000_000 : 10_000_000;
  const storageLimit = plan === "free" ? 100 : plan === "starter" ? 10240 : plan === "pro" ? 102400 : 1024000;
  return {
    id: i + 1,
    customer_id: (i % 10) + 1,
    plan,
    status: i % 7 === 0 ? "trialing" : i % 13 === 0 ? "past_due" : "active",
    start_date: new Date(Date.now() - i * 86400000).toISOString(),
    usage: {
      api_calls: { used: Math.floor(apiLimit * (0.1 + (i % 9) / 10)), limit: apiLimit },
      storage_mb: { used: Math.floor(storageLimit * (0.05 + (i % 7) / 12)), limit: storageLimit },
    },
  };
});
```

- [ ] **Step 3: SubscriptionList.tsx**

```tsx
import { List, DataTable, ReferenceField } from "@/components/admin";
import { SubscriptionPlanField } from "@/components/extras/subscription-plan-field";
import { PLANS } from "./plans";

export const SubscriptionList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" label="ID" />
      <DataTable.Col label="Customer">
        <ReferenceField source="customer_id" reference="customers" />
      </DataTable.Col>
      <DataTable.Col label="Plan">
        <SubscriptionPlanField source="plan" plans={PLANS} />
      </DataTable.Col>
      <DataTable.Col source="status" />
      <DataTable.Col source="start_date" label="Started" />
    </DataTable>
  </List>
);
```

- [ ] **Step 4: SubscriptionEdit.tsx**

```tsx
import { Edit, SimpleForm, ReferenceInput, SelectInput } from "@/components/admin";
import { SubscriptionPlanPicker } from "@/components/extras/subscription-plan-picker";
import { UsageMeterField } from "@/components/extras/usage-meter-field";
import { PLANS } from "./plans";

export const SubscriptionEdit = () => (
  <Edit>
    <SimpleForm>
      <ReferenceInput source="customer_id" reference="customers" />
      <SubscriptionPlanPicker source="plan" plans={PLANS} recommendedPlanId="pro" />
      <SelectInput
        source="status"
        choices={[
          { id: "active", name: "Active" },
          { id: "trialing", name: "Trialing" },
          { id: "past_due", name: "Past due" },
          { id: "canceled", name: "Canceled" },
        ]}
      />
      <UsageMeterField source="usage.api_calls.used" limitSource="usage.api_calls.limit" label="API calls" />
      <UsageMeterField source="usage.storage_mb.used" limitSource="usage.storage_mb.limit" unit="MB" label="Storage" />
    </SimpleForm>
  </Edit>
);
```

- [ ] **Step 5: SubscriptionShow.tsx + index.ts**

`SubscriptionShow.tsx`:

```tsx
import { Show, SimpleShowLayout, TextField, DateField, ReferenceField } from "@/components/admin";
import { SubscriptionPlanField } from "@/components/extras/subscription-plan-field";
import { UsageMeterField } from "@/components/extras/usage-meter-field";
import { PLANS } from "./plans";

export const SubscriptionShow = () => (
  <Show>
    <SimpleShowLayout>
      <ReferenceField source="customer_id" reference="customers" />
      <SubscriptionPlanField source="plan" plans={PLANS} />
      <TextField source="status" />
      <DateField source="start_date" />
      <UsageMeterField source="usage.api_calls.used" limitSource="usage.api_calls.limit" label="API calls" />
      <UsageMeterField source="usage.storage_mb.used" limitSource="usage.storage_mb.limit" unit="MB" label="Storage" />
    </SimpleShowLayout>
  </Show>
);
```

`index.ts`:

```ts
export { SubscriptionList } from "./SubscriptionList";
export { SubscriptionEdit } from "./SubscriptionEdit";
export { SubscriptionShow } from "./SubscriptionShow";
```

- [ ] **Step 6: Register seed in dataProvider.ts**

Open `src/demo/dataProvider.ts`. Locate where existing resources' seed arrays are passed to fakerest. Add:

```ts
import { subscriptionsSeed } from "./subscriptions/seed";
// inside the data object:
subscriptions: subscriptionsSeed,
```

- [ ] **Step 7: Register Resource in App.tsx**

```tsx
import { CreditCardIcon } from "lucide-react";
import { SubscriptionList, SubscriptionEdit, SubscriptionShow } from "./subscriptions";

<Resource name="subscriptions" list={SubscriptionList} edit={SubscriptionEdit} show={SubscriptionShow} icon={CreditCardIcon} />
```

- [ ] **Step 8: Typecheck + lint**

```bash
make typecheck && make lint
```

- [ ] **Step 9: Manual browser verification**

```bash
make run
```

/subscriptions → list shows 30 rows with plan badges. Edit one → see plan picker + 2 usage meters. Show view renders read-only.

- [ ] **Step 10: Commit**

```bash
git add src/demo/subscriptions/ src/demo/dataProvider.ts src/demo/App.tsx
git commit -m "$(cat <<'EOF'
feat(demo): add subscriptions resource with SubscriptionPlanPicker + UsageMeterField

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task B2: api_keys resource

**Files:**
- Create: `src/demo/api-keys/seed.ts`
- Create: `src/demo/api-keys/ApiKeyList.tsx`
- Create: `src/demo/api-keys/ApiKeyCreate.tsx`
- Create: `src/demo/api-keys/ApiKeyShow.tsx`
- Create: `src/demo/api-keys/index.ts`
- Modify: `src/demo/dataProvider.ts`
- Modify: `src/demo/App.tsx`

- [ ] **Step 1: seed.ts**

```ts
import type { ApiKey } from "../types";

const SCOPES = ["read:orders", "write:orders", "read:customers", "write:customers", "admin"];

export const apiKeysSeed: ApiKey[] = Array.from({ length: 12 }, (_, i) => {
  const fullKey = `sk_test_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
  return {
    id: i + 1,
    name: `Key #${i + 1}`,
    key: fullKey,
    key_truncated: `${fullKey.slice(0, 10)}...${fullKey.slice(-4)}`,
    scopes: SCOPES.slice(0, (i % 3) + 1),
    created_at: new Date(Date.now() - i * 86400000 * 7).toISOString(),
    last_used: i % 4 === 0 ? null : new Date(Date.now() - i * 86400000).toISOString(),
  };
});
```

- [ ] **Step 2: ApiKeyCreate.tsx**

```tsx
import { Create, SimpleForm, TextInput, SelectArrayInput } from "@/components/admin";

const SCOPE_CHOICES = [
  { id: "read:orders", name: "Read orders" },
  { id: "write:orders", name: "Write orders" },
  { id: "read:customers", name: "Read customers" },
  { id: "write:customers", name: "Write customers" },
  { id: "admin", name: "Admin (full access)" },
];

export const ApiKeyCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" />
      <SelectArrayInput source="scopes" choices={SCOPE_CHOICES} />
    </SimpleForm>
  </Create>
);
```

- [ ] **Step 3: ApiKeyList.tsx**

```tsx
import { List, DataTable } from "@/components/admin";
import { ApiKeyField } from "@/components/extras/api-key-field";

export const ApiKeyList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="name" />
      <DataTable.Col label="Key">
        <ApiKeyField source="key_truncated" />
      </DataTable.Col>
      <DataTable.Col source="created_at" />
      <DataTable.Col source="last_used" />
    </DataTable>
  </List>
);
```

- [ ] **Step 4: ApiKeyShow.tsx**

```tsx
import { Show, SimpleShowLayout, TextField, DateField } from "@/components/admin";
import { ApiKeyField } from "@/components/extras/api-key-field";
import { ApiKeyInput } from "@/components/extras/api-key-input";

export const ApiKeyShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="name" />
      <ApiKeyField source="key_truncated" />
      <ApiKeyInput source="key" />
      <TextField source="scopes" />
      <DateField source="created_at" />
      <DateField source="last_used" />
    </SimpleShowLayout>
  </Show>
);
```

- [ ] **Step 5: index.ts**

```ts
export { ApiKeyList } from "./ApiKeyList";
export { ApiKeyCreate } from "./ApiKeyCreate";
export { ApiKeyShow } from "./ApiKeyShow";
```

- [ ] **Step 6: Wire dataProvider + App.tsx**

```ts
import { apiKeysSeed } from "./api-keys/seed";
// in data:
api_keys: apiKeysSeed,
```

```tsx
import { KeyIcon } from "lucide-react";
import { ApiKeyList, ApiKeyCreate, ApiKeyShow } from "./api-keys";

<Resource name="api_keys" list={ApiKeyList} create={ApiKeyCreate} show={ApiKeyShow} icon={KeyIcon} />
```

- [ ] **Step 7: Typecheck + lint + browser smoke**

```bash
make typecheck && make lint && make run
```

- [ ] **Step 8: Commit**

```bash
git add src/demo/api-keys/ src/demo/dataProvider.ts src/demo/App.tsx
git commit -m "$(cat <<'EOF'
feat(demo): add api_keys resource with ApiKeyField/Input

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task B3: webhooks resource

**Files:**
- Create: `src/demo/webhooks/event-types.ts`
- Create: `src/demo/webhooks/seed.ts`
- Create: `src/demo/webhooks/WebhookList.tsx`
- Create: `src/demo/webhooks/WebhookCreate.tsx`
- Create: `src/demo/webhooks/WebhookEdit.tsx`
- Create: `src/demo/webhooks/WebhookShow.tsx`
- Create: `src/demo/webhooks/index.ts`
- Modify: `src/demo/dataProvider.ts`, `src/demo/App.tsx`

- [ ] **Step 1: event-types.ts**

```ts
export const EVENT_TYPES = [
  "order.created",
  "order.paid",
  "order.shipped",
  "customer.created",
  "subscription.updated",
  "subscription.canceled",
];
```

- [ ] **Step 2: seed.ts**

```ts
import type { Webhook } from "../types";
import { EVENT_TYPES } from "./event-types";

export const webhooksSeed: Webhook[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  url: `https://api.example${i + 1}.com/webhooks/inbound`,
  event_types: EVENT_TYPES.slice(0, (i % 4) + 1),
  status: i % 5 === 0 ? "failing" : i % 7 === 0 ? "paused" : "active",
  last_triggered: i % 3 === 0 ? null : new Date(Date.now() - i * 3600000).toISOString(),
  failure_count: i % 5 === 0 ? 12 : 0,
}));
```

- [ ] **Step 3: WebhookCreate.tsx + WebhookEdit.tsx (shared form)**

```tsx
// WebhookCreate.tsx
import { Create, SimpleForm } from "@/components/admin";
import { WebhookEndpointInput } from "@/components/extras/webhook-endpoint-input";
import { EVENT_TYPES } from "./event-types";

export const WebhookCreate = () => (
  <Create>
    <SimpleForm>
      <WebhookEndpointInput source="url" eventTypes={EVENT_TYPES} eventSource="event_types" />
    </SimpleForm>
  </Create>
);
```

```tsx
// WebhookEdit.tsx
import { Edit, SimpleForm } from "@/components/admin";
import { WebhookEndpointInput } from "@/components/extras/webhook-endpoint-input";
import { EVENT_TYPES } from "./event-types";

export const WebhookEdit = () => (
  <Edit>
    <SimpleForm>
      <WebhookEndpointInput source="url" eventTypes={EVENT_TYPES} eventSource="event_types" />
    </SimpleForm>
  </Edit>
);
```

- [ ] **Step 4: WebhookList.tsx**

```tsx
import { List, DataTable } from "@/components/admin";
import { WebhookEndpointField } from "@/components/extras/webhook-endpoint-field";

export const WebhookList = () => (
  <List>
    <DataTable>
      <DataTable.Col label="Endpoint">
        <WebhookEndpointField
          source="url"
          statusSource="status"
          lastDeliverySource="last_triggered"
        />
      </DataTable.Col>
      <DataTable.Col source="event_types" />
      <DataTable.Col source="failure_count" />
    </DataTable>
  </List>
);
```

- [ ] **Step 5: WebhookShow.tsx + index.ts**

```tsx
// WebhookShow.tsx
import { Show, SimpleShowLayout, TextField, DateField } from "@/components/admin";
import { WebhookEndpointField } from "@/components/extras/webhook-endpoint-field";

export const WebhookShow = () => (
  <Show>
    <SimpleShowLayout>
      <WebhookEndpointField
        source="url"
        statusSource="status"
        lastDeliverySource="last_triggered"
      />
      <TextField source="event_types" />
      <TextField source="status" />
      <DateField source="last_triggered" />
      <TextField source="failure_count" />
    </SimpleShowLayout>
  </Show>
);
```

```ts
// index.ts
export { WebhookList } from "./WebhookList";
export { WebhookCreate } from "./WebhookCreate";
export { WebhookEdit } from "./WebhookEdit";
export { WebhookShow } from "./WebhookShow";
```

- [ ] **Step 6: Wire**

```ts
// dataProvider.ts
import { webhooksSeed } from "./webhooks/seed";
webhooks: webhooksSeed,
```

```tsx
// App.tsx
import { WebhookIcon } from "lucide-react";
import { WebhookList, WebhookCreate, WebhookEdit, WebhookShow } from "./webhooks";

<Resource name="webhooks" list={WebhookList} create={WebhookCreate} edit={WebhookEdit} show={WebhookShow} icon={WebhookIcon} />
```

- [ ] **Step 7: Typecheck + lint + browser smoke**

- [ ] **Step 8: Commit**

```bash
git add src/demo/webhooks/ src/demo/dataProvider.ts src/demo/App.tsx
git commit -m "$(cat <<'EOF'
feat(demo): add webhooks resource with WebhookEndpointField/Input

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task B4: scheduled_jobs resource

**Files:**
- Create: `src/demo/scheduled-jobs/seed.ts`
- Create: `src/demo/scheduled-jobs/ScheduledJobList.tsx`
- Create: `src/demo/scheduled-jobs/ScheduledJobCreate.tsx`
- Create: `src/demo/scheduled-jobs/ScheduledJobEdit.tsx`
- Create: `src/demo/scheduled-jobs/ScheduledJobShow.tsx`
- Create: `src/demo/scheduled-jobs/index.ts`
- Modify: `src/demo/dataProvider.ts`, `src/demo/App.tsx`

- [ ] **Step 1: seed.ts**

```ts
import type { ScheduledJob } from "../types";

export const scheduledJobsSeed: ScheduledJob[] = [
  { id: 1, name: "Daily revenue report", cron: "0 0 * * *", description: "Aggregate yesterday's orders, email summary", status: "running", last_run: new Date(Date.now() - 3600000).toISOString(), next_run: new Date(Date.now() + 82800000).toISOString(), last_duration_ms: 14523 },
  { id: 2, name: "Cleanup expired sessions", cron: "*/15 * * * *", description: "Delete sessions older than 24h", status: "idle", last_run: new Date(Date.now() - 900000).toISOString(), next_run: new Date(Date.now() + 900000).toISOString(), last_duration_ms: 342 },
  { id: 3, name: "Send weekly digest", cron: "0 9 * * MON", description: "Email weekly performance to admins", status: "idle", last_run: new Date(Date.now() - 86400000 * 3).toISOString(), next_run: new Date(Date.now() + 86400000 * 4).toISOString(), last_duration_ms: 8912 },
  { id: 4, name: "Reindex search", cron: "0 */6 * * *", description: "Rebuild product search index", status: "failed", last_run: new Date(Date.now() - 21600000).toISOString(), next_run: new Date(Date.now() + 21600000).toISOString(), last_duration_ms: 0 },
  { id: 5, name: "Sync inventory", cron: "0 2 * * *", description: "Pull inventory from warehouse API", status: "idle", last_run: new Date(Date.now() - 79200000).toISOString(), next_run: new Date(Date.now() + 7200000).toISOString(), last_duration_ms: 24123 },
  { id: 6, name: "Trial expiry warnings", cron: "0 10 * * *", description: "Email customers with trials expiring in 3 days", status: "disabled", last_run: null, next_run: null, last_duration_ms: null },
];
```

- [ ] **Step 2: ScheduledJobCreate.tsx + ScheduledJobEdit.tsx**

```tsx
// ScheduledJobCreate.tsx
import { Create, SimpleForm, TextInput } from "@/components/admin";
import { CronInput } from "@/components/extras/cron-input";

export const ScheduledJobCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput multiline source="description" />
      <CronInput source="cron" previewNextRuns={3} />
    </SimpleForm>
  </Create>
);
```

```tsx
// ScheduledJobEdit.tsx
import { Edit, SimpleForm, TextInput, SelectInput } from "@/components/admin";
import { CronInput } from "@/components/extras/cron-input";

export const ScheduledJobEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput multiline source="description" />
      <CronInput source="cron" previewNextRuns={3} />
      <SelectInput
        source="status"
        choices={[
          { id: "running", name: "Running" },
          { id: "idle", name: "Idle" },
          { id: "failed", name: "Failed" },
          { id: "disabled", name: "Disabled" },
        ]}
      />
    </SimpleForm>
  </Edit>
);
```

- [ ] **Step 3: ScheduledJobList.tsx**

```tsx
import { List, DataTable, TextField } from "@/components/admin";
import { CronField } from "@/components/extras/cron-field";

export const ScheduledJobList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="name" />
      <DataTable.Col label="Schedule">
        <CronField source="cron" />
      </DataTable.Col>
      <DataTable.Col source="status" />
      <DataTable.Col source="last_run" />
      <DataTable.Col source="next_run" />
    </DataTable>
  </List>
);
```

- [ ] **Step 4: ScheduledJobShow.tsx + index.ts**

```tsx
// ScheduledJobShow.tsx
import { Show, SimpleShowLayout, TextField, DateField, NumberField } from "@/components/admin";
import { CronField } from "@/components/extras/cron-field";

export const ScheduledJobShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="name" />
      <TextField source="description" />
      <CronField source="cron" />
      <TextField source="status" />
      <DateField source="last_run" showTime />
      <DateField source="next_run" showTime />
      <NumberField source="last_duration_ms" />
    </SimpleShowLayout>
  </Show>
);
```

```ts
// index.ts
export { ScheduledJobList } from "./ScheduledJobList";
export { ScheduledJobCreate } from "./ScheduledJobCreate";
export { ScheduledJobEdit } from "./ScheduledJobEdit";
export { ScheduledJobShow } from "./ScheduledJobShow";
```

- [ ] **Step 5: Wire**

```ts
import { scheduledJobsSeed } from "./scheduled-jobs/seed";
scheduled_jobs: scheduledJobsSeed,
```

```tsx
import { ClockIcon } from "lucide-react";
import { ScheduledJobList, ScheduledJobCreate, ScheduledJobEdit, ScheduledJobShow } from "./scheduled-jobs";

<Resource name="scheduled_jobs" list={ScheduledJobList} create={ScheduledJobCreate} edit={ScheduledJobEdit} show={ScheduledJobShow} icon={ClockIcon} />
```

- [ ] **Step 6: Typecheck + lint + browser smoke**

- [ ] **Step 7: Commit**

```bash
git add src/demo/scheduled-jobs/ src/demo/dataProvider.ts src/demo/App.tsx
git commit -m "$(cat <<'EOF'
feat(demo): add scheduled_jobs resource with CronInput/Field

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task B5: approvals resource

**Files:**
- Create: `src/demo/approvals/seed.ts`
- Create: `src/demo/approvals/ApprovalQueueList.tsx`
- Create: `src/demo/approvals/ApprovalShow.tsx`
- Create: `src/demo/approvals/index.ts`
- Modify: `src/demo/dataProvider.ts`, `src/demo/App.tsx`

- [ ] **Step 1: seed.ts**

```ts
import type { Approval } from "../types";

const REASONS = [
  "Customer requested cancellation",
  "Order amount exceeds auto-approval threshold",
  "Refund for damaged item",
  "Plan upgrade requires admin sign-off",
  "Duplicate transaction needs review",
];

export const approvalsSeed: Approval[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  resource_type: (["order", "subscription_upgrade", "refund"] as const)[i % 3],
  record_id: (i % 10) + 1,
  amount: i % 2 === 0 ? 100 + i * 47 : undefined,
  reason: REASONS[i % REASONS.length],
  requested_by: (i % 5) + 1,
  approved_by_1: i % 4 === 0 ? (i % 5) + 1 : null,
  approved_by_2: i % 7 === 0 ? ((i + 1) % 5) + 1 : null,
  status: i % 5 === 0 ? "approved" : i % 8 === 0 ? "rejected" : "pending",
  created_at: new Date(Date.now() - i * 7200000).toISOString(),
}));
```

- [ ] **Step 2: ApprovalQueueList.tsx**

```tsx
import { List } from "@/components/admin";
import { ApprovalQueue } from "@/components/extras/approval-queue";

export const ApprovalQueueList = () => (
  <List filter={{ status: "pending" }}>
    <ApprovalQueue requireReason />
  </List>
);
```

- [ ] **Step 3: ApprovalShow.tsx**

```tsx
import { Show, SimpleShowLayout, TextField, DateField, ReferenceField } from "@/components/admin";
import { DualApprovalButton } from "@/components/extras/dual-approval-button";

export const ApprovalShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="resource_type" />
      <TextField source="record_id" />
      <TextField source="amount" />
      <TextField source="reason" />
      <ReferenceField source="requested_by" reference="customers" />
      <TextField source="status" />
      <DateField source="created_at" />
      <DualApprovalButton
        source="approved_by_1"
        secondSource="approved_by_2"
        requiredApprovers={2}
      />
    </SimpleShowLayout>
  </Show>
);
```

- [ ] **Step 4: index.ts**

```ts
export { ApprovalQueueList } from "./ApprovalQueueList";
export { ApprovalShow } from "./ApprovalShow";
```

- [ ] **Step 5: Wire**

```ts
import { approvalsSeed } from "./approvals/seed";
approvals: approvalsSeed,
```

```tsx
import { CheckCircleIcon } from "lucide-react";
import { ApprovalQueueList, ApprovalShow } from "./approvals";

<Resource name="approvals" list={ApprovalQueueList} show={ApprovalShow} icon={CheckCircleIcon} />
```

- [ ] **Step 6: Typecheck + lint + browser smoke**

- [ ] **Step 7: Commit**

```bash
git add src/demo/approvals/ src/demo/dataProvider.ts src/demo/App.tsx
git commit -m "$(cat <<'EOF'
feat(demo): add approvals resource with ApprovalQueue + DualApprovalButton

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## End-of-plan checks

- [ ] `make test` passes.
- [ ] All 5 resources visible in sidebar under correct groups.
- [ ] Each resource: list, edit/create, show all functional.
