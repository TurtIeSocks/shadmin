# Chelone P4: Controllers as Vanilla Stores — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the crown jewels — list/edit/create/show/delete controllers as framework-neutral observable stores (micro-store + `QueryObserver`/`MutationObserver` + actions), a vanilla notification queue, and their React bridges — carrying ra-core's edge-case behavior without its React coupling.

**Architecture:** A controller = one **micro-store** (single-object state, `subscribe`/`getSnapshot`/`setState`/`destroy`) + query-core **observers** wired to the P2 factories + **actions**. React bridges via `useSyncExternalStore`, one hook per controller, destroy on unmount. Params persist to the P3 KV store (`${resource}.listParams`); URL sync is a P6 router-adapter concern (controllers stay router-free — redirects are emitted as callback *requests*). **De-risk gate (charter §10):** the list controller is built and validated end-to-end (vanilla + React + adversarial behavior tests) BEFORE edit/create/show reuse the pattern — Task 4's review is the pattern gate.

**Tech Stack:** no new deps. `@tanstack/query-core` observers (already a peer), P3 store/i18n/notification, P2 factories.

## Global Constraints

- **Repo:** `chelone`, branch `main`. Never commit `.superpowers/`. Boundary lint unchanged (no react in core).
- **Zero new runtime deps** in core.
- **Controllers never touch the router or window**: redirects surface as `options.onRedirect?.(target, resource, id?, data?)` callback requests; scroll behavior is the adapter's job. No `window`/`location` anywhere in core controllers.
- **Default mutationMode = `'pessimistic'`** everywhere (charter §11 — NOT ra's `undoable` edit default). `'undoable'` does not exist yet.
- **Multi-sort (§11):** controller sort state is `SortPayload[]`; `GetListParams.sort` widens to `SortPayload | SortPayload[]`; the fake provider applies multi-key sort in order.
- **Never mutate state in place** (ra's `queryReducer` SHOW_FILTER `lodash.set` footgun — recon #9): every state transition produces fresh objects.
- **Notification messages are i18n keys** with resource-scoped fallback: try `resources.{resource}.notifications.{event}`, fall back to `chelone.notification.{event}` (our `translate` returns the key when missing — the helper detects that).
- **Snapshot stability:** micro-store `getSnapshot` returns the same reference until `setState`; controller snapshots merge query-observer results ONLY on observer notifications (no per-read object building).
- Type tests `*.test-d.ts`, runtime `*.test.ts`. `biome check --write` before every commit. Conventional Commits.

### ra-core behavior being carried (recon ground truth — binding on Tasks 3–7)

1. `setSort` on the SAME field toggles order; different field → `ASC` (unless given). Sort/perPage/filter changes reset `page=1`; `setPage` does not.
2. Out-of-range resets: (`page<=0` OR non-fetching empty data on `page>1`) → page 1; `total!=null && page > max(ceil(total/perPage),1)` → last page (delete-last-item-on-last-page).
3. `setFilters` strips empty values (`removeEmpty`), keeps `displayedFilters` when arg undefined, optional debounce (default 500 ms) with a disposed-guard.
4. Permanent `filter` option merges OVER user filter for the fetch: `{...userFilter, ...permanentFilter}`.
5. Keep-previous-data while fetching the next page (`placeholderData: prev => prev`).
6. `hasNextPage`/`hasPreviousPage`: prefer `pageInfo`, else derive from `total`, else `undefined` (cursor/total-less backends first-class).
7. Selection lives in the P3 KV store (`${storeKey||resource}.selectedIds`) — survives refetch/sort/filter; only explicit unselect or delete clears it. `selectAll` caps at `limit=250` and notifies `chelone.message.select_all_limit_reached` (`{max}`) when hit.
8. Edit/show: `getOne` with `retry: false`; fetched `record.id != id` (loose) → error state; fetch error → notify `chelone.notification.item_doesnt_exist` + redirect-request `'list'`.
9. Save flow: transform priority call-time > controller option > identity (async OK; edit's transform receives `{previousData}`); a rejected mutation whose error is `ValidationError` → `save` RESOLVES with `error.fieldErrors` (form-consumable, P5) and does NOT notify; other errors notify `chelone.notification.http_error` with the error message arg.
10. Success defaults: notify `updated`/`created`/`deleted` (resource-scoped fallback, `messageArgs: {smart_count: 1}`) + redirect-request (create → `'edit'` of new record; edit → `'list'`; delete → `'list'` + unselect the id). Caller-supplied `onSuccess` REPLACES the default entirely.

---

## File Structure

```
packages/core/src/
  store/micro-store.ts            MicroStore<T> (+ destroy)  — closes P3 deferred dispose minor
  store/micro-store.test.ts
  notification/notification-store.ts   typed queue: notify/dismiss/subscribe
  notification/notification-store.test.ts
  controller/list-controller.ts   createListController
  controller/list-controller.test.ts
  controller/record-controllers.ts createEditController, createShowController, createCreateController, createDeleteController
  controller/record-controllers.test.ts
  controller/translate-fallback.ts  resource-scoped key fallback helper
  data/types.ts                   MODIFY: sort widens to SortPayload | SortPayload[]
  data/fake-provider.ts           MODIFY: multi-key sort
  index.ts                        EXTEND barrel
packages/react/src/
  controller-hooks.ts             useListController/useEditController/useCreateController/useShowController/useDeleteController
  notification-hooks.ts           useNotifications, useNotify
  p4-hooks.test.tsx
  context.tsx                     EXTEND: CheloneProvider gains notifications?: NotificationStore
  index.ts                        EXTEND barrel
```

**Model hints:** Task 1 subtle (review); Task 2 mechanical; Tasks 3–4 the hardest of the project so far (session model, review — Task 4 review = PATTERN GATE); Tasks 5–6 heavy (review); Task 7 integration (review); Task 8 mechanical.

---

## Task 1: MicroStore — single-object observable state with destroy

**Files:**
- Create: `packages/core/src/store/micro-store.ts`
- Test: `packages/core/src/store/micro-store.test.ts`

**Interfaces:**
- Produces:
  - `interface MicroStore<T> { getSnapshot(): T; setState(update: Partial<T> | ((prev: T) => Partial<T>)): void; subscribe(callback: () => void): () => void; destroy(): void; onDestroy(cleanup: () => void): void }`
  - `function createMicroStore<T extends object>(initial: T): MicroStore<T>`
  - Semantics: `setState` shallow-merges into a FRESH object and notifies (skip when every merged entry is `Object.is`-equal — no-op writes are silent); after `destroy()` all registered `onDestroy` cleanups run once, subscribers are cleared, and further `setState` is a no-op.

- [ ] **Step 1: Write failing tests**

`packages/core/src/store/micro-store.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { createMicroStore } from "./micro-store";

describe("createMicroStore", () => {
  it("getSnapshot is reference-stable until setState", () => {
    const store = createMicroStore({ page: 1, sort: [] as string[] });
    const a = store.getSnapshot();
    expect(store.getSnapshot()).toBe(a);
    store.setState({ page: 2 });
    const b = store.getSnapshot();
    expect(b).not.toBe(a);
    expect(b).toEqual({ page: 2, sort: [] });
    expect(a).toEqual({ page: 1, sort: [] }); // previous snapshot untouched (no in-place mutation)
  });

  it("supports updater functions and notifies subscribers once per setState", () => {
    const store = createMicroStore({ n: 1 });
    const cb = vi.fn();
    store.subscribe(cb);
    store.setState((prev) => ({ n: prev.n + 1 }));
    expect(store.getSnapshot().n).toBe(2);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("no-op writes (all Object.is-equal) do not notify", () => {
    const store = createMicroStore({ n: 1 });
    const cb = vi.fn();
    store.subscribe(cb);
    store.setState({ n: 1 });
    expect(cb).not.toHaveBeenCalled();
  });

  it("unsubscribe works and destroy clears subscribers, runs cleanups once, freezes state", () => {
    const store = createMicroStore({ n: 1 });
    const cb = vi.fn();
    const cleanup = vi.fn();
    store.subscribe(cb);
    store.onDestroy(cleanup);
    store.destroy();
    store.destroy(); // idempotent
    expect(cleanup).toHaveBeenCalledTimes(1);
    store.setState({ n: 9 });
    expect(store.getSnapshot().n).toBe(1);
    expect(cb).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run to verify failure** (`cannot find module ./micro-store`)

Run: `cd chelone && pnpm --filter @chelone/core test`

- [ ] **Step 3: Implement `packages/core/src/store/micro-store.ts`**

```ts
/**
 * Single-object observable state for controllers. Distinct from the keyed KV
 * ChelonStore (preferences): one object, whole-snapshot subscription, and an
 * explicit destroy() lifecycle for observer teardown.
 */
export interface MicroStore<T> {
  getSnapshot(): T;
  setState(update: Partial<T> | ((prev: T) => Partial<T>)): void;
  subscribe(callback: () => void): () => void;
  destroy(): void;
  onDestroy(cleanup: () => void): void;
}

export function createMicroStore<T extends object>(initial: T): MicroStore<T> {
  let state = initial;
  let destroyed = false;
  const subscribers = new Set<() => void>();
  const cleanups = new Set<() => void>();

  return {
    getSnapshot: () => state,
    setState(update) {
      if (destroyed) return;
      const patch = typeof update === "function" ? update(state) : update;
      let changed = false;
      for (const [key, value] of Object.entries(patch)) {
        if (!Object.is(state[key as keyof T], value)) {
          changed = true;
          break;
        }
      }
      if (!changed) return;
      state = { ...state, ...patch };
      for (const cb of subscribers) cb();
    },
    subscribe(callback) {
      subscribers.add(callback);
      return () => void subscribers.delete(callback);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      for (const cleanup of cleanups) cleanup();
      cleanups.clear();
      subscribers.clear();
    },
    onDestroy(cleanup) {
      if (destroyed) {
        cleanup();
        return;
      }
      cleanups.add(cleanup);
    },
  };
}
```

- [ ] **Step 4: Verify pass; format; commit**

```bash
cd chelone && pnpm --filter @chelone/core test && pnpm exec biome check --write packages/core/src/store && pnpm lint
git add packages/core/src/store && git commit -m "feat(core): MicroStore — observable single-object state with destroy lifecycle"
```

---

## Task 2: Notification store

**Files:**
- Create: `packages/core/src/notification/notification-store.ts`
- Test: `packages/core/src/notification/notification-store.test.ts`

**Interfaces:**
- Produces:
  - `interface Notification { id: number; message: string; type: "info" | "success" | "warning" | "error"; messageArgs?: Record<string, unknown> }`
  - `interface NotificationStore { notify(message: string, options?: { type?: Notification["type"]; messageArgs?: Record<string, unknown> }): number; dismiss(id: number): void; clear(): void; getSnapshot(): readonly Notification[]; subscribe(callback: () => void): () => void }`
  - `function createNotificationStore(): NotificationStore`
  - Semantics: `notify` returns the id; snapshot is a fresh frozen array per change, reference-stable between changes; `message` is an i18n KEY (rendering + translation is the UI's job); default type `"info"`. (Undoable payloads join this shape post-P4.)

- [ ] **Step 1: Write failing tests**

`packages/core/src/notification/notification-store.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { createNotificationStore } from "./notification-store";

describe("createNotificationStore", () => {
  it("notify appends, returns id; dismiss removes; clear empties", () => {
    const store = createNotificationStore();
    const id1 = store.notify("chelone.notification.updated", {
      type: "success",
      messageArgs: { smart_count: 1 },
    });
    const id2 = store.notify("chelone.notification.http_error", { type: "error" });
    expect(store.getSnapshot().map((n) => n.id)).toEqual([id1, id2]);
    store.dismiss(id1);
    expect(store.getSnapshot().map((n) => n.id)).toEqual([id2]);
    store.clear();
    expect(store.getSnapshot()).toEqual([]);
  });

  it("snapshot is reference-stable between changes and fresh after a change", () => {
    const store = createNotificationStore();
    const a = store.getSnapshot();
    expect(store.getSnapshot()).toBe(a);
    store.notify("k");
    expect(store.getSnapshot()).not.toBe(a);
  });

  it("subscribers fire on notify and dismiss; unsubscribe stops them", () => {
    const store = createNotificationStore();
    const cb = vi.fn();
    const unsub = store.subscribe(cb);
    const id = store.notify("k");
    store.dismiss(id);
    expect(cb).toHaveBeenCalledTimes(2);
    unsub();
    store.notify("k2");
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it("defaults type to info", () => {
    const store = createNotificationStore();
    store.notify("k");
    expect(store.getSnapshot()[0]?.type).toBe("info");
  });
});
```

- [ ] **Step 2: Run to verify failure**

- [ ] **Step 3: Implement `packages/core/src/notification/notification-store.ts`**

```ts
export interface Notification {
  id: number;
  /** An i18n message KEY — translation/rendering is the UI layer's job. */
  message: string;
  type: "info" | "success" | "warning" | "error";
  messageArgs?: Record<string, unknown>;
}

export interface NotificationStore {
  notify(
    message: string,
    options?: { type?: Notification["type"]; messageArgs?: Record<string, unknown> },
  ): number;
  dismiss(id: number): void;
  clear(): void;
  getSnapshot(): readonly Notification[];
  subscribe(callback: () => void): () => void;
}

export function createNotificationStore(): NotificationStore {
  let notifications: readonly Notification[] = [];
  let nextId = 1;
  const subscribers = new Set<() => void>();
  const emit = () => {
    for (const cb of subscribers) cb();
  };

  return {
    notify(message, options = {}) {
      const id = nextId++;
      notifications = [
        ...notifications,
        { id, message, type: options.type ?? "info", messageArgs: options.messageArgs },
      ];
      emit();
      return id;
    },
    dismiss(id) {
      const next = notifications.filter((n) => n.id !== id);
      if (next.length === notifications.length) return;
      notifications = next;
      emit();
    },
    clear() {
      if (notifications.length === 0) return;
      notifications = [];
      emit();
    },
    getSnapshot: () => notifications,
    subscribe(callback) {
      subscribers.add(callback);
      return () => void subscribers.delete(callback);
    },
  };
}
```

- [ ] **Step 4: Verify pass; format; commit**

```bash
cd chelone && pnpm --filter @chelone/core test && pnpm exec biome check --write packages/core/src/notification && pnpm lint
git add packages/core/src/notification && git commit -m "feat(core): notification store (typed i18n-key queue)"
```

---

## Task 3: List controller (vanilla) + multi-sort contract widening

**Files:**
- Create: `packages/core/src/controller/list-controller.ts`, `packages/core/src/controller/translate-fallback.ts`
- Modify: `packages/core/src/data/types.ts` (sort widening), `packages/core/src/data/fake-provider.ts` (multi-key sort)
- Test: `packages/core/src/controller/list-controller.test.ts` (+ extend `fake-provider.test.ts` with one multi-sort case)

**Interfaces:**
- Consumes: `createMicroStore` (T1), `NotificationStore` (T2), `DataContext` + `getListOptions` (P2), `ChelonStore` (P3), `QueryObserver` from `@tanstack/query-core`.
- Produces:
  - In `data/types.ts`: `sort?: SortPayload | SortPayload[]` on `GetListParams`/`GetManyReferenceParams`.
  - `translate-fallback.ts`: `resourceMessageKey(translateOrUndefined, resource, event)` — returns `resources.{resource}.notifications.{event}` if a translator translates it (result !== key), else `chelone.notification.{event}`. Signature: `function resolveNotificationKey(translate: ((key: string) => string) | undefined, resource: string, event: string): string`.
  - `interface ListControllerState<TRecord>` — `{ page: number; perPage: number; sort: SortPayload[]; filter: FilterPayload; displayedFilters: Record<string, boolean>; selectedIds: Identifier[]; data: TRecord[] | undefined; total: number | undefined; pageInfo: PageInfo | undefined; isPending: boolean; isFetching: boolean; error: unknown; hasNextPage: boolean | undefined; hasPreviousPage: boolean | undefined }`
  - `interface ListController<TRecord> extends MicroStore<ListControllerState<TRecord>>` plus actions: `setPage(page)`, `setPerPage(perPage)`, `setSort(sort: SortPayload | SortPayload[])` (toggle on same single field), `setFilters(filter, displayedFilters?, debounced?)`, `showFilter(name, defaultValue?)`, `hideFilter(name)`, `select(ids)`, `toggleItem(id)`, `unselectAll()`, `selectAll(options?: { limit?: number })`, `refetch()`.
  - `function createListController<TResources extends ResourceMap, TName extends keyof TResources & string>(ctx: ListControllerContext<TResources>, resource: TName, options?: ListControllerOptions<...>): ListController<RecordOf<TResources, TName>>` where `ListControllerContext = DataContext & { store?: ChelonStore; notifications?: NotificationStore; translate?: (key: string) => string }` and options include `{ perPage?: number; sort?: SortPayload | SortPayload[]; filter?: FilterPayload (permanent); filterDefaultValues?: FilterPayload; debounceMs?: number; storeKey?: string | false; enabled?: boolean }`.

**Behavior (binding — carries recon rules 1–7):**
- Initial params: persisted `${storeKey||resource}.listParams` from `ctx.store` (when storeKey not false) → else `{ filter: filterDefaultValues ?? {}, sort: normalized options.sort ?? [{field:'id',order:'ASC'}], page: 1, perPage: options.perPage ?? 10 }`.
- Param changes write back to the KV store (same key) — persistence, not URL (P6).
- Query wiring: ONE `QueryObserver` on `getListOptions(ctx, resource, { pagination: {page, perPage}, sort: state.sort (array; pass single object when length===1 for adapter compat), filter: {...state.filter, ...options.filter} })` with `placeholderData: prev => prev` and `retry: false` merged into the options object. On every param change: `observer.setOptions(newOptions)`. Observer results map into micro-store state (`data/total/pageInfo/isPending/isFetching/error` + derived `hasNextPage/hasPreviousPage` per recon rule 6).
- Out-of-range resets (recon rule 2) evaluated on observer updates.
- `setSort`: single payload + same field as current single sort → toggle order; otherwise replace (array input replaces wholesale). Resets page=1. `setPerPage`/`setFilters` reset page=1; `setPage` doesn't.
- `setFilters` strips empty values (`''`, `null`, `undefined` — write a local `removeEmpty`), preserves `displayedFilters` when undefined, debounced when `debounced=true` (timer cleared on destroy — no post-destroy dispatch). NEVER mutates previous filter objects.
- Selection: read/write `${storeKey||resource}.selectedIds` via `ctx.store` when available, else local state only. `selectAll` fetches page 1 with `perPage: limit ?? 250` via `ctx.queryClient.fetchQuery(getListOptions(...))`; if result length === limit → `ctx.notifications?.notify('chelone.message.select_all_limit_reached', { type: 'warning', messageArgs: { max: limit } })`.
- Query error → `ctx.notifications?.notify(error message key fallback 'chelone.notification.http_error', { type: 'error', messageArgs: { _: String(error) } })`.
- `destroy()` unsubscribes the observer, cancels debounce timers, unsubscribes store subscriptions (register all through `onDestroy`).

- [ ] **Step 1: Write failing tests**

`packages/core/src/controller/list-controller.test.ts` (representative — implementer may add cases, not remove):

```ts
import { QueryClient } from "@tanstack/query-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { defineResources } from "../resource/registry";
import { createStore } from "../store/store";
import { createNotificationStore } from "../notification/notification-store";
import { fakeDataProvider } from "../data/fake-provider";
import { createListController } from "./list-controller";

const resources = defineResources({
  posts: { schema: z.object({ id: z.number(), title: z.string(), views: z.number() }) },
});
const rows = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  title: `t${String(i + 1).padStart(2, "0")}`,
  views: (i * 7) % 5,
}));

function makeCtx() {
  return {
    dataProvider: fakeDataProvider<typeof resources>({ posts: structuredClone(rows) }),
    queryClient: new QueryClient({ defaultOptions: { queries: { retry: false } } }),
    store: createStore(),
    notifications: createNotificationStore(),
  };
}
const flush = () => vi.waitFor(() => Promise.resolve());
const settled = async (c: { getSnapshot: () => { isPending: boolean } }) =>
  vi.waitFor(() => expect(c.getSnapshot().isPending).toBe(false));

describe("createListController", () => {
  beforeEach(() => vi.useRealTimers());

  it("fetches page 1 with defaults and exposes data/total", async () => {
    const c = createListController(makeCtx(), "posts", {});
    await settled(c);
    const s = c.getSnapshot();
    expect(s.data?.length).toBe(10);
    expect(s.total).toBe(25);
    expect(s.page).toBe(1);
    expect(s.hasNextPage).toBe(true);
    expect(s.hasPreviousPage).toBe(false);
    c.destroy();
  });

  it("setSort toggles order on the same field and resets page", async () => {
    const c = createListController(makeCtx(), "posts", {});
    await settled(c);
    c.setPage(2);
    c.setSort({ field: "title", order: "ASC" });
    expect(c.getSnapshot().page).toBe(1);
    expect(c.getSnapshot().sort).toEqual([{ field: "title", order: "ASC" }]);
    c.setSort({ field: "title" } as never); // same field, no explicit order -> toggle
    expect(c.getSnapshot().sort).toEqual([{ field: "title", order: "DESC" }]);
    c.destroy();
  });

  it("multi-sort: array replaces wholesale and reaches the provider", async () => {
    const ctx = makeCtx();
    const spy = vi.spyOn(ctx.dataProvider, "getList");
    const c = createListController(ctx, "posts", {});
    await settled(c);
    c.setSort([
      { field: "views", order: "ASC" },
      { field: "title", order: "DESC" },
    ]);
    await settled(c);
    const lastCall = spy.mock.calls.at(-1)?.[1];
    expect(lastCall?.sort).toEqual([
      { field: "views", order: "ASC" },
      { field: "title", order: "DESC" },
    ]);
    c.destroy();
  });

  it("setFilters strips empties, resets page, keeps displayedFilters when undefined; never mutates previous filter", async () => {
    const c = createListController(makeCtx(), "posts", {});
    await settled(c);
    c.showFilter("title", undefined);
    const before = c.getSnapshot().filter;
    c.setFilters({ title: "t0", views: "" });
    expect(c.getSnapshot().filter).toEqual({ title: "t0" });
    expect(before).toEqual({}); // untouched
    expect(c.getSnapshot().displayedFilters).toEqual({ title: true });
    c.destroy();
  });

  it("permanent filter merges over user filter for the fetch", async () => {
    const ctx = makeCtx();
    const spy = vi.spyOn(ctx.dataProvider, "getList");
    const c = createListController(ctx, "posts", { filter: { views: 0 } });
    await settled(c);
    c.setFilters({ views: 3, title: "x" });
    await settled(c);
    expect(spy.mock.calls.at(-1)?.[1]?.filter).toEqual({ title: "x", views: 0 });
    c.destroy();
  });

  it("out-of-range page resets to last page when data shrinks", async () => {
    const ctx = makeCtx();
    const c = createListController(ctx, "posts", {});
    await settled(c);
    c.setPage(3); // rows 21-25
    await settled(c);
    await ctx.dataProvider.deleteMany("posts", { ids: [21, 22, 23, 24, 25] });
    c.refetch();
    await vi.waitFor(() => expect(c.getSnapshot().page).toBe(2));
    c.destroy();
  });

  it("selection persists in the KV store across controller instances and selectAll caps + warns", async () => {
    const ctx = makeCtx();
    const c1 = createListController(ctx, "posts", {});
    await settled(c1);
    c1.toggleItem(1);
    c1.toggleItem(2);
    c1.destroy();
    const c2 = createListController(ctx, "posts", {});
    await settled(c2);
    expect(c2.getSnapshot().selectedIds).toEqual([1, 2]);
    await c2.selectAll({ limit: 10 });
    expect(c2.getSnapshot().selectedIds.length).toBe(10);
    expect(
      ctx.notifications
        .getSnapshot()
        .some((n) => n.message === "chelone.message.select_all_limit_reached"),
    ).toBe(true);
    c2.destroy();
  });

  it("debounced setFilters collapses rapid calls and is cancelled by destroy", async () => {
    vi.useFakeTimers();
    const ctx = makeCtx();
    const c = createListController(ctx, "posts", { debounceMs: 300 });
    c.setFilters({ title: "a" }, undefined, true);
    c.setFilters({ title: "ab" }, undefined, true);
    vi.advanceTimersByTime(300);
    expect(c.getSnapshot().filter).toEqual({ title: "ab" });
    c.setFilters({ title: "abc" }, undefined, true);
    c.destroy();
    vi.advanceTimersByTime(1000); // no post-destroy dispatch, no throw
    expect(c.getSnapshot().filter).toEqual({ title: "ab" });
    vi.useRealTimers();
  });

  it("params persist to the KV store and rehydrate", async () => {
    const ctx = makeCtx();
    const c1 = createListController(ctx, "posts", {});
    await settled(c1);
    c1.setPerPage(5);
    c1.setSort({ field: "title", order: "DESC" });
    c1.destroy();
    const c2 = createListController(ctx, "posts", {});
    expect(c2.getSnapshot().perPage).toBe(5);
    expect(c2.getSnapshot().sort).toEqual([{ field: "title", order: "DESC" }]);
    c2.destroy();
  });

  it("destroy unsubscribes the query observer (no further state updates)", async () => {
    const ctx = makeCtx();
    const c = createListController(ctx, "posts", {});
    await settled(c);
    const snap = c.getSnapshot();
    c.destroy();
    c.setPage(2);
    expect(c.getSnapshot()).toBe(snap);
  });
});
```

Add to `packages/core/src/data/fake-provider.test.ts`:

```ts
it("getList applies multi-key sort in order", async () => {
  const dp = seed();
  const r = await dp.getList("posts", {
    sort: [
      { field: "author_id", order: "ASC" },
      { field: "title", order: "DESC" },
    ],
  });
  expect(r.data.map((p) => p.id)).toEqual([3, 1, 2]);
});
```

- [ ] **Step 2: Run to verify failure**

- [ ] **Step 3: Implement**

`data/types.ts` — widen: `sort?: SortPayload | SortPayload[];` in `GetListParams` and `GetManyReferenceParams`.

`data/fake-provider.ts` — `applySort` accepts `SortPayload | SortPayload[] | undefined`, normalizes to array, compares by each key in order until non-zero.

`controller/translate-fallback.ts`:

```ts
/** Resource-scoped notification key with global fallback. A translator that
 * returns the key unchanged (Chelone i18n's missing-key behavior) means
 * "not translated" — fall back to the global key. */
export function resolveNotificationKey(
  translate: ((key: string) => string) | undefined,
  resource: string,
  event: string,
): string {
  const scoped = `resources.${resource}.notifications.${event}`;
  if (translate && translate(scoped) !== scoped) return scoped;
  return `chelone.notification.${event}`;
}
```

`controller/list-controller.ts` — the full controller per the Behavior block above. Structural skeleton (implementer fills per behavior contract + tests; key wiring shown):

```ts
import { QueryObserver, type QueryClient } from "@tanstack/query-core";
import { createMicroStore, type MicroStore } from "../store/micro-store";
// ... type imports (DataContext, ChelonStore, NotificationStore, SortPayload, etc.)

export function createListController(ctx, resource, options = {}) {
  const storeKey = options.storeKey === false ? null : (options.storeKey ?? resource);
  const paramsKey = storeKey ? `${storeKey}.listParams` : null;
  const selectionKey = storeKey ? `${storeKey}.selectedIds` : null;

  const persisted = paramsKey ? ctx.store?.getItem(paramsKey) : undefined;
  const initialParams = normalizeParams(persisted, options); // sort normalized to array

  const store = createMicroStore({ ...initialParams, selectedIds: readSelection(), data: undefined, total: undefined, pageInfo: undefined, isPending: true, isFetching: false, error: null, hasNextPage: undefined, hasPreviousPage: undefined });

  const buildOptions = () => {
    const s = store.getSnapshot();
    return {
      ...getListOptions(ctx, resource, {
        pagination: { page: s.page, perPage: s.perPage },
        sort: s.sort.length === 1 ? s.sort[0] : s.sort,
        filter: { ...s.filter, ...(options.filter ?? {}) },
      }),
      placeholderData: (prev: unknown) => prev,
      retry: false,
    };
  };

  const observer = new QueryObserver(ctx.queryClient, buildOptions());
  const unsubscribe = observer.subscribe((result) => {
    // map result -> state (+ derived hasNext/hasPrev), run out-of-range checks,
    // notify on error via ctx.notifications
  });
  store.onDestroy(unsubscribe);
  // param mutations: setState -> persist to KV -> observer.setOptions(buildOptions())
  // selection: KV-backed helpers; subscribe to KV key for cross-instance sync (onDestroy the unsub)
  // debounce timer id captured; onDestroy clears it
  return { ...store, /* actions */ };
}
```

The implementer writes the complete file — every behavior in the Behavior block and every test must hold. NO in-place mutation of filter/sort/displayedFilters objects anywhere.

- [ ] **Step 4: Verify pass (full core suite); format; commit**

```bash
cd chelone && pnpm --filter @chelone/core test && pnpm exec biome check --write packages/core/src && pnpm lint
git add -A && git commit -m "feat(core): vanilla list controller (multi-sort, KV persistence, selection, edge-case parity)"
```

---

## Task 4: List controller React bridge — THE PATTERN GATE

**Files:**
- Create: `packages/react/src/controller-hooks.ts` (list part), `packages/react/src/notification-hooks.ts`
- Modify: `packages/react/src/context.tsx` (CheloneProvider gains `notifications?: NotificationStore`; accessor `useChelonNotifications()` optional-returning — notifications are optional)
- Test: `packages/react/src/p4-hooks.test.tsx` (list + notification parts)

**Interfaces:**
- Produces:
  - `useListController<TResources, TName>(resource, options?)` — creates the vanilla controller ONCE (lazy `useState` initializer with the ctx from `useCheloneContext()` + store/notifications/i18n from context), subscribes via `useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot)`, `useEffect` cleanup calls `controller.destroy()`, returns `{ ...snapshot, ...actions }` with stable action identities.
  - `useNotifications(): readonly Notification[]` + `useNotify(): NotificationStore['notify']` (throws clearly without a notification store).
- **This task's review is the PATTERN-VALIDATION GATE** (charter §10 risk mitigation): if the store+observer+bridge pattern shows structural cracks — tearing, stale snapshots, unstable action identities, double-fetch on mount/StrictMode, resubscribe loops — the reviewer returns a Critical finding and the phase HALTS for redesign rather than scaling the flaw to four more controllers.

- [ ] **Step 1: Write failing tests**

`packages/react/src/p4-hooks.test.tsx`:

```tsx
import { QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  createNotificationStore,
  createStore,
  defineResources,
  fakeDataProvider,
} from "@chelone/core";
import { CheloneProvider } from "./context";
import { useListController } from "./controller-hooks";
import { useNotifications, useNotify } from "./notification-hooks";

const resources = defineResources({
  posts: { schema: z.object({ id: z.number(), title: z.string() }) },
});
const rows = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, title: `t${i + 1}` }));

function makeWrapper() {
  const notifications = createNotificationStore();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <CheloneProvider
      dataProvider={fakeDataProvider<typeof resources>({ posts: structuredClone(rows) })}
      queryClient={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      store={createStore()}
      notifications={notifications}
    >
      {children}
    </CheloneProvider>
  );
  return { wrapper, notifications };
}

describe("useListController", () => {
  it("loads data and paginates through actions", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useListController<typeof resources, "posts">("posts"), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.data?.length).toBe(10);
    act(() => result.current.setPage(2));
    await waitFor(() => expect(result.current.data?.length).toBe(2));
    expect(result.current.page).toBe(2);
  });

  it("action identities are stable across renders", async () => {
    const { wrapper } = makeWrapper();
    const { result, rerender } = renderHook(
      () => useListController<typeof resources, "posts">("posts"),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isPending).toBe(false));
    const setPage1 = result.current.setPage;
    rerender();
    expect(result.current.setPage).toBe(setPage1);
  });

  it("unmount destroys the controller (no state updates after unmount, no act warnings)", async () => {
    const { wrapper } = makeWrapper();
    const { result, unmount } = renderHook(
      () => useListController<typeof resources, "posts">("posts"),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isPending).toBe(false));
    unmount(); // destroy must tear down the QueryObserver — vitest fails on unhandled act() warnings
  });

  it("StrictMode double-mount does not double-fetch beyond the observer's dedupe or leak subscriptions", async () => {
    const { wrapper } = makeWrapper();
    const StrictWrapper = ({ children }: { children: ReactNode }) => (
      <import.meta.env.MODE extends never ? never : React.StrictMode>{/* replaced below */}</import.meta.env.MODE>
    );
    // Implementer: wrap the existing wrapper in <React.StrictMode> and assert the
    // hook still settles with correct data (this is the mount/destroy/re-mount path).
  });
});

describe("notifications", () => {
  it("useNotify pushes into the shared store; useNotifications sees it", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(
      () => ({ notify: useNotify(), list: useNotifications() }),
      { wrapper },
    );
    act(() => void result.current.notify("chelone.notification.updated", { type: "success" }));
    await waitFor(() => expect(result.current.list.length).toBe(1));
    expect(result.current.list[0]?.message).toBe("chelone.notification.updated");
  });
});
```

(The StrictMode test stub above intentionally does not compile — the implementer replaces it with a real `<React.StrictMode>` wrapper composition; the assertion contract is in the comment. Delete the broken placeholder lines.)

- [ ] **Step 2: Run to verify failure**

- [ ] **Step 3: Implement** — `controller-hooks.ts` (list part):

```ts
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createListController, type ListControllerOptions } from "@chelone/core";
import { useCheloneContext } from "./context";

export function useListController(resource, options?) {
  const ctx = useCheloneContext(); // includes store/notifications/i18n when provided
  const [controller] = useState(() => createListController(ctx, resource, options));
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  useEffect(() => () => controller.destroy(), [controller]);
  return useMemo(() => ({ ...snapshot, setPage: controller.setPage, /* ...all actions */ }), [snapshot, controller]);
}
```

Design notes (binding): controller created exactly once per mount (options changes after mount are ignored — document); actions come off the controller object so they are stable; the returned object may be rebuilt per snapshot (it's the actions that must be stable, per the test). StrictMode: mount→unmount→mount creates TWO controllers — the first is destroyed; ensure `createListController` construction is side-effect-light enough for that (observer subscribe in constructor is fine — destroy tears it down; the test pins no leaks).

Wire `notifications` into `CheloneProvider` + `useChelonNotifications` accessor (throwing variant for `useNotify`, non-throwing array default `[]` acceptable for `useNotifications`— implementer picks ONE semantic and tests it).

- [ ] **Step 4: Verify BOTH suites; format; commit**

```bash
cd chelone && pnpm test && pnpm exec biome check --write packages/react/src packages/core/src/index.ts && pnpm lint
git add -A && git commit -m "feat(react): useListController bridge + notification hooks (pattern gate)"
```

---

## Task 5: Edit + Show controllers (vanilla)

**Files:**
- Create: `packages/core/src/controller/record-controllers.ts` (edit + show halves)
- Test: `packages/core/src/controller/record-controllers.test.ts` (edit + show halves)

**Interfaces:**
- Consumes: MicroStore, QueryObserver + MutationObserver, `getOneOptions`/`updateMutationOptions` (P2), NotificationStore, `resolveNotificationKey`, `ValidationError`.
- Produces:
  - `createShowController(ctx, resource, { id, enabled? })` → MicroStore state `{ record, isPending, isFetching, error }`; `getOne` with `retry:false`; fetched `record.id != id` (loose) → error state; fetch error → notify `chelone.notification.item_doesnt_exist` (error) + `options.onRedirect?.('list', resource)`.
  - `createEditController(ctx, resource, { id, mutationMode = 'pessimistic', transform?, onRedirect?, enabled? })` → show-shape state plus `{ saving: boolean }` and:
    - `save(data, { transform?, onSuccess?, onError?, meta? }): Promise<Record<string, string | string[]> | void>` — transform priority call-time > option > identity (async supported; receives `(data, { previousData })`); mutation via `MutationObserver(ctx.queryClient, updateMutationOptions(ctx, resource, { mutationMode }))` with `{ id, data: transformed, previousData: state.record }`;
    - success default: notify `resolveNotificationKey(ctx.translate, resource, 'updated')` type success `{ smart_count: 1 }` + `onRedirect?.('list', resource, id, result)`; caller `onSuccess` REPLACES the default;
    - error: if `error instanceof ValidationError` → RESOLVE with `error.fieldErrors`, no notify (form's job, P5); else notify `chelone.notification.http_error` (error, `messageArgs: { _: String(error) }`) and resolve `undefined`; caller `onError` replaces default handling.
  - Both controllers `destroy()` tear down observers.

- [ ] **Step 1: Write failing tests** (representative core cases)

```ts
import { QueryClient } from "@tanstack/query-core";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ValidationError } from "../data/errors";
import { fakeDataProvider } from "../data/fake-provider";
import { createNotificationStore } from "../notification/notification-store";
import { defineResources } from "../resource/registry";
import { createEditController, createShowController } from "./record-controllers";

const resources = defineResources({
  posts: { schema: z.object({ id: z.number(), title: z.string() }) },
});
const makeCtx = () => ({
  dataProvider: fakeDataProvider<typeof resources>({ posts: [{ id: 1, title: "a" }] }),
  queryClient: new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } }),
  notifications: createNotificationStore(),
});
const settled = (c: { getSnapshot: () => { isPending: boolean } }) =>
  vi.waitFor(() => expect(c.getSnapshot().isPending).toBe(false));

describe("createShowController", () => {
  it("fetches the record", async () => {
    const c = createShowController(makeCtx(), "posts", { id: 1 });
    await settled(c);
    expect(c.getSnapshot().record).toMatchObject({ id: 1, title: "a" });
    c.destroy();
  });

  it("missing record notifies item_doesnt_exist and requests list redirect", async () => {
    const ctx = makeCtx();
    const onRedirect = vi.fn();
    const c = createShowController(ctx, "posts", { id: 99, onRedirect });
    await vi.waitFor(() => expect(c.getSnapshot().error).toBeTruthy());
    expect(
      ctx.notifications.getSnapshot().some((n) => n.message === "chelone.notification.item_doesnt_exist"),
    ).toBe(true);
    expect(onRedirect).toHaveBeenCalledWith("list", "posts");
    c.destroy();
  });
});

describe("createEditController", () => {
  it("save (pessimistic default) updates, notifies updated, requests list redirect", async () => {
    const ctx = makeCtx();
    const onRedirect = vi.fn();
    const c = createEditController(ctx, "posts", { id: 1, onRedirect });
    await settled(c);
    await c.save({ title: "b" });
    expect((await ctx.dataProvider.getOne("posts", { id: 1 })).data.title).toBe("b");
    expect(
      ctx.notifications.getSnapshot().some((n) => n.message === "chelone.notification.updated"),
    ).toBe(true);
    expect(onRedirect).toHaveBeenCalledWith("list", "posts", 1, expect.objectContaining({ title: "b" }));
    c.destroy();
  });

  it("transform priority: call-time beats option; receives previousData", async () => {
    const ctx = makeCtx();
    const optionTransform = vi.fn((d) => ({ ...d, via: "option" }));
    const c = createEditController(ctx, "posts", { id: 1, transform: optionTransform });
    await settled(c);
    await c.save({ title: "x" }, { transform: (d, extra) => ({ ...d, title: `${d.title}-${(extra?.previousData as { title: string }).title}` }) });
    expect(optionTransform).not.toHaveBeenCalled();
    expect((await ctx.dataProvider.getOne("posts", { id: 1 })).data.title).toBe("x-a");
    c.destroy();
  });

  it("ValidationError resolves with fieldErrors and does NOT notify", async () => {
    const ctx = makeCtx();
    ctx.dataProvider.update = () =>
      Promise.reject(new ValidationError("invalid", { title: "Required" }));
    const c = createEditController(ctx, "posts", { id: 1 });
    await settled(c);
    const errors = await c.save({ title: "" });
    expect(errors).toEqual({ title: "Required" });
    expect(ctx.notifications.getSnapshot()).toEqual([]);
    c.destroy();
  });

  it("other errors notify http_error and resolve undefined; caller onSuccess replaces defaults", async () => {
    const ctx = makeCtx();
    ctx.dataProvider.update = () => Promise.reject(new Error("boom"));
    const c = createEditController(ctx, "posts", { id: 1 });
    await settled(c);
    expect(await c.save({ title: "y" })).toBeUndefined();
    expect(
      ctx.notifications.getSnapshot().some((n) => n.message === "chelone.notification.http_error" && n.type === "error"),
    ).toBe(true);
    c.destroy();
  });
});
```

- [ ] **Step 2: Run to verify failure**

- [ ] **Step 3: Implement** the edit + show halves of `record-controllers.ts` per the Interfaces block. Shared internals allowed (one `createRecordFetch` helper for the getOne wiring) — but keep the exported functions separate and their contracts exactly as specified.

- [ ] **Step 4: Verify; format; commit**

```bash
cd chelone && pnpm --filter @chelone/core test && pnpm exec biome check --write packages/core/src/controller && pnpm lint
git add packages/core/src/controller && git commit -m "feat(core): edit + show controllers (save flow, validation-error surfacing, redirect requests)"
```

---

## Task 6: Create + Delete controllers (vanilla)

**Files:**
- Modify: `packages/core/src/controller/record-controllers.ts` (append create + delete)
- Test: extend `packages/core/src/controller/record-controllers.test.ts`

**Interfaces:**
- Produces:
  - `createCreateController(ctx, resource, { record?, transform?, onRedirect?, mutationMode = 'pessimistic' })` — no fetch; state `{ record: options.record ?? {}, saving, isPending: false }`; `save(data, opts)` same contract as edit (transform without previousData); success default: notify `created` + `onRedirect?.('edit', resource, result.id, result)` (recon redirect matrix: create → edit of the new record).
  - `createDeleteController(ctx, resource, { onRedirect? })` — `deleteOne(id, { previousData?, onSuccess?, onError? })` via `deleteMutationOptions`; success default: notify `deleted` (`smart_count: 1`) + `onRedirect?.('list', resource)` + remove the id from `${resource}.selectedIds` in `ctx.store` when present; ValidationError/other-error semantics same as edit.

- [ ] **Step 1: Write failing tests** (same style as Task 5 — create saves + redirects to edit-of-new-id; delete notifies `deleted`, requests list redirect, and strips the id from the KV selection; ValidationError path resolves fieldErrors)

```ts
describe("createCreateController", () => {
  it("save creates, notifies created, redirects to edit of the new record", async () => {
    const ctx = makeCtx();
    const onRedirect = vi.fn();
    const c = createCreateController(ctx, "posts", { onRedirect });
    const result = await c.save({ title: "new" });
    expect(result).toBeUndefined(); // success path resolves void
    const created = ctx.notifications.getSnapshot().find((n) => n.message === "chelone.notification.created");
    expect(created?.type).toBe("success");
    expect(onRedirect).toHaveBeenCalledWith("edit", "posts", expect.anything(), expect.objectContaining({ title: "new" }));
    c.destroy();
  });
});

describe("createDeleteController", () => {
  it("deleteOne deletes, notifies, redirects, and strips the id from KV selection", async () => {
    const ctx = { ...makeCtx(), store: createStore() };
    ctx.store.setItem("posts.selectedIds", [1, 2]);
    const onRedirect = vi.fn();
    const c = createDeleteController(ctx, "posts", { onRedirect });
    await c.deleteOne(1);
    await expect(ctx.dataProvider.getOne("posts", { id: 1 })).rejects.toThrow();
    expect(ctx.notifications.getSnapshot().some((n) => n.message === "chelone.notification.deleted")).toBe(true);
    expect(onRedirect).toHaveBeenCalledWith("list", "posts");
    expect(ctx.store.getItem("posts.selectedIds")).toEqual([2]);
    c.destroy();
  });
});
```

(Reuse Task 5's `makeCtx`; import `createStore` from `../store/store`.)

- [ ] **Step 2: Run to verify failure** → **Step 3: Implement** → **Step 4: Verify; format; commit**

```bash
git add packages/core/src/controller && git commit -m "feat(core): create + delete controllers (redirect matrix, selection cleanup)"
```

---

## Task 7: React bridges for edit/create/show/delete

**Files:**
- Modify: `packages/react/src/controller-hooks.ts` (add the four hooks)
- Test: extend `packages/react/src/p4-hooks.test.tsx`

**Interfaces:**
- Produces: `useEditController(resource, options)`, `useShowController(resource, options)`, `useCreateController(resource, options?)`, `useDeleteController(resource, options?)` — identical bridge shape to Task 4 (once-per-mount, `useSyncExternalStore`, destroy on unmount, stable actions). `save`/`deleteOne` returned directly off the controller.

- [ ] **Step 1: Write failing tests** — for each hook one happy-path renderHook test (edit: loads record then `save` updates + notification appears via `useNotifications`; show: record loads; create: `save` fires redirect request via an `onRedirect` spy passed in options; delete: `deleteOne` removes). Follow Task 4's wrapper pattern.

- [ ] **Step 2–4: fail → implement → verify both suites; format; commit**

```bash
git add -A && git commit -m "feat(react): edit/create/show/delete controller hooks"
```

---

## Task 8: Barrels + full gate

**Files:**
- Modify: `packages/core/src/index.ts`, `packages/react/src/index.ts`

- [ ] **Step 1:** Core barrel adds: `createMicroStore`, `MicroStore` (type), `createNotificationStore`, `Notification`/`NotificationStore` (types), `createListController` + `ListController`/`ListControllerState`/`ListControllerOptions` (types), `createEditController`/`createShowController`/`createCreateController`/`createDeleteController` (+ their option/state types), `resolveNotificationKey`. Dedupe against Task 4/7 additions.
- [ ] **Step 2:** React barrel adds: the five controller hooks, `useNotifications`, `useNotify`, `useChelonNotifications`.
- [ ] **Step 3:** Full gate: `pnpm test && pnpm typecheck && pnpm lint && pnpm exec turbo run test typecheck --force` — all green or BLOCKED.
- [ ] **Step 4:** Commit: `feat: complete P4 public surfaces (controllers + notifications barrels)`

---

## Self-Review

**Coverage (charter §7 P4 + §10 mitigation + §11 + P3 deferrals):**
- Controllers as vanilla observable stores (list/edit/create/show + delete) → T3, T5, T6. ✅
- De-risk on ONE resource before scaling → T3+T4 order; T4 review = pattern gate with halt semantics. ✅
- React bridges via useSyncExternalStore → T4, T7. ✅
- Multi-sort (§11) → T3 (state + contract widening + fake provider). ✅
- Store dispose path (P3 deferral) → T1 `destroy()`/`onDestroy` + every controller registers teardown. ✅
- Notification primitive (ratified this session) → T2; undoable explicitly deferred. ✅
- URL sync deferred to P6; redirects as callback requests → constraints + T5/T6 contracts. ✅
- Auth gating: controllers accept `enabled`; full canAccess gating composes at the shell (P6) — *deliberate deferral, noted for the P6 plan.*
- Non-`id` reference keys: P4/P5 item — reference controllers are P5 scope (they build on list/record patterns proven here). Correctly absent.

**Placeholder scan:** Task 3 Step 3 and Task 4 Step 3 show structural skeletons + binding behavior contracts rather than full listings — deliberate for the two largest files (the tests + Behavior blocks ARE the spec; a full listing would be pseudo-certain anyway before the pattern gate). All other tasks: complete code. Task 4's StrictMode test placeholder explicitly instructs its replacement. ✅ (flagged, intentional)

**Type consistency:** `MicroStore`/`createMicroStore` (T1) consumed T3/T5/T6; `NotificationStore` (T2) consumed T3–T7; `resolveNotificationKey` (T3) consumed T5/T6; `SortPayload | SortPayload[]` widening (T3) matches fake-provider + controller usage; hook names (T4/T7) match T8 barrel. ✅

**Known risks:** QueryObserver result→state mapping loops (observer notify → setState → setOptions → notify) — T3 must only call `observer.setOptions` on PARAM changes, never from the result subscription (reviewer focus). StrictMode double-mount (T4 test pins). Debounce + destroy race (T3 test pins).

---

## ADDENDUM — Pattern gate fired (2026-06-23), redesign 4R

The Task-4 pattern gate HALTED the phase with a confirmed Critical, exactly as designed.

**Flaw (spec-level — the plan's own Task 4 design note blessed it):** controller acquisition
(QueryObserver subscribe + fetch + KV subscribe) in the constructor, invoked from the hook's
render-phase lazy init, with release only in effect cleanup. React discards renders that never
commit (Suspense sibling suspending, initial-hidden Activity) and discarded renders get no
cleanup → live zombie controllers leak (reviewer reproduced: 2 leaked observers under Suspense,
1 under Activity — pinned queries, phantom notifications, zombie KV writes).

**Redesign (Task 4R, brief at chelone/.superpowers/sdd/task-4R-brief.md):** inert construction;
acquisition on the micro-store's FIRST subscriber (`MicroStoreOptions.onSubscribed`), teardown
on last-unsubscribe and on destroy-while-attached — TanStack Query's own bridge model. The
bridge's recreate machinery (the Important-finding race) is deleted. Both reviewer
reproductions become permanent regression tests. Tasks 5–7 follow the ratified pattern.

**Lesson recorded:** "observer subscribe in constructor is fine" was wrong under concurrent
React. Render-phase construction must be side-effect-free; commit-phase subscription is the
only safe acquisition point.
