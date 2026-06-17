import { useEffect } from "react";
import {
  type DataProvider,
  memoryStore,
  RecordContextProvider,
  Resource,
  TestMemoryRouter,
} from "shadmin-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import fakeRestDataProvider from "ra-data-fakerest";
import { Admin } from "@/components/admin";
import {
  PresenceBar,
  type PresenceTransport,
  type PresenceState,
} from "@/components/extras";

const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  {
    allowMissing: true,
  },
);

// In-memory transport for tests/storybook — bypasses BroadcastChannel
class InMemoryTransport {
  private channels: Record<string, Array<(s: PresenceState) => void>> = {};
  subscribe = (topic: string, handler: (s: PresenceState) => void) => {
    (this.channels[topic] ??= []).push(handler);
    return () => {
      this.channels[topic] = (this.channels[topic] ?? []).filter(
        (h) => h !== handler,
      );
    };
  };
  publish = (topic: string, state: PresenceState) => {
    for (const h of this.channels[topic] ?? []) h(state);
  };
}

const transport: PresenceTransport = new InMemoryTransport();

const SeedOtherUsers = ({ topic }: { topic: string }) => {
  useEffect(() => {
    transport.publish(topic, {
      user: { id: "bob", name: "Bob", avatar: undefined },
      timestamp: Date.now(),
    });
    transport.publish(topic, {
      user: { id: "carol", name: "Carol Diaz", avatar: undefined },
      timestamp: Date.now(),
    });
  }, [topic]);
  return null;
};

export default {
  title: "Extras/PresenceBar",
  parameters: { docs: { codePanel: true } },
};

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/products/1/show"]}>
    <Admin
      dataProvider={
        fakeRestDataProvider({ products: [{ id: 1 }] }) as DataProvider
      }
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="products"
        show={() => (
          <RecordContextProvider value={{ id: 1 }}>
            <div className="flex items-center gap-4 p-4">
              <PresenceBar
                topic="presence/products/1"
                currentUser={{ id: "alice", name: "Alice" }}
                transport={transport}
              />
              <SeedOtherUsers topic="presence/products/1" />
            </div>
          </RecordContextProvider>
        )}
      />
    </Admin>
  </TestMemoryRouter>
);
