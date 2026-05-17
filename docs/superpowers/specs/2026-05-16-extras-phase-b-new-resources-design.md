# Extras integration — Phase B: 5 new resources for net-new extras

**Date:** 2026-05-16
**Status:** Draft
**Phase:** B of C (extras integration)
**Related todos:** Integrate 21 recent extras components into real demo flows.

---

## Goal

Add 5 new fake resources to the demo app, each one hosting extras components that have no natural home in existing resources. Each resource gets `List` + `Edit` + `Show` views and is wired into `App.tsx` + `DemoSidebar.tsx`.

---

## Resources to add

### 1. `subscriptions` (SubscriptionPlanField/Picker, UsageMeterField)

**Folder:** `src/demo/subscriptions/`
**Files:** `SubscriptionList.tsx`, `SubscriptionEdit.tsx`, `SubscriptionShow.tsx`, `index.ts`
**Type (in `src/demo/types.ts`):**
```ts
export interface Subscription {
  id: number;
  customer_id: number;
  plan: "free" | "starter" | "pro" | "enterprise";
  status: "active" | "trialing" | "past_due" | "canceled";
  start_date: string;
  usage: { api_calls: { used: number; limit: number }; storage_mb: { used: number; limit: number } };
}
```
**Seed:** 30 subscriptions, half active/half trialing, varied plans and usage.
**Plans data (constant in `subscriptions/plans.ts`):**
```ts
export const PLANS = [
  { id: "free", name: "Free", price: 0, features: ["1 user", "100 API calls/month"] },
  { id: "starter", name: "Starter", price: 29, features: ["5 users", "10k API calls/month"] },
  { id: "pro", name: "Pro", price: 99, features: ["unlimited users", "1M API calls/month"] },
  { id: "enterprise", name: "Enterprise", price: 999, features: ["custom"] },
];
```
**Edit view:** `<SubscriptionPlanPicker source="plan" plans={PLANS} />`, `<UsageMeterField source="usage.api_calls" label="API calls" />`, `<UsageMeterField source="usage.storage_mb" unit="MB" />`.
**List view:** plan badge via `<SubscriptionPlanField source="plan" plans={PLANS} />`, status, customer reference.

### 2. `api_keys` (ApiKeyField, ApiKeyInput)

**Folder:** `src/demo/api-keys/`
**Files:** `ApiKeyList.tsx`, `ApiKeyCreate.tsx`, `ApiKeyShow.tsx`, `index.ts`
**Type:**
```ts
export interface ApiKey {
  id: number;
  name: string;
  key: string;  // full key shown once at creation
  key_truncated: string;  // "sk_...abc" for list/show
  scopes: string[];
  created_at: string;
  last_used: string | null;
}
```
**Seed:** 12 keys across 3 customers, varied scopes.
**Create view:** `<TextInput source="name" />` + `<TextInput source="scopes" />`; `<ApiKeyInput source="key" />` shown post-create.
**Show view:** `<ApiKeyField source="key_truncated" />`, list of scopes, last-used timestamp.
**Note:** no Edit view (api keys are immutable; only create + revoke).

### 3. `webhooks` (WebhookEndpointField, WebhookEndpointInput)

**Folder:** `src/demo/webhooks/`
**Files:** `WebhookList.tsx`, `WebhookEdit.tsx`, `WebhookCreate.tsx`, `WebhookShow.tsx`, `index.ts`
**Type:**
```ts
export interface Webhook {
  id: number;
  url: string;
  event_types: string[];
  status: "active" | "paused" | "failing";
  last_triggered: string | null;
  failure_count: number;
}
```
**Event types constant (`webhooks/event-types.ts`):**
```ts
export const EVENT_TYPES = ["order.created", "order.paid", "order.shipped", "customer.created", "subscription.updated", "subscription.canceled"];
```
**Seed:** 8 webhooks, varied status.
**Edit view:** `<WebhookEndpointInput source="url" eventTypes={EVENT_TYPES} source="event_types" />`.
**List view:** `<WebhookEndpointField source="url" statusSource="status" lastTriggeredSource="last_triggered" />`.

### 4. `scheduled_jobs` (CronField, CronInput; JobMonitor in Phase C dashboard)

**Folder:** `src/demo/scheduled-jobs/`
**Files:** `ScheduledJobList.tsx`, `ScheduledJobEdit.tsx`, `ScheduledJobCreate.tsx`, `ScheduledJobShow.tsx`, `index.ts`
**Type:**
```ts
export interface ScheduledJob {
  id: number;
  name: string;
  cron: string;  // "0 */4 * * *"
  description: string;
  status: "running" | "idle" | "failed" | "disabled";
  last_run: string | null;
  next_run: string | null;
  last_duration_ms: number | null;
}
```
**Seed:** 6 jobs (e.g., "Daily revenue report", "Cleanup expired sessions", "Send weekly digest").
**Edit view:** `<CronInput source="cron" previewNextRuns={3} />`, `<TextInput source="name" />`, `<TextInput multiline source="description" />`.
**List view:** `<CronField source="cron" />` (humanized), status badge, last_run timestamp.

### 5. `approvals` (ApprovalQueue, DualApprovalButton)

**Folder:** `src/demo/approvals/`
**Files:** `ApprovalQueueList.tsx` (uses `<ApprovalQueue>`), `ApprovalShow.tsx`, `index.ts`
**Type:**
```ts
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
**Seed:** 15 approvals, mix of types and statuses.
**List route:** `<ApprovalQueue resource="approvals" filter={{ status: "pending" }} requireReason />`.
**Show view:** `<DualApprovalButton source="approved_by_1" secondSource="approved_by_2" requiredApprovers={2} />`.

---

## Wiring

### `src/demo/App.tsx`

Add 5 `<Resource>` entries:
```tsx
<Resource name="subscriptions" list={SubscriptionList} edit={SubscriptionEdit} show={SubscriptionShow} icon={CreditCardIcon} />
<Resource name="api_keys" list={ApiKeyList} create={ApiKeyCreate} show={ApiKeyShow} icon={KeyIcon} />
<Resource name="webhooks" list={WebhookList} edit={WebhookEdit} create={WebhookCreate} show={WebhookShow} icon={ArrowRightFromLineIcon} />
<Resource name="scheduled_jobs" list={ScheduledJobList} edit={ScheduledJobEdit} create={ScheduledJobCreate} show={ScheduledJobShow} icon={ClockIcon} />
<Resource name="approvals" list={ApprovalQueueList} show={ApprovalShow} icon={CheckCircleIcon} />
```

### `src/demo/DemoSidebar.tsx`

Restructure into grouped sections (decision made under "I trust your judgement"):
- **Catalog:** Products, Categories
- **Sales:** Orders, Customers, Reviews, Segments
- **SaaS:** Subscriptions, API Keys, Webhooks  *(new group)*
- **Workflow:** Approvals, Scheduled Jobs  *(new group)*
- **Analytics:** existing Analytics, Planning, Map
- **Setup:** Onboarding, Workspace

Each group becomes a collapsible section in the sidebar using existing `<SidebarGroup>` / `<SidebarGroupLabel>` patterns from shadcn.

### `src/demo/dataProvider.ts`

Add seed arrays for each new resource. Use deterministic fake data so demos reproduce the same view across reloads.

### `src/demo/types.ts`

Export the 5 new interfaces.

### `src/demo/i18n/en.ts` (if exists)

Add resource-name translations + menu labels.

---

## Files (count)

- 5 resource folders × ~4 files each = 20 new view files
- 3 constant files (`plans.ts`, `event-types.ts`, helpers as needed)
- `App.tsx`, `DemoSidebar.tsx`, `dataProvider.ts`, `types.ts` modifications
- Translation file updates

Total ~25 new + 4 modified files.

---

## Acceptance criteria

- [ ] 5 new menu entries appear in sidebar under correct groups.
- [ ] Each resource: list view renders fake data, show view renders detail, edit (or create) view persists changes via fakerest.
- [ ] SubscriptionPlanPicker shows feature comparison on plan select.
- [ ] UsageMeterField shows bar chart progressing toward limit.
- [ ] ApiKeyInput surfaces full key once at creation, masked thereafter.
- [ ] WebhookEndpointInput multi-select for event types renders.
- [ ] CronInput preview shows next 3 humanized run times.
- [ ] ApprovalQueue shows pending approvals with approve/reject buttons; reason required.
- [ ] DualApprovalButton blocks second-approval action when first approver is current user.
- [ ] `make typecheck` + `make lint` clean.
- [ ] No regression in existing demo specs.

---

## Assumptions

- Existing fakerest dataProvider auto-handles new resources once seed arrays exist (standard react-admin pattern).
- ra-core `<Resource>` accepts the same shape we already use for products/orders/etc.
- Sidebar grouping is acceptable visual change; if user pushes back, fall back to flat list.
- Icons from `lucide-react` (already a dep).
- Subscription `usage` nested-object source paths (`usage.api_calls`) work with ra-core lodash-style source resolution (confirmed by existing examples).
- DualApprovalButton's "block self-approval" guard reads from `useGetIdentity()` — assumed working since this is documented in the component's spec.
- ApprovalQueue's aggregation source is `resource` prop (one fake `approvals` resource) — simpler than cross-resource aggregation across reviews+orders.
- Phase C's JobMonitor dashboard widget reads from this phase's `scheduled_jobs` resource.
