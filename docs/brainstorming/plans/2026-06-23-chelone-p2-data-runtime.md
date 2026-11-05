# Chelone P2: Data Runtime — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Chelone's data runtime — the full 9-verb `DataProvider` contract (cursor-capable), framework-agnostic query/mutation option factories on `@tanstack/query-core` with ra-core's cache conventions, an in-memory fake provider, and the first `@chelone/react` hooks.

**Architecture:** `@chelone/core` exports **plain option-factory functions** (`getListOptions(ctx, resource, params)` → `{ queryKey, queryFn }`) — consumable by any framework's `useQuery` and by server-side `prefetchQuery` (the TanStack `queryOptions` helper is a pure identity function, so core needs no framework dep). Mutations follow the same pattern with a `mutationMode: 'pessimistic' | 'optimistic'` seam (undoable plugs in at P3). The React adapter wraps factories with `useQuery`/`useMutation` behind a `CheloneProvider`.

**Tech Stack:** `@tanstack/query-core ^5` (core, **peer range**), `@tanstack/react-query ^5` (react, **peer range**), zod, vitest (runtime + typecheck), @testing-library/react + jsdom (react pkg tests).

## Global Constraints

- **Repo:** `chelone`, branch `main`. Never commit `.superpowers/`.
- **Boundary (unchanged):** `@chelone/core` never imports `react`, `react-dom`, `react-hook-form`, `react-router`. Biome-enforced.
- **Peer-range policy (charter §11):** TanStack libs are `peerDependencies` with range `^5.0.0` (plus devDependencies for tests) — never pinned `dependencies`. Apps upgrade query independently.
- **Default mutation mode = `'pessimistic'`** (charter §11 — least surprise). Optimistic is opt-in.
- **Type preservation:** optimistic snapshots/merges use `structuredClone` — a `Date` must survive the round-trip. Never `JSON.parse(JSON.stringify(...))`.
- **Query-key scheme (ra-core convention kept):** `[resource, operation, params]`. `getOne` keys stringify the id (`String(id)`) so `1` and `'1'` share a cache slot.
- **Cache value shapes:** `oneKey` caches the **record** (`TRecord`); `listKey` caches the **full result** (`GetListResult<TRecord>`, keeps `total`/`pageInfo`).
- **Versions:** everything from P0-P1 unchanged; add `@tanstack/query-core ^5.0.0`, `@tanstack/react-query ^5.0.0`, `@testing-library/react ^16`, `jsdom ^26`.
- Type tests in `*.test-d.ts`; runtime tests in `*.test.ts` (vitest runs both; typecheck already enabled).
- Conventional Commits.

---

## File Structure

```
packages/core/src/data/
  types.ts              EXTEND: 9 verbs, cursor union, pageInfo, targetKey docs
  types.test-d.ts       EXTEND: new-verb + cursor inference tests
  errors.ts             NEW: ValidationError (typed field errors)
  errors.test.ts        NEW
  keys.ts               NEW: query-key factories
  keys.test.ts          NEW
  query-options.ts      NEW: getList/getOne/getManyOptions + cache seeding
  query-options.test.ts NEW (runtime, QueryClient + fake provider)
  mutation-options.ts   NEW: create/update/deleteMutationOptions, mode seam
  mutation-options.test.ts NEW
  fake-provider.ts      NEW: in-memory 9-verb provider (page + cursor)
  fake-provider.test.ts NEW
packages/core/src/index.ts          EXTEND barrel
packages/react/src/
  context.tsx           NEW: CheloneProvider + useCheloneContext
  hooks.ts              NEW: useGetList/useGetOne/useGetMany/useCreate/useUpdate/useDelete + createCheloneHooks
  hooks.test.tsx        NEW (jsdom + testing-library)
  index.ts              EXTEND barrel
packages/react/vitest.config.ts     NEW (jsdom)
```

**Model hints for the controller:** Tasks 1–3 mechanical (cheap model); Tasks 4–6 subtle cache/type machinery (session model, review); Task 7 integration (session model, review); Task 8 mechanical.

---

## Task 1: Contract v2 — 9 verbs, cursor pagination, ValidationError

**Files:**
- Modify: `packages/core/src/data/types.ts`
- Create: `packages/core/src/data/errors.ts`
- Test: `packages/core/src/data/types.test-d.ts` (extend), `packages/core/src/data/errors.test.ts`

**Interfaces:**
- Consumes: `RecordOf`, `ResourceMap` (P1 registry), `Identifier`, `ResourceRecord`, `LooseRecord`.
- Produces (later tasks rely on exact names):
  - `interface PagePagination { page: number; perPage: number }`
  - `interface CursorPagination { cursor: string | null; limit: number }`
  - `type Pagination = PagePagination | CursorPagination`
  - `interface PageInfo { nextCursor?: string | null; prevCursor?: string | null; hasNextPage?: boolean; hasPreviousPage?: boolean }`
  - `GetListResult` gains `pageInfo?: PageInfo`; `total` stays optional
  - New verb types: `GetManyParams { ids: Identifier[]; meta?: unknown }`, `GetManyResult { data: TRecord[] }`, `GetManyReferenceParams { target: string; id: Identifier; pagination?: Pagination; sort?: SortPayload; filter?: FilterPayload; meta?: unknown }`, `GetManyReferenceResult` (same shape as `GetListResult`), `UpdateManyParams { ids: Identifier[]; data: Partial<TRecord>; meta?: unknown }`, `UpdateManyResult { data: Identifier[] }`, `DeleteManyParams { ids: Identifier[]; meta?: unknown }`, `DeleteManyResult { data: Identifier[] }`
  - `DataProvider` gains `getMany`, `getManyReference`, `updateMany`, `deleteMany` (same `TName extends keyof TResources & string` + `RecordOf` inference pattern as the P1 five)
  - `class ValidationError extends Error { readonly fieldErrors: Record<string, string | string[]> }` (in `errors.ts`) — the wire shape P5 maps onto TanStack Form.

- [ ] **Step 1: Extend the type tests (failing first)**

Append to `packages/core/src/data/types.test-d.ts` (inside the existing `describe`, reusing the existing `dp`/`resources`/`Post` fixtures):

```ts
it("getMany returns typed records", async () => {
  const result = await dp.getMany("posts", { ids: [1, 2] });
  expectTypeOf(result.data).toEqualTypeOf<Post[]>();
});

it("getManyReference returns typed records with list result shape", async () => {
  const result = await dp.getManyReference("posts", { target: "author_id", id: 1 });
  expectTypeOf(result.data).toEqualTypeOf<Post[]>();
  expectTypeOf(result.pageInfo).toEqualTypeOf<import("./types").PageInfo | undefined>();
});

it("updateMany/deleteMany return identifier arrays", async () => {
  const u = await dp.updateMany("posts", { ids: [1], data: { title: "x" } });
  const d = await dp.deleteMany("posts", { ids: [1] });
  expectTypeOf(u.data).toEqualTypeOf<Array<string | number>>();
  expectTypeOf(d.data).toEqualTypeOf<Array<string | number>>();
});

it("pagination is a discriminated union: page and cursor modes both accepted", async () => {
  await dp.getList("posts", { pagination: { page: 1, perPage: 10 } });
  await dp.getList("posts", { pagination: { cursor: null, limit: 10 } });
  // @ts-expect-error mixing the two modes is rejected
  await dp.getList("posts", { pagination: { page: 1, limit: 10 } });
});
```

Create `packages/core/src/data/errors.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ValidationError } from "./errors";

describe("ValidationError", () => {
  it("carries typed field errors and is an Error", () => {
    const err = new ValidationError("Validation failed", {
      title: "Required",
      tags: ["Too many", "Invalid"],
    });
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ValidationError");
    expect(err.fieldErrors.title).toBe("Required");
    expect(err.fieldErrors.tags).toEqual(["Too many", "Invalid"]);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd chelone && pnpm --filter @chelone/core test`
Expected: FAIL — `getMany` does not exist on `DataProvider`; cannot find module `./errors`.

- [ ] **Step 3: Implement**

In `packages/core/src/data/types.ts` — replace the existing `PaginationPayload` with the union (and update `GetListParams`/`GetManyReferenceParams` accordingly), add `PageInfo` + new verb types, extend `DataProvider`:

```ts
export interface PagePagination {
  page: number;
  perPage: number;
}
export interface CursorPagination {
  cursor: string | null;
  limit: number;
}
/** Discriminated by presence of `page` vs `cursor` — offset AND keyset backends are first-class. */
export type Pagination = PagePagination | CursorPagination;

export interface PageInfo {
  nextCursor?: string | null;
  prevCursor?: string | null;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}
```

```ts
export interface GetListParams {
  pagination?: Pagination;
  sort?: SortPayload;
  filter?: FilterPayload;
  meta?: unknown;
}
export interface GetListResult<TRecord extends ResourceRecord = LooseRecord> {
  data: TRecord[];
  /** Optional — cursor backends often cannot count. */
  total?: number;
  pageInfo?: PageInfo;
}

export interface GetManyParams {
  ids: Identifier[];
  meta?: unknown;
}
export interface GetManyResult<TRecord extends ResourceRecord = LooseRecord> {
  data: TRecord[];
}

/**
 * Fetch records whose `target` field (the FK on the referenced-FROM side)
 * equals `id`. Arbitrary-lookup-key resolution on the referenced side is a
 * controller concern (P4/P5) via getList filter — not extra contract surface.
 */
export interface GetManyReferenceParams {
  target: string;
  id: Identifier;
  pagination?: Pagination;
  sort?: SortPayload;
  filter?: FilterPayload;
  meta?: unknown;
}
export type GetManyReferenceResult<TRecord extends ResourceRecord = LooseRecord> =
  GetListResult<TRecord>;

export interface UpdateManyParams<TRecord extends ResourceRecord = LooseRecord> {
  ids: Identifier[];
  data: Partial<TRecord>;
  meta?: unknown;
}
export interface UpdateManyResult {
  data: Identifier[];
}
export interface DeleteManyParams {
  ids: Identifier[];
  meta?: unknown;
}
export interface DeleteManyResult {
  data: Identifier[];
}
```

Add to the `DataProvider` interface (same pattern as the P1 five):

```ts
  getMany<TName extends keyof TResources & string>(
    resource: TName,
    params: GetManyParams,
  ): Promise<GetManyResult<RecordOf<TResources, TName>>>;

  getManyReference<TName extends keyof TResources & string>(
    resource: TName,
    params: GetManyReferenceParams,
  ): Promise<GetManyReferenceResult<RecordOf<TResources, TName>>>;

  updateMany<TName extends keyof TResources & string>(
    resource: TName,
    params: UpdateManyParams<RecordOf<TResources, TName>>,
  ): Promise<UpdateManyResult>;

  deleteMany<TName extends keyof TResources & string>(
    resource: TName,
    params: DeleteManyParams,
  ): Promise<DeleteManyResult>;
```

Create `packages/core/src/data/errors.ts`:

```ts
/**
 * Thrown/rejected by DataProvider mutations when the server rejects on
 * validation. `fieldErrors` maps field source paths to messages — P5 maps
 * this onto form state. Framework-free by design.
 */
export class ValidationError extends Error {
  override readonly name = "ValidationError";
  readonly fieldErrors: Record<string, string | string[]>;

  constructor(message: string, fieldErrors: Record<string, string | string[]>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}
```

Note: `PagePagination` mixing rejection (`@ts-expect-error` above) relies on the union having no overlap — do NOT add optional `page?` to `CursorPagination` or vice versa. If the `@ts-expect-error` reports unused, excess-property checking isn't rejecting the mix — restructure so both members keep exclusive required keys.

- [ ] **Step 4: Run to verify pass**

Run: `cd chelone && pnpm --filter @chelone/core test`
Expected: PASS (prior 13 + 4 new type tests + 1 runtime test).

- [ ] **Step 5: Commit**

```bash
cd chelone && git add packages/core/src/data && git commit -m "feat(core): 9-verb DataProvider contract, cursor pagination union, ValidationError"
```

---

## Task 2: Package hygiene — exports maps + TanStack peer ranges

**Files:**
- Modify: `packages/core/package.json`, `packages/react/package.json`

**Interfaces:**
- Produces: `@chelone/core` with `peerDependencies: { "@tanstack/query-core": "^5.0.0" }` (+ devDependency copy for tests); `@chelone/react` with peers `@tanstack/react-query ^5.0.0` + `react ^18 || ^19`; both packages with explicit `exports` including `"./package.json"`.

- [ ] **Step 1: Edit `packages/core/package.json`**

Set/merge these fields (keep existing scripts/deps):

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./package.json": "./package.json"
  },
  "peerDependencies": { "@tanstack/query-core": "^5.0.0" },
  "devDependencies": { "@tanstack/query-core": "^5.0.0", "vitest": "^3.0.0" }
}
```

- [ ] **Step 2: Edit `packages/react/package.json`**

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./package.json": "./package.json"
  },
  "peerDependencies": {
    "@tanstack/react-query": "^5.0.0",
    "react": "^18 || ^19"
  },
  "devDependencies": {
    "@tanstack/react-query": "^5.0.0",
    "@testing-library/react": "^16.0.0",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "jsdom": "^26.0.0",
    "react": "^19",
    "react-dom": "^19",
    "vitest": "^3.0.0"
  },
  "scripts": {
    "test": "vitest run --typecheck",
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 3: Install + verify green**

Run: `cd chelone && pnpm install && pnpm test && pnpm typecheck && pnpm lint`
Expected: install resolves; all green (react pkg vitest exits 0 with no tests — `passWithNoTests` comes with its vitest config in Task 7; if `pnpm --filter @chelone/react test` fails on "no test files" before Task 7, that is EXPECTED at the turbo level only if turbo runs it — since react now has a `test` script, create a minimal `packages/react/vitest.config.ts` NOW instead of Task 7:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    passWithNoTests: true,
    typecheck: { enabled: true, tsconfig: "./tsconfig.json" },
  },
});
```
).

- [ ] **Step 4: Commit (lockfile included)**

```bash
cd chelone && git add -A && git commit -m "chore: exports maps + TanStack peer-range deps (core: query-core, react: react-query)"
```

---

## Task 3: Query-key scheme

**Files:**
- Create: `packages/core/src/data/keys.ts`
- Test: `packages/core/src/data/keys.test.ts`

**Interfaces:**
- Consumes: `Identifier`, param types from Task 1.
- Produces:
  - `resourceKey(resource): readonly [string]`
  - `listKey(resource, params?): readonly [string, 'getList', GetListParams]`
  - `oneKey(resource, params): readonly [string, 'getOne', { id: string; meta?: unknown }]` — **id stringified**
  - `manyKey(resource, params): readonly [string, 'getMany', { ids: string[]; meta?: unknown }]` — ids stringified + sorted (order-insensitive cache hits)
  - `manyReferenceKey(resource, params): readonly [string, 'getManyReference', GetManyReferenceParams]`

- [ ] **Step 1: Write failing tests**

`packages/core/src/data/keys.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { listKey, manyKey, oneKey, resourceKey } from "./keys";

describe("query keys", () => {
  it("follows the [resource, operation, params] scheme", () => {
    expect(listKey("posts", { filter: { q: "x" } })).toEqual([
      "posts",
      "getList",
      { filter: { q: "x" } },
    ]);
    expect(resourceKey("posts")).toEqual(["posts"]);
  });

  it("oneKey stringifies the id so 1 and '1' share a cache slot", () => {
    expect(oneKey("posts", { id: 1 })).toEqual(oneKey("posts", { id: "1" }));
  });

  it("manyKey stringifies and sorts ids for order-insensitive hits", () => {
    expect(manyKey("posts", { ids: [2, 1] })).toEqual(manyKey("posts", { ids: ["1", "2"] }));
  });

  it("listKey defaults params to an empty object", () => {
    expect(listKey("posts")).toEqual(["posts", "getList", {}]);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd chelone && pnpm --filter @chelone/core test`
Expected: FAIL — cannot find module `./keys`.

- [ ] **Step 3: Implement `packages/core/src/data/keys.ts`**

```ts
import type { Identifier } from "../resource/identifier";
import type { GetListParams, GetManyReferenceParams } from "./types";

/** Root key for a resource — invalidation scope for everything under it. */
export function resourceKey(resource: string) {
  return [resource] as const;
}

export function listKey(resource: string, params: GetListParams = {}) {
  return [resource, "getList", params] as const;
}

export function oneKey(resource: string, params: { id: Identifier; meta?: unknown }) {
  return [
    resource,
    "getOne",
    params.meta === undefined
      ? { id: String(params.id) }
      : { id: String(params.id), meta: params.meta },
  ] as const;
}

export function manyKey(resource: string, params: { ids: Identifier[]; meta?: unknown }) {
  const ids = params.ids.map(String).sort();
  return [
    resource,
    "getMany",
    params.meta === undefined ? { ids } : { ids, meta: params.meta },
  ] as const;
}

export function manyReferenceKey(resource: string, params: GetManyReferenceParams) {
  return [resource, "getManyReference", params] as const;
}
```

- [ ] **Step 4: Run to verify pass, then commit**

Run: `cd chelone && pnpm --filter @chelone/core test`
Expected: PASS.

```bash
cd chelone && git add packages/core/src/data/keys.ts packages/core/src/data/keys.test.ts && git commit -m "feat(core): query-key scheme [resource, op, params] with id normalization"
```

---

## Task 4: Fake in-memory dataProvider

*(Ordered before the option factories so factory tests have a real provider.)*

**Files:**
- Create: `packages/core/src/data/fake-provider.ts`
- Test: `packages/core/src/data/fake-provider.test.ts`

**Interfaces:**
- Consumes: all Task 1 contract types.
- Produces: `function fakeDataProvider<TResources extends ResourceMap>(initialData: { [K in keyof TResources]?: RecordOf<TResources, K>[] }): DataProvider<TResources>` — implements all 9 verbs; equality filter; single-field sort ASC/DESC; BOTH pagination modes (cursor = stringified offset into the sorted+filtered array — `// ponytail:` documented ceiling, real backends use keyset).

- [ ] **Step 1: Write failing tests**

`packages/core/src/data/fake-provider.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { defineResources } from "../resource/registry";
import { fakeDataProvider } from "./fake-provider";

const resources = defineResources({
  posts: { schema: z.object({ id: z.number(), title: z.string(), author_id: z.number() }) },
});
const seed = () =>
  fakeDataProvider<typeof resources>({
    posts: [
      { id: 3, title: "c", author_id: 1 },
      { id: 1, title: "a", author_id: 1 },
      { id: 2, title: "b", author_id: 2 },
    ],
  });

describe("fakeDataProvider", () => {
  it("getList sorts, filters, and page-paginates", async () => {
    const dp = seed();
    const r = await dp.getList("posts", {
      sort: { field: "title", order: "ASC" },
      filter: { author_id: 1 },
      pagination: { page: 1, perPage: 1 },
    });
    expect(r.data.map((p) => p.title)).toEqual(["a"]);
    expect(r.total).toBe(2);
  });

  it("getList cursor-paginates with pageInfo", async () => {
    const dp = seed();
    const p1 = await dp.getList("posts", {
      sort: { field: "id", order: "ASC" },
      pagination: { cursor: null, limit: 2 },
    });
    expect(p1.data.map((p) => p.id)).toEqual([1, 2]);
    expect(p1.pageInfo?.hasNextPage).toBe(true);
    const p2 = await dp.getList("posts", {
      sort: { field: "id", order: "ASC" },
      pagination: { cursor: p1.pageInfo?.nextCursor ?? null, limit: 2 },
    });
    expect(p2.data.map((p) => p.id)).toEqual([3]);
    expect(p2.pageInfo?.hasNextPage).toBe(false);
  });

  it("getOne matches ids loosely (1 vs '1'), rejects missing", async () => {
    const dp = seed();
    expect((await dp.getOne("posts", { id: "1" })).data.title).toBe("a");
    await expect(dp.getOne("posts", { id: 99 })).rejects.toThrow();
  });

  it("getMany preserves requested order; getManyReference filters by target", async () => {
    const dp = seed();
    expect((await dp.getMany("posts", { ids: [2, 1] })).data.map((p) => p.id)).toEqual([2, 1]);
    const refs = await dp.getManyReference("posts", { target: "author_id", id: 1 });
    expect(refs.data).toHaveLength(2);
  });

  it("create assigns an id when absent; update merges; delete removes", async () => {
    const dp = seed();
    const created = await dp.create("posts", { data: { title: "d", author_id: 3 } });
    expect(created.data.id).toBeDefined();
    const updated = await dp.update("posts", { id: 1, data: { title: "a2" } });
    expect(updated.data).toMatchObject({ id: 1, title: "a2", author_id: 1 });
    await dp.delete("posts", { id: 1 });
    await expect(dp.getOne("posts", { id: 1 })).rejects.toThrow();
  });

  it("updateMany/deleteMany return the touched ids", async () => {
    const dp = seed();
    expect((await dp.updateMany("posts", { ids: [1, 2], data: { title: "x" } })).data).toEqual([1, 2]);
    expect((await dp.deleteMany("posts", { ids: [1, 2] })).data).toEqual([1, 2]);
    expect((await dp.getList("posts", {})).total).toBe(1);
  });
});
```

- [ ] **Step 2: Run to verify failure** (`cannot find module ./fake-provider`)

- [ ] **Step 3: Implement `packages/core/src/data/fake-provider.ts`**

```ts
import type { LooseRecord, ResourceRecord } from "../resource/record";
import type { RecordOf, ResourceMap } from "../resource/registry";
import type {
  DataProvider,
  FilterPayload,
  GetListParams,
  GetListResult,
  Pagination,
  SortPayload,
} from "./types";

type Row = ResourceRecord & Record<string, unknown>;

function applyFilter(rows: Row[], filter: FilterPayload | undefined): Row[] {
  if (!filter) return rows;
  return rows.filter((row) =>
    Object.entries(filter).every(([key, value]) => row[key] === value),
  );
}

function applySort(rows: Row[], sort: SortPayload | undefined): Row[] {
  if (!sort) return rows;
  const dir = sort.order === "ASC" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = a[sort.field] as never;
    const bv = b[sort.field] as never;
    return av < bv ? -dir : av > bv ? dir : 0;
  });
}

function paginate(rows: Row[], pagination: Pagination | undefined): GetListResult<Row> {
  if (!pagination) return { data: rows, total: rows.length };
  if ("page" in pagination) {
    const start = (pagination.page - 1) * pagination.perPage;
    return { data: rows.slice(start, start + pagination.perPage), total: rows.length };
  }
  // ponytail: cursor = stringified offset into the sorted array — fine for a
  // fake; real cursor providers use keyset (last-seen sort value).
  const offset = pagination.cursor === null ? 0 : Number(pagination.cursor);
  const data = rows.slice(offset, offset + pagination.limit);
  const next = offset + pagination.limit;
  return {
    data,
    total: rows.length,
    pageInfo: {
      nextCursor: next < rows.length ? String(next) : null,
      prevCursor: offset > 0 ? String(Math.max(0, offset - pagination.limit)) : null,
      hasNextPage: next < rows.length,
      hasPreviousPage: offset > 0,
    },
  };
}

/** In-memory DataProvider for tests and dogfooding. Mutates its own copy of the seed. */
export function fakeDataProvider<TResources extends ResourceMap>(initialData: {
  [K in keyof TResources]?: RecordOf<TResources, K>[];
}): DataProvider<TResources> {
  const store = new Map<string, Row[]>();
  for (const [resource, rows] of Object.entries(initialData)) {
    store.set(resource, structuredClone(rows ?? []) as Row[]);
  }
  const table = (resource: string): Row[] => {
    const rows = store.get(resource);
    if (!rows) throw new Error(`fakeDataProvider: unknown resource "${resource}"`);
    return rows;
  };
  const find = (resource: string, id: unknown): Row => {
    const row = table(resource).find((r) => String(r.id) === String(id));
    if (!row) throw new Error(`fakeDataProvider: ${resource}#${String(id)} not found`);
    return row;
  };
  let nextId = 1_000_000;

  const listLike = (resource: string, rows: Row[], params: GetListParams) =>
    paginate(applySort(applyFilter(rows, params.filter), params.sort), params.pagination);

  return {
    async getList(resource, params) {
      return listLike(resource, table(resource), params) as never;
    },
    async getOne(resource, params) {
      return { data: structuredClone(find(resource, params.id)) } as never;
    },
    async getMany(resource, params) {
      return { data: params.ids.map((id) => structuredClone(find(resource, id))) } as never;
    },
    async getManyReference(resource, params) {
      const rows = table(resource).filter((r) => String(r[params.target]) === String(params.id));
      return listLike(resource, rows, params) as never;
    },
    async create(resource, params) {
      const row = { id: nextId++, ...structuredClone(params.data) } as Row;
      table(resource).push(row);
      return { data: structuredClone(row) } as never;
    },
    async update(resource, params) {
      const row = find(resource, params.id);
      Object.assign(row, structuredClone(params.data));
      return { data: structuredClone(row) } as never;
    },
    async updateMany(resource, params) {
      for (const id of params.ids) Object.assign(find(resource, id), structuredClone(params.data));
      return { data: params.ids };
    },
    async delete(resource, params) {
      const rows = table(resource);
      const idx = rows.findIndex((r) => String(r.id) === String(params.id));
      if (idx === -1) throw new Error(`fakeDataProvider: ${resource}#${String(params.id)} not found`);
      const [removed] = rows.splice(idx, 1);
      return { data: structuredClone(removed) } as never;
    },
    async deleteMany(resource, params) {
      for (const id of params.ids) {
        const rows = table(resource);
        const idx = rows.findIndex((r) => String(r.id) === String(id));
        if (idx !== -1) rows.splice(idx, 1);
      }
      return { data: params.ids };
    },
  };
}
```

Note on the `as never` casts: the store is untyped `Row[]` internally while the public signature promises `RecordOf<...>` — the casts localize that boundary. If the implementer finds a cleaner internal typing that avoids them without contorting, prefer it; do not weaken the public signature.

- [ ] **Step 4: Run to verify pass, then commit**

```bash
cd chelone && git add packages/core/src/data/fake-provider* && git commit -m "feat(core): in-memory fakeDataProvider (9 verbs, page + cursor pagination)"
```

---

## Task 5: Query option factories + cache cross-population

**Files:**
- Create: `packages/core/src/data/query-options.ts`
- Test: `packages/core/src/data/query-options.test.ts`

**Interfaces:**
- Consumes: keys (Task 3), contract (Task 1), `fakeDataProvider` (Task 4), `QueryClient` from `@tanstack/query-core`.
- Produces:
  - `interface DataContext<TResources extends ResourceMap = ResourceMap> { dataProvider: DataProvider<TResources>; queryClient: QueryClient }`
  - `getListOptions(ctx, resource, params?)` → `{ queryKey, queryFn }`; `queryFn` seeds each returned record into its `oneKey` slot (**cache cross-population** — list→detail is instant)
  - `getOneOptions(ctx, resource, params)` → cached value is the **record**
  - `getManyOptions(ctx, resource, params)` → seeds `oneKey` slots too
  - All typed: result data infers `RecordOf<TResources, TName>`.

- [ ] **Step 1: Write failing tests**

`packages/core/src/data/query-options.test.ts`:

```ts
import { QueryClient } from "@tanstack/query-core";
import { describe, expect, expectTypeOf, it } from "vitest";
import { z } from "zod";
import { defineResources } from "../resource/registry";
import { fakeDataProvider } from "./fake-provider";
import { oneKey } from "./keys";
import { getListOptions, getManyOptions, getOneOptions } from "./query-options";

const resources = defineResources({
  posts: { schema: z.object({ id: z.number(), title: z.string() }) },
});
const ctx = () => ({
  dataProvider: fakeDataProvider<typeof resources>({
    posts: [
      { id: 1, title: "a" },
      { id: 2, title: "b" },
    ],
  }),
  queryClient: new QueryClient(),
});

describe("query option factories", () => {
  it("getListOptions fetches via fetchQuery and returns the typed result", async () => {
    const c = ctx();
    const result = await c.queryClient.fetchQuery(getListOptions(c, "posts", {}));
    expect(result.data.map((p) => p.title)).toEqual(["a", "b"]);
    expectTypeOf(result.data).toEqualTypeOf<{ id: number; title: string }[]>();
  });

  it("getList seeds the getOne cache for each row (cross-population)", async () => {
    const c = ctx();
    await c.queryClient.fetchQuery(getListOptions(c, "posts", {}));
    expect(c.queryClient.getQueryData(oneKey("posts", { id: 1 }))).toMatchObject({
      id: 1,
      title: "a",
    });
  });

  it("getOneOptions caches the record under the stringified-id key", async () => {
    const c = ctx();
    const record = await c.queryClient.fetchQuery(getOneOptions(c, "posts", { id: "1" }));
    expect(record.title).toBe("a");
    expect(c.queryClient.getQueryData(oneKey("posts", { id: 1 }))).toMatchObject({ id: 1 });
  });

  it("getManyOptions seeds oneKey slots", async () => {
    const c = ctx();
    await c.queryClient.fetchQuery(getManyOptions(c, "posts", { ids: [2] }));
    expect(c.queryClient.getQueryData(oneKey("posts", { id: 2 }))).toMatchObject({ id: 2 });
  });
});
```

- [ ] **Step 2: Run to verify failure** (`cannot find module ./query-options`)

- [ ] **Step 3: Implement `packages/core/src/data/query-options.ts`**

```ts
import type { QueryClient } from "@tanstack/query-core";
import type { RecordOf, ResourceMap } from "../resource/registry";
import { listKey, manyKey, oneKey } from "./keys";
import type { DataProvider, GetListParams, GetManyParams, GetOneParams } from "./types";

/** Everything the data runtime needs — framework adapters provide this via their own context. */
export interface DataContext<TResources extends ResourceMap = ResourceMap> {
  dataProvider: DataProvider<TResources>;
  queryClient: QueryClient;
}

function seedRecords(
  queryClient: QueryClient,
  resource: string,
  records: Array<{ id: string | number }>,
): void {
  for (const record of records) {
    queryClient.setQueryData(oneKey(resource, { id: record.id }), record);
  }
}

/** Plain option objects — consumable by any framework's useQuery AND server-side prefetchQuery. */
export function getListOptions<TResources extends ResourceMap, TName extends keyof TResources & string>(
  ctx: DataContext<TResources>,
  resource: TName,
  params: GetListParams = {},
) {
  return {
    queryKey: listKey(resource, params),
    queryFn: async () => {
      const result = await ctx.dataProvider.getList(resource, params);
      seedRecords(ctx.queryClient, resource, result.data);
      return result;
    },
  };
}

export function getOneOptions<TResources extends ResourceMap, TName extends keyof TResources & string>(
  ctx: DataContext<TResources>,
  resource: TName,
  params: GetOneParams,
) {
  return {
    queryKey: oneKey(resource, params),
    queryFn: async (): Promise<RecordOf<TResources, TName>> => {
      const result = await ctx.dataProvider.getOne(resource, params);
      return result.data;
    },
  };
}

export function getManyOptions<TResources extends ResourceMap, TName extends keyof TResources & string>(
  ctx: DataContext<TResources>,
  resource: TName,
  params: GetManyParams,
) {
  return {
    queryKey: manyKey(resource, params),
    queryFn: async () => {
      const result = await ctx.dataProvider.getMany(resource, params);
      seedRecords(ctx.queryClient, resource, result.data);
      return result.data;
    },
  };
}
```

- [ ] **Step 4: Run to verify pass, then commit**

```bash
cd chelone && git add packages/core/src/data/query-options* && git commit -m "feat(core): query option factories with getOne cache cross-population"
```

---

## Task 6: Mutation option factories — pessimistic + optimistic seam

**Files:**
- Create: `packages/core/src/data/mutation-options.ts`
- Test: `packages/core/src/data/mutation-options.test.ts`

**Interfaces:**
- Consumes: `DataContext` (Task 5), keys, contract, fake provider, `MutationObserver` from `@tanstack/query-core` (tests).
- Produces:
  - `type MutationMode = 'pessimistic' | 'optimistic'` — **default `'pessimistic'`**. (Undoable joins this union in P3; the seam is this option.)
  - `createMutationOptions(ctx, resource)` → `{ mutationFn, onSettled }` (invalidates `resourceKey` scope)
  - `updateMutationOptions(ctx, resource, opts?: { mutationMode?: MutationMode })` — optimistic: `onMutate` cancels queries, snapshots `oneKey` via `structuredClone`, merges patch into cache; `onError` rolls back; `onSettled` invalidates resource scope
  - `deleteMutationOptions(ctx, resource, opts?)` — optimistic removes the `oneKey` entry, restores on error
  - Optimistic **list caches are invalidated, not patched** (`// ponytail:` documented ceiling — per-list optimistic patching arrives with controllers in P4 if profiling demands it)

- [ ] **Step 1: Write failing tests**

`packages/core/src/data/mutation-options.test.ts`:

```ts
import { MutationObserver, QueryClient } from "@tanstack/query-core";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { defineResources } from "../resource/registry";
import { fakeDataProvider } from "./fake-provider";
import { oneKey } from "./keys";
import { getOneOptions } from "./query-options";
import {
  createMutationOptions,
  deleteMutationOptions,
  updateMutationOptions,
} from "./mutation-options";
import type { DataProvider } from "./types";

const resources = defineResources({
  posts: { schema: z.object({ id: z.number(), title: z.string(), at: z.date() }) },
});
type R = typeof resources;
const seed = () => ({
  dataProvider: fakeDataProvider<R>({ posts: [{ id: 1, title: "a", at: new Date(2026, 0, 1) }] }),
  queryClient: new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } }),
});
const mutate = <T,>(client: QueryClient, options: T) =>
  new MutationObserver(client, options as never).mutate.bind(new MutationObserver(client, options as never));

describe("mutation option factories", () => {
  it("create (pessimistic default) resolves with the created record", async () => {
    const c = seed();
    const observer = new MutationObserver(c.queryClient, createMutationOptions(c, "posts"));
    const record = await observer.mutate({ data: { title: "b", at: new Date() } });
    expect(record).toMatchObject({ title: "b" });
  });

  it("optimistic update patches the oneKey cache immediately and keeps it on success", async () => {
    const c = seed();
    await c.queryClient.fetchQuery(getOneOptions(c, "posts", { id: 1 }));
    const observer = new MutationObserver(
      c.queryClient,
      updateMutationOptions(c, "posts", { mutationMode: "optimistic" }),
    );
    const done = observer.mutate({ id: 1, data: { title: "patched" } });
    // cache reflects the patch before the provider resolves
    expect(c.queryClient.getQueryData(oneKey("posts", { id: 1 }))).toMatchObject({
      title: "patched",
    });
    await done;
  });

  it("optimistic update rolls back the snapshot on error — Date survives (structuredClone)", async () => {
    const c = seed();
    await c.queryClient.fetchQuery(getOneOptions(c, "posts", { id: 1 }));
    const failing: DataProvider<R> = {
      ...c.dataProvider,
      update: () => Promise.reject(new Error("server said no")),
    };
    const ctx = { dataProvider: failing, queryClient: c.queryClient };
    const observer = new MutationObserver(
      c.queryClient,
      updateMutationOptions(ctx, "posts", { mutationMode: "optimistic" }),
    );
    await expect(observer.mutate({ id: 1, data: { title: "doomed" } })).rejects.toThrow();
    const restored = c.queryClient.getQueryData<{ title: string; at: Date }>(
      oneKey("posts", { id: 1 }),
    );
    expect(restored?.title).toBe("a");
    expect(restored?.at).toBeInstanceOf(Date); // NOT a string — type-preserving snapshot
  });

  it("optimistic delete removes the cache entry and restores it on error", async () => {
    const c = seed();
    await c.queryClient.fetchQuery(getOneOptions(c, "posts", { id: 1 }));
    const failing: DataProvider<R> = {
      ...c.dataProvider,
      delete: () => Promise.reject(new Error("nope")),
    };
    const ctx = { dataProvider: failing, queryClient: c.queryClient };
    const observer = new MutationObserver(
      c.queryClient,
      deleteMutationOptions(ctx, "posts", { mutationMode: "optimistic" }),
    );
    await expect(observer.mutate({ id: 1 })).rejects.toThrow();
    expect(c.queryClient.getQueryData(oneKey("posts", { id: 1 }))).toMatchObject({ id: 1 });
  });

  it("pessimistic update does NOT touch the cache before resolution", async () => {
    const c = seed();
    await c.queryClient.fetchQuery(getOneOptions(c, "posts", { id: 1 }));
    let resolveUpdate!: () => void;
    const gated: DataProvider<R> = {
      ...c.dataProvider,
      update: (resource, params) =>
        new Promise((resolve) => {
          resolveUpdate = () =>
            resolve(c.dataProvider.update(resource, params) as never);
        }),
    };
    const ctx = { dataProvider: gated, queryClient: c.queryClient };
    const observer = new MutationObserver(c.queryClient, updateMutationOptions(ctx, "posts"));
    const done = observer.mutate({ id: 1, data: { title: "later" } });
    expect(c.queryClient.getQueryData(oneKey("posts", { id: 1 }))).toMatchObject({ title: "a" });
    resolveUpdate();
    await done;
  });
});
```

(If the unused `mutate` helper at the top trips Biome's no-unused rule, delete it — the tests construct observers directly.)

- [ ] **Step 2: Run to verify failure** (`cannot find module ./mutation-options`)

- [ ] **Step 3: Implement `packages/core/src/data/mutation-options.ts`**

```ts
import type { RecordOf, ResourceMap } from "../resource/registry";
import { oneKey, resourceKey } from "./keys";
import type { DataContext } from "./query-options";
import type { CreateParams, DeleteParams, UpdateParams } from "./types";

/** 'undoable' joins this union in P3 — the seam is this option. Default: pessimistic (least surprise). */
export type MutationMode = "pessimistic" | "optimistic";

export interface MutationModeOptions {
  mutationMode?: MutationMode;
}

function invalidateResource(ctx: DataContext<ResourceMap>, resource: string) {
  // ponytail: optimistic mode invalidates list caches instead of patching them;
  // per-list optimistic patching arrives with controllers (P4) if profiling demands.
  return ctx.queryClient.invalidateQueries({ queryKey: resourceKey(resource) });
}

export function createMutationOptions<
  TResources extends ResourceMap,
  TName extends keyof TResources & string,
>(ctx: DataContext<TResources>, resource: TName) {
  return {
    mutationFn: async (params: CreateParams<RecordOf<TResources, TName>>) => {
      const result = await ctx.dataProvider.create(resource, params);
      return result.data;
    },
    onSettled: () => invalidateResource(ctx, resource),
  };
}

export function updateMutationOptions<
  TResources extends ResourceMap,
  TName extends keyof TResources & string,
>(ctx: DataContext<TResources>, resource: TName, options: MutationModeOptions = {}) {
  const mode: MutationMode = options.mutationMode ?? "pessimistic";
  return {
    mutationFn: async (params: UpdateParams<RecordOf<TResources, TName>>) => {
      const result = await ctx.dataProvider.update(resource, params);
      return result.data;
    },
    onMutate: async (params: UpdateParams<RecordOf<TResources, TName>>) => {
      if (mode !== "optimistic") return {};
      const key = oneKey(resource, { id: params.id });
      await ctx.queryClient.cancelQueries({ queryKey: key });
      const previous = ctx.queryClient.getQueryData(key);
      if (previous !== undefined) {
        const merged = Object.assign(structuredClone(previous), structuredClone(params.data));
        ctx.queryClient.setQueryData(key, merged);
      }
      return { previous, key };
    },
    onError: (
      _error: unknown,
      _params: UpdateParams<RecordOf<TResources, TName>>,
      context: { previous?: unknown; key?: readonly unknown[] } | undefined,
    ) => {
      if (context?.key && context.previous !== undefined) {
        ctx.queryClient.setQueryData(context.key, context.previous);
      }
    },
    onSettled: () => invalidateResource(ctx, resource),
  };
}

export function deleteMutationOptions<
  TResources extends ResourceMap,
  TName extends keyof TResources & string,
>(ctx: DataContext<TResources>, resource: TName, options: MutationModeOptions = {}) {
  const mode: MutationMode = options.mutationMode ?? "pessimistic";
  return {
    mutationFn: async (params: DeleteParams<RecordOf<TResources, TName>>) => {
      const result = await ctx.dataProvider.delete(resource, params);
      return result.data;
    },
    onMutate: async (params: DeleteParams<RecordOf<TResources, TName>>) => {
      if (mode !== "optimistic") return {};
      const key = oneKey(resource, { id: params.id });
      await ctx.queryClient.cancelQueries({ queryKey: key });
      const previous = ctx.queryClient.getQueryData(key);
      ctx.queryClient.removeQueries({ queryKey: key });
      return { previous, key };
    },
    onError: (
      _error: unknown,
      _params: DeleteParams<RecordOf<TResources, TName>>,
      context: { previous?: unknown; key?: readonly unknown[] } | undefined,
    ) => {
      if (context?.key && context.previous !== undefined) {
        ctx.queryClient.setQueryData(context.key, context.previous);
      }
    },
    onSettled: () => invalidateResource(ctx, resource),
  };
}
```

- [ ] **Step 4: Run to verify pass, then commit**

```bash
cd chelone && git add packages/core/src/data/mutation-options* && git commit -m "feat(core): mutation factories with pessimistic default + optimistic rollback (type-preserving)"
```

---

## Task 7: React adapter — CheloneProvider + hooks

**Files:**
- Create: `packages/react/src/context.tsx`, `packages/react/src/hooks.ts`
- Create (if not created in Task 2): `packages/react/vitest.config.ts`
- Test: `packages/react/src/hooks.test.tsx`

**Interfaces:**
- Consumes: everything from `@chelone/core` (factories, `DataContext`, contract), `@tanstack/react-query` (`QueryClientProvider`, `useQuery`, `useMutation`), React.
- Produces:
  - `CheloneProvider({ dataProvider, queryClient, children })` — provides the `DataContext` AND wraps `QueryClientProvider`
  - `useCheloneContext(): DataContext` — throws a clear error outside the provider
  - `useGetList(resource, params?, options?)`, `useGetOne`, `useGetMany` — `useQuery(factoryOptions)` with pass-through option overrides
  - `useCreate(resource)`, `useUpdate(resource, opts?)`, `useDelete(resource, opts?)` — `useMutation(factoryOptions)`
  - `createCheloneHooks<TResources>()` — returns the same hooks pre-bound to the registry type, so apps get `hooks.useGetList('posts')` with full inference and rejected unknown names.

- [ ] **Step 1: Write failing tests**

`packages/react/src/hooks.test.tsx`:

```tsx
import { QueryClient } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, expectTypeOf, it } from "vitest";
import { z } from "zod";
import { defineResources, fakeDataProvider } from "@chelone/core";
import type { ReactNode } from "react";
import { CheloneProvider } from "./context";
import { createCheloneHooks, useGetList, useGetOne, useUpdate } from "./hooks";

const resources = defineResources({
  posts: { schema: z.object({ id: z.number(), title: z.string() }) },
});
type R = typeof resources;

function makeWrapper() {
  const dataProvider = fakeDataProvider<R>({
    posts: [
      { id: 1, title: "a" },
      { id: 2, title: "b" },
    ],
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <CheloneProvider dataProvider={dataProvider} queryClient={queryClient}>
      {children}
    </CheloneProvider>
  );
  return { wrapper, queryClient };
}

describe("react hooks", () => {
  it("useGetList resolves typed data through the provider", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useGetList<R, "posts">("posts"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data.map((p) => p.title)).toEqual(["a", "b"]);
  });

  it("useGetOne is served from the list-seeded cache shape", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useGetOne<R, "posts">("posts", { id: 1 }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.title).toBe("a");
  });

  it("useUpdate mutates and the list refetches (invalidation)", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(
      () => ({ list: useGetList<R, "posts">("posts"), update: useUpdate<R, "posts">("posts") }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
    result.current.update.mutate({ id: 1, data: { title: "a2" } });
    await waitFor(() =>
      expect(result.current.list.data?.data.find((p) => p.id === 1)?.title).toBe("a2"),
    );
  });

  it("createCheloneHooks binds the registry type — data infers, bad names reject", async () => {
    const hooks = createCheloneHooks<R>();
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => hooks.useGetList("posts"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectTypeOf(result.current.data?.data).toEqualTypeOf<
      { id: number; title: string }[] | undefined
    >();
    // @ts-expect-error unknown resource name rejected by the bound hooks
    void (() => hooks.useGetList("nope"));
  });

  it("useCheloneContext throws a clear error outside the provider", () => {
    expect(() => renderHook(() => useGetList("posts"))).toThrow(/CheloneProvider/);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd chelone && pnpm --filter @chelone/react test`
Expected: FAIL — cannot find modules `./context` / `./hooks`.

- [ ] **Step 3: Implement**

`packages/react/src/context.tsx`:

```tsx
import type { DataContext, DataProvider, ResourceMap } from "@chelone/core";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { createContext, useContext, useMemo, type ReactNode } from "react";

const CheloneContext = createContext<DataContext | null>(null);

export interface CheloneProviderProps<TResources extends ResourceMap = ResourceMap> {
  dataProvider: DataProvider<TResources>;
  queryClient: QueryClient;
  children: ReactNode;
}

export function CheloneProvider<TResources extends ResourceMap = ResourceMap>({
  dataProvider,
  queryClient,
  children,
}: CheloneProviderProps<TResources>) {
  const value = useMemo(
    () => ({ dataProvider, queryClient }) as DataContext,
    [dataProvider, queryClient],
  );
  return (
    <CheloneContext.Provider value={value}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </CheloneContext.Provider>
  );
}

export function useCheloneContext<TResources extends ResourceMap = ResourceMap>(): DataContext<TResources> {
  const ctx = useContext(CheloneContext);
  if (!ctx) {
    throw new Error("useCheloneContext: no <CheloneProvider> found above this component.");
  }
  return ctx as DataContext<TResources>;
}
```

`packages/react/src/hooks.ts`:

```ts
import {
  createMutationOptions,
  deleteMutationOptions,
  getListOptions,
  getManyOptions,
  getOneOptions,
  updateMutationOptions,
  type GetListParams,
  type GetManyParams,
  type GetOneParams,
  type MutationModeOptions,
  type ResourceMap,
} from "@chelone/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCheloneContext } from "./context";

export function useGetList<TResources extends ResourceMap = ResourceMap, TName extends keyof TResources & string = keyof TResources & string>(
  resource: TName,
  params: GetListParams = {},
  options: { enabled?: boolean; staleTime?: number } = {},
) {
  const ctx = useCheloneContext<TResources>();
  return useQuery({ ...getListOptions(ctx, resource, params), ...options });
}

export function useGetOne<TResources extends ResourceMap = ResourceMap, TName extends keyof TResources & string = keyof TResources & string>(
  resource: TName,
  params: GetOneParams,
  options: { enabled?: boolean; staleTime?: number } = {},
) {
  const ctx = useCheloneContext<TResources>();
  return useQuery({ ...getOneOptions(ctx, resource, params), ...options });
}

export function useGetMany<TResources extends ResourceMap = ResourceMap, TName extends keyof TResources & string = keyof TResources & string>(
  resource: TName,
  params: GetManyParams,
  options: { enabled?: boolean; staleTime?: number } = {},
) {
  const ctx = useCheloneContext<TResources>();
  return useQuery({ ...getManyOptions(ctx, resource, params), ...options });
}

export function useCreate<TResources extends ResourceMap = ResourceMap, TName extends keyof TResources & string = keyof TResources & string>(
  resource: TName,
) {
  const ctx = useCheloneContext<TResources>();
  return useMutation(createMutationOptions(ctx, resource));
}

export function useUpdate<TResources extends ResourceMap = ResourceMap, TName extends keyof TResources & string = keyof TResources & string>(
  resource: TName,
  options: MutationModeOptions = {},
) {
  const ctx = useCheloneContext<TResources>();
  return useMutation(updateMutationOptions(ctx, resource, options));
}

export function useDelete<TResources extends ResourceMap = ResourceMap, TName extends keyof TResources & string = keyof TResources & string>(
  resource: TName,
  options: MutationModeOptions = {},
) {
  const ctx = useCheloneContext<TResources>();
  return useMutation(deleteMutationOptions(ctx, resource, options));
}

/**
 * Bind the hooks to a registry type once — full inference at every call site:
 *   const hooks = createCheloneHooks<typeof resources>();
 *   hooks.useGetList('posts')  // data: Post[]; 'nope' rejects
 */
export function createCheloneHooks<TResources extends ResourceMap>() {
  return {
    useGetList: <TName extends keyof TResources & string>(
      resource: TName,
      params?: GetListParams,
      options?: { enabled?: boolean; staleTime?: number },
    ) => useGetList<TResources, TName>(resource, params, options),
    useGetOne: <TName extends keyof TResources & string>(
      resource: TName,
      params: GetOneParams,
      options?: { enabled?: boolean; staleTime?: number },
    ) => useGetOne<TResources, TName>(resource, params, options),
    useGetMany: <TName extends keyof TResources & string>(resource: TName, params: GetManyParams) =>
      useGetMany<TResources, TName>(resource, params),
    useCreate: <TName extends keyof TResources & string>(resource: TName) =>
      useCreate<TResources, TName>(resource),
    useUpdate: <TName extends keyof TResources & string>(resource: TName, options?: MutationModeOptions) =>
      useUpdate<TResources, TName>(resource, options),
    useDelete: <TName extends keyof TResources & string>(resource: TName, options?: MutationModeOptions) =>
      useDelete<TResources, TName>(resource, options),
  };
}
```

(`packages/react/vitest.config.ts` from Task 2 Step 3 if not already present.)

- [ ] **Step 4: Run to verify pass, then commit**

Run: `cd chelone && pnpm --filter @chelone/react test`
Expected: PASS (5 tests).

```bash
cd chelone && git add packages/react && git commit -m "feat(react): CheloneProvider + data hooks (useGetList/One/Many, useCreate/Update/Delete, createCheloneHooks)"
```

---

## Task 8: Barrels + full gate

**Files:**
- Modify: `packages/core/src/index.ts`, `packages/react/src/index.ts`

**Interfaces:**
- Produces: complete public surfaces for both packages.

- [ ] **Step 1: Extend `packages/core/src/index.ts`**

Append to the existing exports:

```ts
export { ValidationError } from "./data/errors";
export { listKey, manyKey, manyReferenceKey, oneKey, resourceKey } from "./data/keys";
export { getListOptions, getManyOptions, getOneOptions } from "./data/query-options";
export type { DataContext } from "./data/query-options";
export {
  createMutationOptions,
  deleteMutationOptions,
  updateMutationOptions,
} from "./data/mutation-options";
export type { MutationMode, MutationModeOptions } from "./data/mutation-options";
export { fakeDataProvider } from "./data/fake-provider";
export type {
  CursorPagination,
  GetManyParams,
  GetManyReferenceParams,
  GetManyReferenceResult,
  GetManyResult,
  PageInfo,
  PagePagination,
  Pagination,
  UpdateManyParams,
  UpdateManyResult,
  DeleteManyParams,
  DeleteManyResult,
} from "./data/types";
```

(Remove the now-stale `PaginationPayload` export if present from P1.)

- [ ] **Step 2: Write `packages/react/src/index.ts`**

```ts
export { CheloneProvider, useCheloneContext } from "./context";
export type { CheloneProviderProps } from "./context";
export {
  createCheloneHooks,
  useCreate,
  useDelete,
  useGetList,
  useGetMany,
  useGetOne,
  useUpdate,
} from "./hooks";
```

- [ ] **Step 3: Full gate**

Run: `cd chelone && pnpm test && pnpm typecheck && pnpm lint && pnpm exec turbo run test typecheck --force`
Expected: ALL green, uncached run included.

- [ ] **Step 4: Commit**

```bash
cd chelone && git add -A && git commit -m "feat: complete P2 public surfaces (core data runtime + react adapter barrels)"
```

---

## Self-Review

**Spec coverage (charter §7 P2 + §11 commitments + session scope calls):**
- 9-verb contract, subset hooks → Task 1 (contract), Tasks 5–7 (getList/getOne/getMany + create/update/delete factories+hooks; getManyReference/bulk = contract-only, as scoped). ✅
- Cursor pagination union (§11) → Task 1 + fake provider cursor mode (Task 4). ✅
- Pessimistic default + structuredClone type preservation (§11) → Task 6 (+ explicit Date-survival test). ✅
- exports maps + peer ranges (§11) → Task 2. ✅
- ValidationError field-error shape (§11, P5 consumer) → Task 1. ✅
- Query-key conventions + cache cross-population (charter §5.3) → Tasks 3, 5. ✅
- Fake provider → Task 4. ✅
- React adapter hooks (charter P2) → Task 7, incl. `createCheloneHooks` end-to-end inference. ✅
- Server data-entry (dehydrate/hydrate): factories are already `prefetchQuery`-compatible by construction; the dedicated server entry is P6 per charter — correctly absent here.

**Placeholder scan:** No TBD/TODO; all code steps show complete code. Two deliberate `// ponytail:` ceilings documented (fake cursor = offset; optimistic lists invalidate-not-patch). ✅

**Type consistency:** `DataContext` (Task 5) consumed by Task 6/7 under the same name; `MutationModeOptions` produced Task 6, consumed Task 7; key factories (Task 3) names match usage in Tasks 5/6; `Pagination`/`PageInfo` (Task 1) match fake-provider usage (Task 4). `PaginationPayload` removal noted in Task 8. ✅

**Known risks (with in-plan mitigations):** pagination-union excess-property rejection (Task 1 Step 3 note); react test env needs jsdom + config (Task 2 Step 3 / Task 7); `as never` boundary casts in fake provider flagged for reviewer attention (Task 4 note).
