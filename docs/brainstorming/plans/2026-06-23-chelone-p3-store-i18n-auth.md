# Chelone P3: Store, i18n, Auth — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the three self-contained provider services: an SSR-safe keyed KV store with per-key subscription, a zero-dep typed i18n engine on `Intl` (reactive locale, no remount), and the `AuthProvider` contract + free access-control matcher — plus their React adapter hooks.

**Architecture:** All three follow the P2 pattern — vanilla primitives in `@chelone/core`, thin `useSyncExternalStore`/`useQuery` bridges in `@chelone/react`. Store: keyed KV with **native per-key notification** (a write to key A notifies only A's subscribers) + pluggable persistence adapters. i18n: `as const` catalogs → literal-union keys with **template-literal interpolation-param inference**; pluralization via native `Intl.PluralRules`; locale change notifies subscribers (no `key`-bump remount — the ra-core sin this replaces). Auth: contract + query-option factories (same shape as P2 data factories) + a deny-by-default permission matcher.

**Tech Stack:** zero new runtime deps in core (stdlib `Intl`, own store). React adapter reuses existing peers.

## Global Constraints

- **Repo:** `chelone`, branch `main`. Never commit `.superpowers/`.
- **Boundary (unchanged):** `@chelone/core` never imports react/react-dom/react-hook-form/react-router. Biome-enforced.
- **No import-time browser access** (the ra-core bug this fixes): `typeof window`/`localStorage` checks live INSIDE functions, never at module top level.
- **Snapshot stability:** `store.getItem` must return the SAME reference until the value changes (`useSyncExternalStore` loops on fresh refs). Values are cached in an in-memory `Map`; the persistence adapter is write-through.
- **Per-key notification:** `subscribe(key, cb)` — a `setItem('a', …)` must NOT invoke subscribers of `'b'`.
- **Deny by default:** the access-control matcher returns `false` unless a permission explicitly matches.
- **i18n:** message keys are literal unions inferred from `as const` catalogs; interpolation params are inferred from `{placeholder}` template-literal types; pluralization uses `Intl.PluralRules` (never hand-rolled English rules). Locale change = subscriber notification, never a remount requirement.
- **Type tests** `*.test-d.ts`, runtime tests `*.test.ts`. Conventional Commits. Lockfile committed with the task that changes it (none expected — zero new deps).
- Run `pnpm exec biome check --write <files>` before each commit (Task 5 of P2 learned: unformatted files fail the repo lint gate).

---

## File Structure

```
packages/core/src/
  store/
    store.ts              createStore, ChelonStore, StoreAdapter
    store.test.ts
    adapters.ts           memoryStoreAdapter, localStorageAdapter (SSR-guarded, cross-tab)
    adapters.test.ts
  i18n/
    messages.ts           defineMessages, MessageCatalog, InterpolationParams type machinery
    messages.test-d.ts
    i18n.ts               createI18n (reactive locale, translate, Intl.PluralRules)
    i18n.test.ts
  auth/
    types.ts              AuthProvider, UserIdentity, CanAccessParams
    access-control.ts     matchPermission, canAccessWithPermissions (deny-by-default)
    access-control.test.ts
    auth-options.ts       identityQueryOptions, canAccessQueryOptions (P2 factory pattern)
    auth-options.test.ts
  index.ts                EXTEND barrel
packages/react/src/
  store-hooks.ts          useStoreItem
  i18n-hooks.ts           useTranslate, useLocale, useSetLocale
  auth-hooks.ts           useGetIdentity, useCanAccess, useLogin, useLogout
  context.tsx             EXTEND: CheloneProvider gains store?, i18n?, authProvider?
  hooks.test.tsx          EXTEND (or new sibling p3-hooks.test.tsx)
  index.ts                EXTEND barrel
```

**Model hints:** Tasks 1, 3, 4, 5, 7 subtle (session model + review); Tasks 2, 6, 8 mechanical.

---

## Task 1: Store core — keyed KV, per-key subscription, snapshot stability

**Files:**
- Create: `packages/core/src/store/store.ts`
- Test: `packages/core/src/store/store.test.ts`

**Interfaces:**
- Produces:
  - `interface StoreAdapter { getItem(key: string): unknown; setItem(key: string, value: unknown): void; removeItem(key: string): void; subscribeExternal?(onChange: (key: string, value: unknown) => void): () => void }`
  - `interface ChelonStore { getItem<T>(key: string): T | undefined; setItem<T>(key: string, value: T): void; removeItem(key: string): void; subscribe(key: string, callback: () => void): () => void; keys(): string[] }`
  - `function createStore(adapter?: StoreAdapter): ChelonStore`

- [ ] **Step 1: Write failing tests**

`packages/core/src/store/store.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { createStore } from "./store";

describe("createStore", () => {
  it("set/get round-trips and getItem is reference-stable until changed", () => {
    const store = createStore();
    const value = { columns: ["a", "b"] };
    store.setItem("posts.list.columns", value);
    const first = store.getItem("posts.list.columns");
    const second = store.getItem("posts.list.columns");
    expect(first).toBe(second); // SAME reference — useSyncExternalStore requirement
    expect(first).toEqual(value);
  });

  it("notifies ONLY the touched key's subscribers", () => {
    const store = createStore();
    const onA = vi.fn();
    const onB = vi.fn();
    store.subscribe("a", onA);
    store.subscribe("b", onB);
    store.setItem("a", 1);
    expect(onA).toHaveBeenCalledTimes(1);
    expect(onB).not.toHaveBeenCalled();
  });

  it("unsubscribe stops notifications", () => {
    const store = createStore();
    const cb = vi.fn();
    const unsub = store.subscribe("k", cb);
    unsub();
    store.setItem("k", 1);
    expect(cb).not.toHaveBeenCalled();
  });

  it("removeItem clears the value and notifies", () => {
    const store = createStore();
    const cb = vi.fn();
    store.setItem("k", 1);
    store.subscribe("k", cb);
    store.removeItem("k");
    expect(store.getItem("k")).toBeUndefined();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("hydrates lazily from the adapter on first getItem", () => {
    const backing = new Map<string, unknown>([["k", 42]]);
    const adapter = {
      getItem: (k: string) => backing.get(k),
      setItem: (k: string, v: unknown) => void backing.set(k, v),
      removeItem: (k: string) => void backing.delete(k),
    };
    const store = createStore(adapter);
    expect(store.getItem("k")).toBe(42);
  });

  it("writes through to the adapter", () => {
    const setItem = vi.fn();
    const store = createStore({ getItem: () => undefined, setItem, removeItem: () => {} });
    store.setItem("k", "v");
    expect(setItem).toHaveBeenCalledWith("k", "v");
  });

  it("applies adapter external changes (cross-tab) and notifies the key", () => {
    let emit!: (key: string, value: unknown) => void;
    const adapter = {
      getItem: () => undefined,
      setItem: () => {},
      removeItem: () => {},
      subscribeExternal: (onChange: (key: string, value: unknown) => void) => {
        emit = onChange;
        return () => {};
      },
    };
    const store = createStore(adapter);
    const cb = vi.fn();
    store.subscribe("k", cb);
    emit("k", "from-another-tab");
    expect(cb).toHaveBeenCalledTimes(1);
    expect(store.getItem("k")).toBe("from-another-tab");
  });

  it("setItem with an identical value (Object.is) does not notify", () => {
    const store = createStore();
    const cb = vi.fn();
    store.setItem("k", 1);
    store.subscribe("k", cb);
    store.setItem("k", 1);
    expect(cb).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd chelone && pnpm --filter @chelone/core test`
Expected: FAIL — cannot find module `./store`.

- [ ] **Step 3: Implement `packages/core/src/store/store.ts`**

```ts
/** Persistence backend. Optional external-change feed (e.g. cross-tab). */
export interface StoreAdapter {
  getItem(key: string): unknown;
  setItem(key: string, value: unknown): void;
  removeItem(key: string): void;
  subscribeExternal?(onChange: (key: string, value: unknown) => void): () => void;
}

/**
 * Keyed KV store with native per-key notification: a write to key A notifies
 * only A's subscribers — no selector sweep. Values cached in-memory for
 * reference-stable snapshots (useSyncExternalStore-compatible); the adapter
 * is a write-through persistence layer, hydrated lazily per key.
 */
export interface ChelonStore {
  getItem<T>(key: string): T | undefined;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
  subscribe(key: string, callback: () => void): () => void;
  keys(): string[];
}

export function createStore(adapter?: StoreAdapter): ChelonStore {
  const cache = new Map<string, unknown>();
  const hydrated = new Set<string>();
  const subscribers = new Map<string, Set<() => void>>();

  const notify = (key: string) => {
    const set = subscribers.get(key);
    if (set) for (const cb of set) cb();
  };
  const apply = (key: string, value: unknown) => {
    hydrated.add(key);
    if (value === undefined) cache.delete(key);
    else cache.set(key, value);
    notify(key);
  };

  adapter?.subscribeExternal?.((key, value) => apply(key, value));

  return {
    getItem<T>(key: string): T | undefined {
      if (!hydrated.has(key) && adapter) {
        hydrated.add(key);
        const persisted = adapter.getItem(key);
        if (persisted !== undefined) cache.set(key, persisted);
      }
      return cache.get(key) as T | undefined;
    },
    setItem<T>(key: string, value: T): void {
      hydrated.add(key);
      if (Object.is(cache.get(key), value)) return;
      cache.set(key, value);
      adapter?.setItem(key, value);
      notify(key);
    },
    removeItem(key: string): void {
      hydrated.add(key);
      cache.delete(key);
      adapter?.removeItem(key);
      notify(key);
    },
    subscribe(key: string, callback: () => void): () => void {
      let set = subscribers.get(key);
      if (!set) {
        set = new Set();
        subscribers.set(key, set);
      }
      set.add(callback);
      return () => {
        set.delete(callback);
        if (set.size === 0) subscribers.delete(key);
      };
    },
    keys(): string[] {
      return [...cache.keys()];
    },
  };
}
```

- [ ] **Step 4: Run to verify pass; format; commit**

Run: `cd chelone && pnpm --filter @chelone/core test && pnpm exec biome check --write packages/core/src/store && pnpm lint`

```bash
git add packages/core/src/store && git commit -m "feat(core): keyed KV store with per-key subscription and stable snapshots"
```

---

## Task 2: Store adapters — memory + SSR-safe localStorage with cross-tab sync

**Files:**
- Create: `packages/core/src/store/adapters.ts`
- Test: `packages/core/src/store/adapters.test.ts`

**Interfaces:**
- Consumes: `StoreAdapter` (Task 1).
- Produces:
  - `function memoryStoreAdapter(initial?: Record<string, unknown>): StoreAdapter`
  - `function localStorageAdapter(options?: { prefix?: string }): StoreAdapter` — default prefix `"chelone."`; JSON serialization; **all** `window`/`localStorage` access inside method bodies (SSR-safe: on the server every method no-ops / returns undefined); `subscribeExternal` wires the `storage` event (guarded).

- [ ] **Step 1: Write failing tests**

`packages/core/src/store/adapters.test.ts`:

```ts
// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { localStorageAdapter, memoryStoreAdapter } from "./adapters";

describe("memoryStoreAdapter", () => {
  it("round-trips and seeds from initial", () => {
    const a = memoryStoreAdapter({ seeded: 1 });
    expect(a.getItem("seeded")).toBe(1);
    a.setItem("k", { x: 1 });
    expect(a.getItem("k")).toEqual({ x: 1 });
    a.removeItem("k");
    expect(a.getItem("k")).toBeUndefined();
  });
});

describe("localStorageAdapter", () => {
  it("persists JSON under the prefix", () => {
    const a = localStorageAdapter();
    a.setItem("sidebar.open", false);
    expect(window.localStorage.getItem("chelone.sidebar.open")).toBe("false");
    expect(a.getItem("sidebar.open")).toBe(false);
  });

  it("returns undefined for missing keys and survives corrupt JSON", () => {
    const a = localStorageAdapter();
    expect(a.getItem("nope")).toBeUndefined();
    window.localStorage.setItem("chelone.bad", "{not json");
    expect(a.getItem("bad")).toBeUndefined();
  });

  it("emits external changes from the storage event (cross-tab)", () => {
    const a = localStorageAdapter();
    const onChange = vi.fn();
    a.subscribeExternal?.(onChange);
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "chelone.locale",
        newValue: JSON.stringify("fr"),
        storageArea: window.localStorage,
      }),
    );
    expect(onChange).toHaveBeenCalledWith("locale", "fr");
  });

  it("ignores storage events outside the prefix", () => {
    const a = localStorageAdapter();
    const onChange = vi.fn();
    a.subscribeExternal?.(onChange);
    window.dispatchEvent(
      new StorageEvent("storage", { key: "other.thing", newValue: '"x"' }),
    );
    expect(onChange).not.toHaveBeenCalled();
  });
});
```

Note the `// @vitest-environment jsdom` pragma — core's vitest env is `node`; this file opts into jsdom for `window`/`StorageEvent`. Add `jsdom` to `@chelone/core` devDependencies if not resolvable (`pnpm --filter @chelone/core add -D jsdom`), and commit the lockfile change.

Also add a node-env SSR-safety test at the END of `packages/core/src/store/store.test.ts` (node env — no window):

```ts
it("localStorageAdapter is SSR-safe: importable and callable without window", async () => {
  const { localStorageAdapter } = await import("./adapters");
  const a = localStorageAdapter();
  expect(a.getItem("k")).toBeUndefined();
  expect(() => a.setItem("k", 1)).not.toThrow();
  expect(() => a.removeItem("k")).not.toThrow();
});
```

- [ ] **Step 2: Run to verify failure** (cannot find module `./adapters`)

- [ ] **Step 3: Implement `packages/core/src/store/adapters.ts`**

```ts
import type { StoreAdapter } from "./store";

export function memoryStoreAdapter(initial: Record<string, unknown> = {}): StoreAdapter {
  const map = new Map<string, unknown>(Object.entries(initial));
  return {
    getItem: (key) => map.get(key),
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
  };
}

/** window/localStorage touched ONLY inside method bodies — module import is SSR-safe. */
function storage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined; // storage blocked (privacy mode / sandbox)
  }
}

export function localStorageAdapter(options: { prefix?: string } = {}): StoreAdapter {
  const prefix = options.prefix ?? "chelone.";
  return {
    getItem(key) {
      const raw = storage()?.getItem(prefix + key);
      if (raw == null) return undefined;
      try {
        return JSON.parse(raw) as unknown;
      } catch {
        return undefined;
      }
    },
    setItem(key, value) {
      try {
        storage()?.setItem(prefix + key, JSON.stringify(value));
      } catch {
        // quota exceeded / serialization failure — preference writes are best-effort
      }
    },
    removeItem(key) {
      storage()?.removeItem(prefix + key);
    },
    subscribeExternal(onChange) {
      if (typeof window === "undefined") return () => {};
      const listener = (event: StorageEvent) => {
        if (!event.key || !event.key.startsWith(prefix)) return;
        const key = event.key.slice(prefix.length);
        if (event.newValue == null) {
          onChange(key, undefined);
          return;
        }
        try {
          onChange(key, JSON.parse(event.newValue) as unknown);
        } catch {
          // ignore corrupt cross-tab payloads
        }
      };
      window.addEventListener("storage", listener);
      return () => window.removeEventListener("storage", listener);
    },
  };
}
```

- [ ] **Step 4: Run to verify pass; format; commit**

```bash
cd chelone && pnpm --filter @chelone/core test && pnpm exec biome check --write packages/core/src/store && pnpm lint
git add -A && git commit -m "feat(core): memory + SSR-safe localStorage store adapters (cross-tab sync)"
```

---

## Task 3: i18n type machinery — typed catalogs + interpolation-param inference

**Files:**
- Create: `packages/core/src/i18n/messages.ts`
- Test: `packages/core/src/i18n/messages.test-d.ts`

**Interfaces:**
- Produces:
  - `type PluralMessage = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string }` (`other` mandatory — Intl fallback category)
  - `type MessageValue = string | PluralMessage`
  - `type MessageCatalog = Record<string, MessageValue>`
  - `function defineMessages<const T extends MessageCatalog>(catalog: T): T`
  - `type ExtractParams<T extends string>` — recursive template-literal extraction of `{name}` placeholders
  - `type TranslateParams<TValue>` — for a string message: `{ [placeholder]: string | number }` (or `undefined` if none); for a plural message: placeholders of the `other` branch & `{ count: number }`
  - `type MessageKey<TCatalog>` = `keyof TCatalog & string`

- [ ] **Step 1: Write failing type tests**

`packages/core/src/i18n/messages.test-d.ts`:

```ts
import { describe, expectTypeOf, it } from "vitest";
import { defineMessages, type MessageKey, type TranslateParams } from "./messages";

const messages = defineMessages({
  "chelone.action.save": "Save",
  "chelone.greeting": "Hello {name}, you have {count} items",
  "chelone.notification.deleted": {
    one: "1 element deleted",
    other: "{smart_count} elements deleted",
  },
});
type M = typeof messages;

describe("i18n type machinery", () => {
  it("keys are a literal union", () => {
    expectTypeOf<MessageKey<M>>().toEqualTypeOf<
      "chelone.action.save" | "chelone.greeting" | "chelone.notification.deleted"
    >();
  });

  it("plain message without placeholders needs no params", () => {
    expectTypeOf<TranslateParams<M["chelone.action.save"]>>().toEqualTypeOf<undefined>();
  });

  it("placeholders infer required param names", () => {
    expectTypeOf<TranslateParams<M["chelone.greeting"]>>().toEqualTypeOf<{
      name: string | number;
      count: string | number;
    }>();
  });

  it("plural message requires count plus the other-branch placeholders", () => {
    expectTypeOf<TranslateParams<M["chelone.notification.deleted"]>>().toEqualTypeOf<
      { smart_count: string | number } & { count: number }
    >();
  });
});
```

- [ ] **Step 2: Run to verify failure** (cannot find module `./messages`)

- [ ] **Step 3: Implement `packages/core/src/i18n/messages.ts`**

```ts
/** Plural forms keyed by Intl.PluralRules categories; `other` is the mandatory fallback. */
export type PluralMessage = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };
export type MessageValue = string | PluralMessage;
export type MessageCatalog = Record<string, MessageValue>;

/** Identity helper pinning literal keys AND literal template strings (for param inference). */
export function defineMessages<const T extends MessageCatalog>(catalog: T): T {
  return catalog;
}

export type MessageKey<TCatalog extends MessageCatalog> = keyof TCatalog & string;

/** Recursively extract `{name}` placeholder names from a template string type. */
export type ExtractParams<T extends string> =
  T extends `${string}{${infer Param}}${infer Rest}` ? Param | ExtractParams<Rest> : never;

type ParamsObject<T extends string> = [ExtractParams<T>] extends [never]
  ? undefined
  : { [K in ExtractParams<T>]: string | number };

/**
 * Required params for a message value: placeholder names for plain strings;
 * plural messages additionally require `count` (drives Intl.PluralRules).
 */
export type TranslateParams<TValue extends MessageValue> = TValue extends string
  ? ParamsObject<TValue>
  : TValue extends PluralMessage
    ? ([ExtractParams<TValue["other"]>] extends [never]
        ? unknown
        : { [K in ExtractParams<TValue["other"]>]: string | number }) & { count: number }
    : never;
```

Note: if `toEqualTypeOf` on the plural-intersection case fails on intersection-vs-flattened shape, adjust the TEST to two `toMatchTypeOf` assertions (params + count) — the behavior contract, not the exact intersection encoding, is what's pinned.

- [ ] **Step 4: Run to verify pass; format; commit**

```bash
cd chelone && pnpm --filter @chelone/core test && pnpm exec biome check --write packages/core/src/i18n && pnpm lint
git add packages/core/src/i18n && git commit -m "feat(core): typed i18n catalogs with interpolation-param inference"
```

---

## Task 4: i18n runtime — reactive locale + Intl.PluralRules translate

**Files:**
- Create: `packages/core/src/i18n/i18n.ts`
- Test: `packages/core/src/i18n/i18n.test.ts`

**Interfaces:**
- Consumes: Task 3 types.
- Produces:
  - `interface ChelonI18n<TCatalog extends MessageCatalog> { translate<K extends MessageKey<TCatalog>>(key: K, ...params: TranslateParams<TCatalog[K]> extends undefined ? [] : [TranslateParams<TCatalog[K]>]): string; getLocale(): string; setLocale(locale: string): void; getLocales(): string[]; subscribe(callback: () => void): () => void }`
  - `function createI18n<const TCatalog extends MessageCatalog>(options: { locale: string; messages: Record<string, TCatalog>; fallbackLocale?: string }): ChelonI18n<TCatalog>`
  - Behavior: interpolation replaces every `{name}`; plural messages pick the branch via `new Intl.PluralRules(locale).select(count)` falling back to `other`; missing key returns the key itself (never throws); unknown locale on `setLocale` throws; locale change notifies subscribers **synchronously** (reactive — no remount).

- [ ] **Step 1: Write failing tests**

`packages/core/src/i18n/i18n.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { createI18n } from "./i18n";
import { defineMessages } from "./messages";

const en = defineMessages({
  "chelone.action.save": "Save",
  "chelone.greeting": "Hello {name}",
  "chelone.notification.deleted": {
    one: "1 element deleted",
    other: "{smart_count} elements deleted",
  },
});
const fr = defineMessages({
  "chelone.action.save": "Enregistrer",
  "chelone.greeting": "Bonjour {name}",
  "chelone.notification.deleted": {
    one: "1 élément supprimé",
    other: "{smart_count} éléments supprimés",
  },
});

const make = () => createI18n({ locale: "en", messages: { en, fr } });

describe("createI18n", () => {
  it("translates plain keys and interpolates placeholders", () => {
    const i18n = make();
    expect(i18n.translate("chelone.action.save")).toBe("Save");
    expect(i18n.translate("chelone.greeting", { name: "Rin" })).toBe("Hello Rin");
  });

  it("pluralizes via Intl.PluralRules with count", () => {
    const i18n = make();
    expect(i18n.translate("chelone.notification.deleted", { count: 1, smart_count: 1 })).toBe(
      "1 element deleted",
    );
    expect(i18n.translate("chelone.notification.deleted", { count: 4, smart_count: 4 })).toBe(
      "4 elements deleted",
    );
  });

  it("setLocale switches translations and notifies subscribers synchronously", () => {
    const i18n = make();
    const cb = vi.fn();
    i18n.subscribe(cb);
    i18n.setLocale("fr");
    expect(cb).toHaveBeenCalledTimes(1);
    expect(i18n.translate("chelone.action.save")).toBe("Enregistrer");
  });

  it("falls back to fallbackLocale for keys missing in the active locale, then to the key", () => {
    const i18n = createI18n({
      locale: "fr",
      fallbackLocale: "en",
      messages: { en, fr: defineMessages({ "chelone.action.save": "Enregistrer" }) },
    });
    expect(i18n.translate("chelone.greeting", { name: "Rin" })).toBe("Hello Rin"); // en fallback
    expect(i18n.translate("chelone.missing" as never)).toBe("chelone.missing"); // key fallback, no throw
  });

  it("setLocale of an unknown locale throws; getLocales lists catalogs", () => {
    const i18n = make();
    expect(i18n.getLocales().sort()).toEqual(["en", "fr"]);
    expect(() => i18n.setLocale("de")).toThrow(/unknown locale/i);
  });

  it("unsubscribe stops locale notifications", () => {
    const i18n = make();
    const cb = vi.fn();
    const unsub = i18n.subscribe(cb);
    unsub();
    i18n.setLocale("fr");
    expect(cb).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run to verify failure** (cannot find module `./i18n`)

- [ ] **Step 3: Implement `packages/core/src/i18n/i18n.ts`**

```ts
import type { MessageCatalog, MessageKey, MessageValue, TranslateParams } from "./messages";

export interface ChelonI18n<TCatalog extends MessageCatalog> {
  translate<K extends MessageKey<TCatalog>>(
    key: K,
    ...params: TranslateParams<TCatalog[K]> extends undefined
      ? []
      : [TranslateParams<TCatalog[K]>]
  ): string;
  getLocale(): string;
  setLocale(locale: string): void;
  getLocales(): string[];
  subscribe(callback: () => void): () => void;
}

function interpolate(template: string, params: Record<string, unknown> | undefined): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

function resolve(value: MessageValue, locale: string, params?: Record<string, unknown>): string {
  if (typeof value === "string") return interpolate(value, params);
  const count = typeof params?.count === "number" ? params.count : Number(params?.count ?? Number.NaN);
  const category = Number.isNaN(count) ? "other" : new Intl.PluralRules(locale).select(count);
  return interpolate(value[category] ?? value.other, params);
}

export function createI18n<const TCatalog extends MessageCatalog>(options: {
  locale: string;
  messages: Record<string, TCatalog>;
  fallbackLocale?: string;
}): ChelonI18n<TCatalog> {
  let locale = options.locale;
  const subscribers = new Set<() => void>();

  return {
    translate(key, ...args) {
      const params = args[0] as Record<string, unknown> | undefined;
      const value = options.messages[locale]?.[key] ?? (options.fallbackLocale ? options.messages[options.fallbackLocale]?.[key] : undefined);
      if (value === undefined) return key; // never throw — surface the key
      return resolve(value, locale, params);
    },
    getLocale: () => locale,
    setLocale(next) {
      if (!(next in options.messages)) {
        throw new Error(`createI18n: unknown locale "${next}" — available: ${Object.keys(options.messages).join(", ")}`);
      }
      if (next === locale) return;
      locale = next;
      for (const cb of subscribers) cb();
    },
    getLocales: () => Object.keys(options.messages),
    subscribe(callback) {
      subscribers.add(callback);
      return () => void subscribers.delete(callback);
    },
  };
}
```

- [ ] **Step 4: Run to verify pass; format; commit**

```bash
cd chelone && pnpm --filter @chelone/core test && pnpm exec biome check --write packages/core/src/i18n && pnpm lint
git add packages/core/src/i18n && git commit -m "feat(core): reactive i18n runtime on Intl.PluralRules (no-remount locale switching)"
```

---

## Task 5: Auth contract + deny-by-default access-control matcher

**Files:**
- Create: `packages/core/src/auth/types.ts`, `packages/core/src/auth/access-control.ts`
- Test: `packages/core/src/auth/access-control.test.ts`

**Interfaces:**
- Produces (`types.ts`):
  - `interface UserIdentity { id: Identifier; fullName?: string; avatar?: string; [key: string]: unknown }`
  - `interface CanAccessParams { action: string; resource: string; record?: unknown }`
  - `interface AuthProvider { login(params: Record<string, unknown>): Promise<void | { redirectTo?: string }>; logout(params?: unknown): Promise<void | string>; checkAuth(params?: unknown): Promise<void>; checkError(error: unknown): Promise<void>; getIdentity?(): Promise<UserIdentity>; canAccess?(params: CanAccessParams): Promise<boolean>; handleCallback?(): Promise<void | { redirectTo?: string }>; refreshAuth?(): Promise<void> }` — `refreshAuth` is the §11 token-refresh hook point (P6 shell wires the no-flash gate onto `checkAuth`).
- Produces (`access-control.ts`):
  - `interface Permission { action: string | string[]; resource: string; record?: (record: unknown) => boolean }`
  - `function canAccessWithPermissions(permissions: Permission[], params: CanAccessParams): boolean` — **deny by default**; `'*'` wildcards; `'posts.*'` prefix wildcards on resource; record predicate must pass when present AND a record is given.

- [ ] **Step 1: Write failing tests**

`packages/core/src/auth/access-control.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { canAccessWithPermissions, type Permission } from "./access-control";

describe("canAccessWithPermissions", () => {
  it("denies by default (empty permissions)", () => {
    expect(canAccessWithPermissions([], { action: "list", resource: "posts" })).toBe(false);
  });

  it("matches exact action + resource", () => {
    const perms: Permission[] = [{ action: ["list", "show"], resource: "posts" }];
    expect(canAccessWithPermissions(perms, { action: "list", resource: "posts" })).toBe(true);
    expect(canAccessWithPermissions(perms, { action: "edit", resource: "posts" })).toBe(false);
    expect(canAccessWithPermissions(perms, { action: "list", resource: "users" })).toBe(false);
  });

  it("supports * wildcards on action and resource", () => {
    expect(canAccessWithPermissions([{ action: "*", resource: "posts" }], { action: "delete", resource: "posts" })).toBe(true);
    expect(canAccessWithPermissions([{ action: "read", resource: "*" }], { action: "read", resource: "anything" })).toBe(true);
  });

  it("supports prefix wildcards on resource (posts.*)", () => {
    const perms: Permission[] = [{ action: "read", resource: "posts.*" }];
    expect(canAccessWithPermissions(perms, { action: "read", resource: "posts.title" })).toBe(true);
    expect(canAccessWithPermissions(perms, { action: "read", resource: "posts" })).toBe(false);
    expect(canAccessWithPermissions(perms, { action: "read", resource: "users.name" })).toBe(false);
  });

  it("record predicate gates when a record is provided", () => {
    const own: Permission[] = [
      { action: "edit", resource: "posts", record: (r) => (r as { author: string }).author === "rin" },
    ];
    expect(canAccessWithPermissions(own, { action: "edit", resource: "posts", record: { author: "rin" } })).toBe(true);
    expect(canAccessWithPermissions(own, { action: "edit", resource: "posts", record: { author: "eve" } })).toBe(false);
    // no record given → predicate permission does NOT grant blanket access
    expect(canAccessWithPermissions(own, { action: "edit", resource: "posts" })).toBe(false);
  });

  it("any matching permission grants (OR semantics)", () => {
    const perms: Permission[] = [
      { action: "read", resource: "users" },
      { action: "*", resource: "posts" },
    ];
    expect(canAccessWithPermissions(perms, { action: "edit", resource: "posts" })).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify failure**

- [ ] **Step 3: Implement**

`packages/core/src/auth/types.ts`:

```ts
import type { Identifier } from "../resource/identifier";

export interface UserIdentity {
  id: Identifier;
  fullName?: string;
  avatar?: string;
  [key: string]: unknown;
}

export interface CanAccessParams {
  action: string;
  resource: string;
  record?: unknown;
}

/**
 * The auth contract. All methods return promises; reject = not authenticated /
 * not permitted. `refreshAuth` is the token-refresh hook point (charter §11);
 * the P6 shell builds the no-flash SSR gate on `checkAuth`.
 */
export interface AuthProvider {
  login(params: Record<string, unknown>): Promise<void | { redirectTo?: string }>;
  logout(params?: unknown): Promise<void | string>;
  checkAuth(params?: unknown): Promise<void>;
  checkError(error: unknown): Promise<void>;
  getIdentity?(): Promise<UserIdentity>;
  canAccess?(params: CanAccessParams): Promise<boolean>;
  handleCallback?(): Promise<void | { redirectTo?: string }>;
  refreshAuth?(): Promise<void>;
}
```

`packages/core/src/auth/access-control.ts`:

```ts
import type { CanAccessParams } from "./types";

/** One grant. `record` predicate (when present) must pass against a provided record. */
export interface Permission {
  action: string | string[];
  resource: string;
  record?: (record: unknown) => boolean;
}

function matchesAction(granted: string | string[], action: string): boolean {
  const list = Array.isArray(granted) ? granted : [granted];
  return list.includes("*") || list.includes(action);
}

function matchesResource(granted: string, resource: string): boolean {
  if (granted === "*") return true;
  if (granted.endsWith(".*")) return resource.startsWith(granted.slice(0, -1));
  return granted === resource;
}

/** Deny-by-default permission matcher (OR across permissions). */
export function canAccessWithPermissions(
  permissions: Permission[],
  params: CanAccessParams,
): boolean {
  return permissions.some((permission) => {
    if (!matchesAction(permission.action, params.action)) return false;
    if (!matchesResource(permission.resource, params.resource)) return false;
    if (permission.record) {
      if (params.record === undefined) return false; // predicate grants never apply blanket
      return permission.record(params.record);
    }
    return true;
  });
}
```

Careful with the prefix-wildcard slice: `'posts.*'.slice(0, -1)` = `'posts.'` — so `'posts.title'` matches, bare `'posts'` does not (the test pins this).

- [ ] **Step 4: Run to verify pass; format; commit**

```bash
cd chelone && pnpm --filter @chelone/core test && pnpm exec biome check --write packages/core/src/auth && pnpm lint
git add packages/core/src/auth && git commit -m "feat(core): AuthProvider contract + deny-by-default access-control matcher"
```

---

## Task 6: Auth query-option factories

**Files:**
- Create: `packages/core/src/auth/auth-options.ts`
- Test: `packages/core/src/auth/auth-options.test.ts`

**Interfaces:**
- Consumes: `AuthProvider`, `CanAccessParams`, `UserIdentity` (Task 5); `QueryClient` pattern from P2 (`@tanstack/query-core` peer).
- Produces (P2 factory pattern — plain option objects):
  - `identityQueryOptions(authProvider)` → `{ queryKey: ['auth', 'getIdentity'], queryFn }` — throws a descriptive error if `getIdentity` is undefined
  - `canAccessQueryOptions(authProvider, params)` → `{ queryKey: ['auth', 'canAccess', params], queryFn }` — resolves `true` when the provider has no `canAccess` (no access control configured = allow, matching ra-core semantics; the deny-by-default matcher applies only once permissions are wired)
  - `authStateQueryOptions(authProvider)` → `{ queryKey: ['auth', 'checkAuth'], queryFn }` — resolves `{ authenticated: boolean }` (never rejects; maps checkAuth rejection to `{ authenticated: false }`)

- [ ] **Step 1: Write failing tests**

`packages/core/src/auth/auth-options.test.ts`:

```ts
import { QueryClient } from "@tanstack/query-core";
import { describe, expect, it } from "vitest";
import {
  authStateQueryOptions,
  canAccessQueryOptions,
  identityQueryOptions,
} from "./auth-options";
import type { AuthProvider } from "./types";

const base: AuthProvider = {
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
  checkError: async () => {},
};

describe("auth query option factories", () => {
  it("identityQueryOptions fetches the identity", async () => {
    const provider: AuthProvider = {
      ...base,
      getIdentity: async () => ({ id: 1, fullName: "Rin" }),
    };
    const client = new QueryClient();
    const identity = await client.fetchQuery(identityQueryOptions(provider));
    expect(identity).toMatchObject({ id: 1, fullName: "Rin" });
  });

  it("identityQueryOptions rejects clearly when getIdentity is missing", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await expect(client.fetchQuery(identityQueryOptions(base))).rejects.toThrow(/getIdentity/);
  });

  it("canAccessQueryOptions defaults to true without provider canAccess, and keys by params", async () => {
    const client = new QueryClient();
    const params = { action: "edit", resource: "posts" };
    const allowed = await client.fetchQuery(canAccessQueryOptions(base, params));
    expect(allowed).toBe(true);
    expect(canAccessQueryOptions(base, params).queryKey).toEqual(["auth", "canAccess", params]);
  });

  it("canAccessQueryOptions delegates to provider canAccess", async () => {
    const provider: AuthProvider = { ...base, canAccess: async ({ action }) => action === "read" };
    const client = new QueryClient();
    expect(await client.fetchQuery(canAccessQueryOptions(provider, { action: "read", resource: "x" }))).toBe(true);
    expect(await client.fetchQuery(canAccessQueryOptions(provider, { action: "edit", resource: "x" }))).toBe(false);
  });

  it("authStateQueryOptions maps checkAuth rejection to authenticated:false (never rejects)", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    expect(await client.fetchQuery(authStateQueryOptions(base))).toEqual({ authenticated: true });
    const anon: AuthProvider = { ...base, checkAuth: async () => Promise.reject(new Error("no")) };
    expect(await client.fetchQuery(authStateQueryOptions(anon))).toEqual({ authenticated: false });
  });
});
```

- [ ] **Step 2: Run to verify failure**

- [ ] **Step 3: Implement `packages/core/src/auth/auth-options.ts`**

```ts
import type { AuthProvider, CanAccessParams, UserIdentity } from "./types";

/** Plain option objects, same convention as the data factories (P2). */
export function identityQueryOptions(authProvider: AuthProvider) {
  return {
    queryKey: ["auth", "getIdentity"] as const,
    queryFn: async (): Promise<UserIdentity> => {
      if (!authProvider.getIdentity) {
        throw new Error("identityQueryOptions: the authProvider does not implement getIdentity.");
      }
      return authProvider.getIdentity();
    },
  };
}

export function canAccessQueryOptions(authProvider: AuthProvider, params: CanAccessParams) {
  return {
    queryKey: ["auth", "canAccess", params] as const,
    // No canAccess on the provider = access control not configured = allow.
    queryFn: async (): Promise<boolean> => authProvider.canAccess?.(params) ?? true,
  };
}

export function authStateQueryOptions(authProvider: AuthProvider) {
  return {
    queryKey: ["auth", "checkAuth"] as const,
    queryFn: async (): Promise<{ authenticated: boolean }> => {
      try {
        await authProvider.checkAuth();
        return { authenticated: true };
      } catch {
        return { authenticated: false };
      }
    },
  };
}
```

- [ ] **Step 4: Run to verify pass; format; commit**

```bash
cd chelone && pnpm --filter @chelone/core test && pnpm exec biome check --write packages/core/src/auth && pnpm lint
git add packages/core/src/auth && git commit -m "feat(core): auth query-option factories (identity, canAccess, authState)"
```

---

## Task 7: React adapter — store/i18n/auth hooks + provider extension

**Files:**
- Modify: `packages/react/src/context.tsx` (extend provider), `packages/react/src/index.ts` (Task 8 finishes barrels)
- Create: `packages/react/src/store-hooks.ts`, `packages/react/src/i18n-hooks.ts`, `packages/react/src/auth-hooks.ts`
- Test: `packages/react/src/p3-hooks.test.tsx`

**Interfaces:**
- Consumes: `ChelonStore`/`createStore`/`memoryStoreAdapter`, `ChelonI18n`/`createI18n`, `AuthProvider` + auth factories — **add any not-yet-barreled core exports to `packages/core/src/index.ts` as you need them** (Task 8 completes the rest; note additions in your report).
- Produces:
  - `CheloneProvider` gains optional `store?: ChelonStore`, `i18n?: ChelonI18n<MessageCatalog>`, `authProvider?: AuthProvider` (context value extended; data-only usage unchanged — all P2 tests must keep passing)
  - `useStoreItem<T>(key: string, defaultValue?: T): [T | undefined, (value: T) => void]` — `useSyncExternalStore` on `store.subscribe(key, cb)` / `store.getItem(key)`; server snapshot returns `defaultValue`; throws clearly without a store
  - `useTranslate()` → the i18n `translate` (identity-stable per locale change via subscription); `useLocale(): string`; `useSetLocale(): (locale: string) => void` — all throw clearly without i18n
  - `useGetIdentity()` = `useQuery(identityQueryOptions)`; `useCanAccess(params)` = `useQuery(canAccessQueryOptions)`; `useLogin()` / `useLogout()` = `useMutation` wrapping provider login/logout — all throw clearly without an authProvider

- [ ] **Step 1: Write failing tests**

`packages/react/src/p3-hooks.test.tsx`:

```tsx
import {
  createI18n,
  createStore,
  defineMessages,
  fakeDataProvider,
  type AuthProvider,
} from "@chelone/core";
import { QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { defineResources } from "@chelone/core";
import { CheloneProvider } from "./context";
import { useCanAccess, useGetIdentity } from "./auth-hooks";
import { useLocale, useSetLocale, useTranslate } from "./i18n-hooks";
import { useStoreItem } from "./store-hooks";

const resources = defineResources({ posts: { schema: z.object({ id: z.number() }) } });

function makeWrapper(extra: { authProvider?: AuthProvider } = {}) {
  const store = createStore();
  const i18n = createI18n({
    locale: "en",
    messages: {
      en: defineMessages({ "chelone.action.save": "Save" }),
      fr: defineMessages({ "chelone.action.save": "Enregistrer" }),
    },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <CheloneProvider
      dataProvider={fakeDataProvider<typeof resources>({ posts: [] })}
      queryClient={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      store={store}
      i18n={i18n}
      authProvider={extra.authProvider}
    >
      {children}
    </CheloneProvider>
  );
  return { wrapper, store, i18n };
}

describe("P3 react hooks", () => {
  it("useStoreItem reads, writes, and re-renders only on its key", () => {
    const { wrapper, store } = makeWrapper();
    const { result } = renderHook(() => useStoreItem<boolean>("sidebar.open", true), { wrapper });
    expect(result.current[0]).toBe(true); // default
    act(() => result.current[1](false));
    expect(result.current[0]).toBe(false);
    expect(store.getItem("sidebar.open")).toBe(false);
  });

  it("useTranslate + useSetLocale switch reactively without remount", () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(
      () => ({ t: useTranslate(), locale: useLocale(), setLocale: useSetLocale() }),
      { wrapper },
    );
    expect(result.current.t("chelone.action.save")).toBe("Save");
    act(() => result.current.setLocale("fr"));
    expect(result.current.locale).toBe("fr");
    expect(result.current.t("chelone.action.save")).toBe("Enregistrer");
  });

  it("useGetIdentity and useCanAccess resolve through the authProvider", async () => {
    const authProvider: AuthProvider = {
      login: async () => {},
      logout: async () => {},
      checkAuth: async () => {},
      checkError: async () => {},
      getIdentity: async () => ({ id: 7, fullName: "Rin" }),
      canAccess: async ({ action }) => action === "read",
    };
    const { wrapper } = makeWrapper({ authProvider });
    const { result } = renderHook(
      () => ({
        identity: useGetIdentity(),
        canRead: useCanAccess({ action: "read", resource: "posts" }),
        canEdit: useCanAccess({ action: "edit", resource: "posts" }),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.identity.data).toMatchObject({ id: 7 }));
    await waitFor(() => expect(result.current.canRead.data).toBe(true));
    await waitFor(() => expect(result.current.canEdit.data).toBe(false));
  });

  it("hooks throw clear errors when their service is not provided", () => {
    const { wrapper } = makeWrapper(); // no authProvider
    expect(() => renderHook(() => useGetIdentity(), { wrapper })).toThrow(/authProvider/);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd chelone && pnpm --filter @chelone/react test`

- [ ] **Step 3: Implement**

Extend `packages/react/src/context.tsx` — context value becomes `DataContext & { store?: ChelonStore; i18n?: ChelonI18n<MessageCatalog>; authProvider?: AuthProvider }`; add the three optional props to `CheloneProvider` and thread them through the memoized value. Add narrow accessor hooks alongside `useCheloneContext`:

```tsx
export function useChelonStore(): ChelonStore {
  const { store } = useCheloneContext() as { store?: ChelonStore };
  if (!store) throw new Error("useChelonStore: pass a store to <CheloneProvider>.");
  return store;
}
export function useChelonI18n(): ChelonI18n<MessageCatalog> {
  const { i18n } = useCheloneContext() as { i18n?: ChelonI18n<MessageCatalog> };
  if (!i18n) throw new Error("useChelonI18n: pass an i18n instance to <CheloneProvider>.");
  return i18n;
}
export function useChelonAuthProvider(): AuthProvider {
  const { authProvider } = useCheloneContext() as { authProvider?: AuthProvider };
  if (!authProvider) throw new Error("useChelonAuthProvider: pass an authProvider to <CheloneProvider>.");
  return authProvider;
}
```

(Adjust the context's internal value type properly rather than casting if straightforward — implementer's judgment; keep `DataContext` re-usable as-is for the data factories.)

`packages/react/src/store-hooks.ts`:

```ts
import { useCallback, useSyncExternalStore } from "react";
import { useChelonStore } from "./context";

export function useStoreItem<T>(key: string, defaultValue?: T): [T | undefined, (value: T) => void] {
  const store = useChelonStore();
  const value = useSyncExternalStore(
    useCallback((cb) => store.subscribe(key, cb), [store, key]),
    () => store.getItem<T>(key) ?? defaultValue,
    () => defaultValue,
  );
  const setValue = useCallback((next: T) => store.setItem(key, next), [store, key]);
  return [value, setValue];
}
```

`packages/react/src/i18n-hooks.ts`:

```ts
import { useCallback, useSyncExternalStore } from "react";
import { useChelonI18n } from "./context";

function useI18nVersion(): string {
  const i18n = useChelonI18n();
  return useSyncExternalStore(
    useCallback((cb) => i18n.subscribe(cb), [i18n]),
    () => i18n.getLocale(),
    () => i18n.getLocale(),
  );
}

export function useLocale(): string {
  return useI18nVersion();
}

export function useSetLocale(): (locale: string) => void {
  const i18n = useChelonI18n();
  return useCallback((locale: string) => i18n.setLocale(locale), [i18n]);
}

export function useTranslate() {
  const i18n = useChelonI18n();
  useI18nVersion(); // re-render this consumer on locale change — no remount anywhere
  return i18n.translate.bind(i18n);
}
```

`packages/react/src/auth-hooks.ts`:

```ts
import {
  authStateQueryOptions,
  canAccessQueryOptions,
  identityQueryOptions,
  type CanAccessParams,
} from "@chelone/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useChelonAuthProvider } from "./context";

export function useGetIdentity() {
  return useQuery(identityQueryOptions(useChelonAuthProvider()));
}
export function useCanAccess(params: CanAccessParams) {
  return useQuery(canAccessQueryOptions(useChelonAuthProvider(), params));
}
export function useAuthState() {
  return useQuery(authStateQueryOptions(useChelonAuthProvider()));
}
export function useLogin() {
  const authProvider = useChelonAuthProvider();
  return useMutation({ mutationFn: (params: Record<string, unknown>) => authProvider.login(params) });
}
export function useLogout() {
  const authProvider = useChelonAuthProvider();
  return useMutation({ mutationFn: (params?: unknown) => authProvider.logout(params) });
}
```

Add whatever core exports these need to `packages/core/src/index.ts` (e.g. `createStore`, `createI18n`, `defineMessages`, auth types/factories) — note additions in the report.

- [ ] **Step 4: Run BOTH package suites to verify pass (P2 hooks must be unaffected); format; commit**

Run: `cd chelone && pnpm test && pnpm exec biome check --write packages/react/src packages/core/src/index.ts && pnpm lint`

```bash
git add -A && git commit -m "feat(react): store/i18n/auth hooks + CheloneProvider service props"
```

---

## Task 8: Barrels + full gate

**Files:**
- Modify: `packages/core/src/index.ts`, `packages/react/src/index.ts`

- [ ] **Step 1: Complete `packages/core/src/index.ts`** — ensure ALL of these are exported (dedupe against Task 7 additions):

```ts
export { createStore } from "./store/store";
export type { ChelonStore, StoreAdapter } from "./store/store";
export { localStorageAdapter, memoryStoreAdapter } from "./store/adapters";
export { defineMessages } from "./i18n/messages";
export type {
  ExtractParams,
  MessageCatalog,
  MessageKey,
  MessageValue,
  PluralMessage,
  TranslateParams,
} from "./i18n/messages";
export { createI18n } from "./i18n/i18n";
export type { ChelonI18n } from "./i18n/i18n";
export type { AuthProvider, CanAccessParams, UserIdentity } from "./auth/types";
export { canAccessWithPermissions } from "./auth/access-control";
export type { Permission } from "./auth/access-control";
export {
  authStateQueryOptions,
  canAccessQueryOptions,
  identityQueryOptions,
} from "./auth/auth-options";
```

- [ ] **Step 2: Complete `packages/react/src/index.ts`** — add:

```ts
export { useChelonAuthProvider, useChelonI18n, useChelonStore } from "./context";
export { useStoreItem } from "./store-hooks";
export { useLocale, useSetLocale, useTranslate } from "./i18n-hooks";
export {
  useAuthState,
  useCanAccess,
  useGetIdentity,
  useLogin,
  useLogout,
} from "./auth-hooks";
```

- [ ] **Step 3: Full gate**

Run: `cd chelone && pnpm test && pnpm typecheck && pnpm lint && pnpm exec turbo run test typecheck --force`
Expected: ALL green, uncached included.

- [ ] **Step 4: Commit**

```bash
cd chelone && git add -A && git commit -m "feat: complete P3 public surfaces (store + i18n + auth barrels)"
```

---

## Self-Review

**Spec coverage (charter §7 P3 + §11 + session scope calls):**
- Own KV store, per-key notification, snapshot stability, SSR server snapshot, no import-time window → Tasks 1–2 (+ SSR-safety test in node env). ✅
- localStorage adapter + cross-tab sync, memory adapter → Task 2. ✅
- Own Intl i18n engine: typed keys, interpolation-param inference, Intl.PluralRules, reactive no-remount locale, fallback chain, never-throw missing keys → Tasks 3–4. ✅
- AuthProvider contract incl. `refreshAuth` hook point (§11 token refresh; no-flash gate documented as P6-on-checkAuth) → Task 5. ✅
- Deny-by-default matcher, wildcards, record predicates, OR semantics → Task 5. ✅
- Auth query factories on the P2 pattern → Task 6. ✅
- React hooks + provider extension, P2 compatibility preserved → Task 7. ✅
- Zero new runtime deps in core (jsdom is a devDependency for adapter tests only). ✅

**Placeholder scan:** none; all code steps complete. ✅

**Type consistency:** `StoreAdapter`/`ChelonStore` (T1) consumed by T2/T7; `MessageCatalog`/`TranslateParams`/`MessageKey` (T3) consumed by T4/T7 barrels; `AuthProvider`/`CanAccessParams` (T5) consumed by T6/T7; factory names in T6 match T7 imports and T8 barrel. ✅

**Known risks (mitigations in-plan):** plural-intersection `toEqualTypeOf` encoding (T3 note: fall back to `toMatchTypeOf` pair); `@vitest-environment jsdom` pragma + possible jsdom devDep for core (T2 note); context extension must not break P2 tests (T7 runs both suites); `getItem ?? defaultValue` snapshot stability — defaults must be primitives or stable consts (documented in `useStoreItem` usage; object literals inline would loop).
