# 21 Net-New Admin Component Ideas

**Date:** 2026-05-16
**Status:** Approved ideation — implementation prioritization pending
**Author:** Claude (brainstorming) + Rin (approver)

## Context

The kit currently ships **165 admin components** across **224 doc pages** with stories. CRUD-complete plus higher-order coverage: charts (`dashboard-charts`), kanban, wizard, realtime, audit timeline, permission matrix, AI assistant, full geo stack (leaflet + OSM + geocoding), pivot grid, onboarding tour, soft delete, supabase integration.

A naive first pass proposed 10 ideas that all turned out to be covered. This second pass audited each candidate against `docs/src/content/docs/` and `src/stories/` before inclusion. All 21 ideas below pass net-new check.

Ideas spread across **four target archetypes**: SaaS / B2B back-office, internal tools / ops console, e-commerce / fulfillment ops, compliance / finance / approvals.

Ideas spread across **four gap categories**: net-new categories, finer-grain inputs/fields, workflow/process above CRUD, dev-experience / meta.

## Format

Each idea: name, one-line problem, key props, ra-core hooks used, dependency cost, gap citation explaining why it isn't covered by an existing component.

---

## Category 1 — Net-new categories (5)

### 1. `<SubscriptionPlanField>` + `<SubscriptionPlanPicker>`

Display + tier-switch widget for SaaS billing. Card grid with feature comparison, badge for current plan, upgrade/downgrade CTA.

- **Props:** `plans`, `currentPlanId`, `onChange`, `featureMatrix`, `recommendedPlanId`
- **ra-core:** `useRecordContext`, `useUpdate`
- **Dep:** none (shadcn `card` + `radio-group`)
- **Gap:** no billing/subscription primitives in 224 docs. SaaS archetype unserved.

### 2. `<UsageMeterField>`

Quota visualization with used/limit + overage state. Bar or radial, color shifts at thresholds.

- **Props:** `source`, `limitSource`, `unit`, `thresholds`, `variant` (`bar` | `radial`)
- **ra-core:** `useRecordContext`
- **Dep:** shadcn `progress`
- **Gap:** kit shows numbers (`number-field`) but no quota/limit relationship widget. SaaS + usage-based pricing need.

### 3. `<ApiKeyField>` + `<ApiKeyInput>`

Generate/rotate/reveal API secrets. Masked display, copy-to-clipboard, "last used" timestamp, scope chips. Input handles rotation flow with confirmation.

- **Props:** `source`, `scopes`, `onRotate`, `maskedFormat`, `lastUsedSource`
- **ra-core:** `useRecordContext`, `useUpdate`
- **Dep:** none
- **Gap:** no secret-handling primitive. Every kit user rolls own with security pitfalls (clipboard timing, log leak, accidental render in dev tools).

### 4. `<WebhookEndpointInput>` + `<WebhookEndpointField>`

URL + signing secret + event-type multi-select + last-delivery status badge. Test-ping button.

- **Props:** `eventTypes`, `source`, `onTestPing`, `lastDeliverySource`
- **ra-core:** `useInput`, `useRecordContext`
- **Dep:** none
- **Gap:** no webhook-config UI. SaaS / integrations archetype unserved.

### 5. `<CommentsThread>`

Record-scoped threaded discussion with `@mention` autocomplete, edit/delete, optional resolve state. Reads `comments` sub-resource.

- **Props:** `reference`, `target`, `allowMentions`, `mentionResource`, `resolvable`
- **ra-core:** `useGetList`, `useCreate`, `useUpdate`, `useRecordContext`, `useGetIdentity`
- **Dep:** none
- **Gap:** `presence-bar` shows realtime presence; no async/threaded comments. Compliance + collab archetypes need.

---

## Category 2 — Finer-grain inputs/fields (6)

### 6. `<PhoneInput>` + `<PhoneField>`

E.164 storage, country-code selector with flag, format mask per locale, validation. Field renders `tel:` link with formatted display.

- **Props:** `defaultCountry`, `allowedCountries`, `source`, `displayFormat`
- **ra-core:** `useInput`, `useRecordContext`
- **Dep:** `libphonenumber-js` (~140KB, tree-shakeable)
- **Gap:** no phone primitive. CRM / B2B / contact-management need.

### 7. `<CurrencyInput>` + `<CurrencyField>`

Locale-aware money entry/display with ISO-4217 selector. Stores `{ amount, currency }` or minor units. Format via `Intl.NumberFormat`.

- **Props:** `currencies`, `displayLocale`, `storeAsMinorUnits`, `source`, `allowCurrencyChange`
- **ra-core:** `useInput`, `useRecordContext`, `useLocaleState`
- **Dep:** none (Intl built-in)
- **Gap:** `number-input` is unitless. Finance + ecom archetypes need currency-aware widget with locale formatting.

### 8. `<RatingInput>` + `<RatingField>`

N-star rating with half-step + keyboard + clear button. Field is read-only display with optional count.

- **Props:** `max`, `allowHalf`, `icon`, `source`, `countSource`
- **ra-core:** `useInput`, `useRecordContext`
- **Dep:** none (svg + shadcn `toggle-group`)
- **Gap:** demo has `reviews/` resource but ships no rating widget. Implementations are bespoke per app.

### 9. `<DurationInput>` + `<DurationField>`

ISO-8601 duration editor (`PT2H30M`) with human input ("2h 30m"). Configurable units (s/m/h/d/w). Field renders `2h 30m` or relative.

- **Props:** `units`, `displayFormat`, `source`, `min`, `max`
- **ra-core:** `useInput`, `useRecordContext`
- **Dep:** `date-fns` (already transitive via ra-core date utils)
- **Gap:** scheduling / timesheet / ops archetypes need. `date-input` covers instants only.

### 10. `<ColorInput>` + `<ColorField>`

Hex / oklch / rgb color picker with swatches palette + eyedropper (Chrome). Field renders chip + label.

- **Props:** `format` (`hex` | `oklch` | `rgb`), `swatches`, `source`, `allowAlpha`
- **ra-core:** `useInput`, `useRecordContext`
- **Dep:** none (native `<input type="color">` + custom popover)
- **Gap:** kit ships oklch theme system but no end-user color picker. Design/branding/category-tag admin need.

### 11. `<CronInput>` + `<CronField>`

Cron expression editor with human-readable preview ("Every Tuesday 9am"). Field renders preview + next-run timestamp.

- **Props:** `source`, `precision` (`minutes` | `seconds`), `timezone`, `previewNextRuns`
- **ra-core:** `useInput`, `useRecordContext`
- **Dep:** `cronstrue` (~10KB) for human preview
- **Gap:** scheduling / ops / job-config archetypes need. No scheduling primitive in kit.

---

## Category 3 — Workflow / process above CRUD (5)

### 12. `<ApprovalQueue>`

Pending-approval inbox view with approve/reject + reason capture + bulk action. Reads `?status=pending`, posts atomic `{ status, approver, reason }`.

- **Props:** `resource`, `filter`, `onApprove`, `onReject`, `requireReason`, `bulkEnabled`
- **ra-core:** `useListController`, `useUpdateMany`, `useGetIdentity`
- **Dep:** none
- **Gap:** compliance/finance archetype unserved. Existing list-view doesn't capture approver + reason atomically.

### 13. `<DualApprovalButton>`

4-eyes / segregation-of-duties action. Two distinct approvers required, shows "1 of 2" pending state, blocks self-approval.

- **Props:** `resource`, `action`, `requiredApprovers`, `approverFieldSource`
- **ra-core:** `useUpdate`, `useGetIdentity`, `useRecordContext`
- **Dep:** none
- **Gap:** no SOX / dual-control primitive. Compliance archetype critical, every user reinvents.

### 14. `<JobMonitor>`

Background job queue dashboard. Live grid of running/queued/failed jobs with retry, cancel, payload-inspect, log-tail. Auto-refresh interval.

- **Props:** `resource`, `pollInterval`, `actions`, `logTailSource`
- **ra-core:** `useGetList` with polling, `useUpdate`, `useDelete`
- **Dep:** none (TanStack Query polling already in)
- **Gap:** ops archetype unserved. No async-job primitive — admins drop to raw queries.

### 15. `<StatusTransitionButton>`

FSM-aware status change. Reads allowed transitions from record state + config, only enables valid moves, optional guard prompt.

- **Props:** `transitions: Record<State, State[]>`, `guards`, `source`, `confirm`
- **ra-core:** `useUpdate`, `useRecordContext`
- **Dep:** none
- **Gap:** orders/tickets/workflows need state-machine UI. Current pattern uses raw `select-input`, losing transition safety.

### 16. `<BulkEditDrawer>`

Multi-record side-panel form for in-place batch edit. Inherits filter context, applies same diff to all selected via `updateMany`. Sheet (not modal) so list stays visible.

- **Props:** `fields`, `selectedIds`, `onSuccess`, `side` (`right` | `bottom`)
- **ra-core:** `useListContext`, `useUpdateMany`
- **Dep:** shadcn `sheet`
- **Gap:** existing `bulk-update-button` triggers full modal. Drawer with contextual list-visibility is different UX. Ops + ecom archetypes heavy use.

---

## Category 4 — Dev-experience / meta (5)

### 17. `<DataProviderDevtools>`

In-browser inspector of dataProvider calls. Floating panel logs every `getList`/`getOne`/`update` with req payload, response, timing, cache hit/miss, error trace. Toggle with keyboard shortcut.

- **Props:** `enabled`, `position`, `maxLogs`, `keyboardShortcut`
- **ra-core:** wraps `dataProvider` via proxy, taps `useQueryClient`
- **Dep:** none
- **Gap:** existing `inspector` is layout/theme editor; no req/res tracer. Builder DX win.

### 18. `<SchemaDrivenView>`

Generate List/Edit/Show at runtime from JSON Schema or OpenAPI spec. Maps schema types to field/input components (string → text-input, format=email → email-input, etc.).

- **Props:** `schema`, `resource`, `mode` (`list` | `edit` | `show`), `overrides`, `fieldMap`
- **ra-core:** `useResourceContext`, all CRUD hooks
- **Dep:** `ajv` optional (for validation)
- **Gap:** guessers introspect response data — no spec-driven generator. Ops + internal-tools archetype.

### 19. `<ThemeStudio>`

Live-edit oklch tokens for current theme with side-by-side preview. Adjusts CSS vars in real time, exports `theme.ts` snippet.

- **Props:** `tokens`, `onExport`, `previewComponents`
- **ra-core:** `useTheme`, `useThemesContext`
- **Dep:** none
- **Gap:** kit ships 5 themes + `theme-mode-toggle` (light/dark flip) but no live token editor. Designers/branders must edit ts files cold.

### 20. `<LayoutBuilder>`

Drag-drop assemble List columns / Show layout / Edit form. Persist arrangement per user via `useStore`.

- **Props:** `resource`, `mode`, `availableFields`, `storeKey`
- **ra-core:** `useStore`, `useResourceDefinition`, `useListContext`
- **Dep:** `dnd-kit`
- **Gap:** `configurable` + `fields-selector` toggle visibility — no full drag-reorder layout composer. Internal-tools archetype heavy.

### 21. `<I18nKeyEditor>`

Runtime missing-translation capture. Logs every `t()` call with missing key, surfaces editable inline panel, exports JSON patch to locale file. Toggle in dev mode.

- **Props:** `enabled`, `locales`, `onExport`, `keyboardShortcut`
- **ra-core:** wraps i18n provider, `useTranslate`
- **Dep:** none
- **Gap:** kit has `translatable-fields/inputs` but no key-capture devtool. Adding new strings = manual file edit, easy to miss locales.

---

## Implementation prioritization (advisory, non-binding)

Not all 21 belong in the next release. Suggested grouping by sequencing logic:

### Tier 1 — broad utility, low dep cost, no new architecture

- 6 `<PhoneInput>` / `<PhoneField>`
- 7 `<CurrencyInput>` / `<CurrencyField>`
- 8 `<RatingInput>` / `<RatingField>`
- 10 `<ColorInput>` / `<ColorField>`
- 9 `<DurationInput>` / `<DurationField>`

Five field/input pairs that every admin app eventually needs. Each is small, self-contained, follows existing field+input convention. Ship together as a "common inputs" batch.

### Tier 2 — high-value workflow primitives

- 12 `<ApprovalQueue>`
- 15 `<StatusTransitionButton>`
- 16 `<BulkEditDrawer>`
- 2 `<UsageMeterField>`
- 11 `<CronInput>` / `<CronField>`

Each unlocks a workflow pattern admins currently hand-roll. Tier 2 needs no new architecture beyond existing ra-core hooks.

### Tier 3 — new domain (SaaS billing)

- 1 `<SubscriptionPlanField>` / `<SubscriptionPlanPicker>`
- 3 `<ApiKeyField>` / `<ApiKeyInput>`
- 4 `<WebhookEndpointInput>` / `<WebhookEndpointField>`
- 5 `<CommentsThread>`
- 13 `<DualApprovalButton>`

Net-new domain primitives. Bigger surface area, may pull in new conventions (e.g., dual-control needs ACL hooks). Ship as a "SaaS / collab" batch.

### Tier 4 — dev-experience (separate epic)

- 17 `<DataProviderDevtools>`
- 18 `<SchemaDrivenView>`
- 19 `<ThemeStudio>`
- 20 `<LayoutBuilder>`
- 21 `<I18nKeyEditor>`

Meta-tooling. Each is a sub-project in itself. `<SchemaDrivenView>` alone is plan-worthy. Carve out as own epic, not part of common-component release.

### Tier 5 — defer

- 14 `<JobMonitor>` — needs job-queue convention on dataProvider side. Pair with backend doc on async-job pattern.

---

## Out of scope for this spec

- Per-component full design (props in full TS, render layouts, test plans)
- Implementation order beyond advisory tiering
- Storybook / docs page templates
- Migration impact on existing demos

Each picked component will need its own design doc and implementation plan via the usual brainstorming → writing-plans → implementation flow.

## Decision needed from approver

After reviewing this spec, choose:

1. **Pick a Tier or subset of ideas** to take into the writing-plans phase next.
2. **Drop or merge any ideas** that read weaker on second look.
3. **Re-order tiers** if business priority differs.

The brainstorming flow ends here. Next step (if approved): pick subset, then invoke `writing-plans` per chosen component (or per tier).
