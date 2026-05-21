import type { DataProvider } from "ra-core";

type Record = { id: number | string; [key: string]: unknown };
type Store = { [resource: string]: Record[] };

/**
 * Demo-only data provider that persists state in localStorage so that
 * multiple browser tabs share a single source of truth. Pairs with the
 * realtime transport: mutations broadcast events, peer tabs invalidate
 * and refetch — and the refetch hits the same localStorage snapshot the
 * mutating tab just wrote.
 */
export function localStorageDataProvider(
  seed: Store,
  storageKey = "shadcn-admin-realtime-demo-data"
): DataProvider {
  function read(): Store {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        return JSON.parse(raw) as Store;
      } catch {
        // fall through to seed
      }
    }
    const initial = structuredClone(seed);
    localStorage.setItem(storageKey, JSON.stringify(initial));
    return initial;
  }

  function write(store: Store): void {
    localStorage.setItem(storageKey, JSON.stringify(store));
  }

  function collection(store: Store, resource: string): Record[] {
    if (!store[resource]) store[resource] = [];
    return store[resource];
  }

  function idEq(a: unknown, b: unknown): boolean {
    return String(a) === String(b);
  }

  function nextId(records: Record[]): number {
    const maxId = records.reduce<number>((max, r) => {
      const n = typeof r.id === "number" ? r.id : Number(r.id);
      return Number.isFinite(n) && n > max ? n : max;
    }, 0);
    return maxId + 1;
  }

  function matchesFilter(record: Record, filter: Record): boolean {
    return Object.entries(filter).every(([key, value]) => {
      if (key === "q" && typeof value === "string") {
        return JSON.stringify(record).toLowerCase().includes(value.toLowerCase());
      }
      return record[key] === value;
    });
  }

  return {
    async getList(resource, params) {
      const store = read();
      const all = collection(store, resource);
      const filtered = params.filter
        ? all.filter((r) => matchesFilter(r, params.filter as Record))
        : all;
      const sorted = [...filtered];
      if (params.sort?.field) {
        const { field, order } = params.sort;
        sorted.sort((a, b) => {
          const av = a[field];
          const bv = b[field];
          if (av === bv) return 0;
          const cmp = (av as number | string) < (bv as number | string) ? -1 : 1;
          return order === "DESC" ? -cmp : cmp;
        });
      }
      const { page = 1, perPage = 10 } = params.pagination ?? {};
      const start = (page - 1) * perPage;
      const end = start + perPage;
      return { data: sorted.slice(start, end) as never, total: sorted.length };
    },

    async getOne(resource, params) {
      const store = read();
      const record = collection(store, resource).find((r) => idEq(r.id, params.id));
      if (!record) throw new Error(`Record ${resource}#${params.id} not found`);
      return { data: record as never };
    },

    async getMany(resource, params) {
      const store = read();
      const all = collection(store, resource);
      const data = params.ids
        .map((id) => all.find((r) => idEq(r.id, id)))
        .filter((r): r is Record => Boolean(r));
      return { data: data as never };
    },

    async getManyReference(resource, params) {
      const store = read();
      const all = collection(store, resource);
      const filtered = all.filter((r) => idEq(r[params.target], params.id));
      const { page = 1, perPage = 10 } = params.pagination ?? {};
      const start = (page - 1) * perPage;
      return {
        data: filtered.slice(start, start + perPage) as never,
        total: filtered.length,
      };
    },

    async create(resource, params) {
      const store = read();
      const records = collection(store, resource);
      const data = params.data as Record;
      const record: Record = { ...data, id: data.id ?? nextId(records) };
      records.push(record);
      write(store);
      return { data: record as never };
    },

    async update(resource, params) {
      const store = read();
      const records = collection(store, resource);
      const idx = records.findIndex((r) => idEq(r.id, params.id));
      if (idx === -1) throw new Error(`Record ${resource}#${params.id} not found`);
      const updated = {
        ...records[idx],
        ...(params.data as Record),
        id: records[idx].id,
      };
      records[idx] = updated;
      write(store);
      return { data: updated as never };
    },

    async updateMany(resource, params) {
      const store = read();
      const records = collection(store, resource);
      const patch = params.data as Record;
      params.ids.forEach((id) => {
        const idx = records.findIndex((r) => idEq(r.id, id));
        if (idx !== -1) records[idx] = { ...records[idx], ...patch, id: records[idx].id };
      });
      write(store);
      return { data: params.ids as never };
    },

    async delete(resource, params) {
      const store = read();
      const records = collection(store, resource);
      const idx = records.findIndex((r) => idEq(r.id, params.id));
      const removed = idx !== -1 ? records.splice(idx, 1)[0] : undefined;
      write(store);
      return { data: (removed ?? { id: params.id }) as never };
    },

    async deleteMany(resource, params) {
      const store = read();
      const records = collection(store, resource);
      const remaining = records.filter(
        (r) => !params.ids.some((id) => idEq(r.id, id))
      );
      store[resource] = remaining;
      write(store);
      return { data: params.ids as never };
    },
  };
}
