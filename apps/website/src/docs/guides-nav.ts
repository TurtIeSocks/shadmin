// Docs sidebar navigation, derived from the registry manifest (one source of
// truth, shared with the catalog) plus a small curated overlay for the ~48 doc
// pages that have no registry item: pure-prose guides (their own "Guides"
// group) and per-feature sub-pages slotted into their dir group (realtime
// hooks, monaco/mdx sub-components, etc.).
import { manifest } from "./manifest";

export interface DocsNavItem {
  slug: string;
  label: string;
}
export interface DocsNavGroup {
  label: string;
  items: DocsNavItem[];
}

// Pure concept/setup guides — no component, shown as a top "Guides" group.
const guidesGroup: DocsNavItem[] = [
  { slug: "install", label: "Installation" },
  { slug: "quick-start-guide", label: "Quick Start" },
  { slug: "guides-and-concepts", label: "Guides and Concepts" },
  { slug: "data-display", label: "Data Display" },
  { slug: "data-edition", label: "Data Edition" },
  { slug: "data-providers", label: "Data Fetching & Providers" },
  { slug: "security", label: "Security & Auth" },
  { slug: "translation", label: "i18n" },
  { slug: "themes", label: "Themes" },
  { slug: "custom-routes", label: "Custom Routes" },
  {
    slug: "migrating-from-ra-ui-materialui",
    label: "Migrating from ra-ui-materialui",
  },
  { slug: "mcp", label: "MCP Server" },
  { slug: "changelog", label: "Changelog" },
];

// Extra doc pages (no registry item) appended to their dir's manifest group.
const categoryExtras: Record<string, DocsNavItem[]> = {
  realtime: [
    { slug: "realtime-data-provider", label: "realtimeDataProvider" },
    { slug: "add-events-for-mutations", label: "addEventsForMutations" },
    { slug: "websocket-transport", label: "webSocketTransport" },
    { slug: "sse-transport", label: "sseTransport" },
    { slug: "broadcast-channel-transport", label: "broadcastChannelTransport" },
    { slug: "fake-transport", label: "fakeTransport" },
    { slug: "in-memory-lock-provider", label: "inMemoryLockProvider" },
    { slug: "use-subscribe", label: "useSubscribe" },
    { slug: "use-subscribe-callback", label: "useSubscribeCallback" },
    { slug: "use-subscribe-to-record", label: "useSubscribeToRecord" },
    { slug: "use-subscribe-to-record-list", label: "useSubscribeToRecordList" },
    { slug: "use-publish", label: "usePublish" },
    { slug: "use-realtime-status", label: "useRealtimeStatus" },
    { slug: "use-on-reconnect", label: "useOnReconnect" },
    { slug: "use-get-list-live", label: "useGetListLive" },
    { slug: "use-get-one-live", label: "useGetOneLive" },
    { slug: "use-get-many-live", label: "useGetManyLive" },
    { slug: "use-lock", label: "useLock" },
    { slug: "use-unlock", label: "useUnlock" },
    { slug: "use-lock-on-mount", label: "useLockOnMount" },
    { slug: "use-get-lock", label: "useGetLock" },
    { slug: "use-get-lock-live", label: "useGetLockLive" },
    { slug: "use-get-locks", label: "useGetLocks" },
    { slug: "use-get-locks-live", label: "useGetLocksLive" },
  ],
  monaco: [
    { slug: "monaco-json-field", label: "MonacoJsonField" },
    { slug: "monaco-json-input", label: "MonacoJsonInput" },
    { slug: "json-field", label: "JsonField" },
  ],
  "mdx-editor": [
    { slug: "mdx-field", label: "MdxField" },
    { slug: "mdx-input", label: "MdxInput" },
  ],
  "block-editor": [{ slug: "custom-blocks", label: "Custom Blocks" }],
  leaflet: [{ slug: "leaflet-osm", label: "Leaflet OSM utilities" }],
  supabase: [
    { slug: "supabase-getting-started", label: "Getting Started" },
    { slug: "supabase-i18n", label: "i18n" },
  ],
  feedback: [
    { slug: "loading-page", label: "LoadingPage" },
    { slug: "reference-error", label: "ReferenceError" },
  ],
};

export const docsNav: DocsNavGroup[] = [
  { label: "Guides", items: guidesGroup },
  ...manifest.nav.map((group) => ({
    label: group.label,
    items: [
      ...group.items.map((item) => ({ slug: item.name, label: item.title })),
      ...(categoryExtras[group.category] ?? []),
    ],
  })),
];
