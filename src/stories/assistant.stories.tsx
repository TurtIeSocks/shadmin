import { type AssistantTransport, Admin, Assistant, echoTransport } from "@/components/admin";
import {
  type DataProvider,
  memoryStore,
  Resource,
  TestMemoryRouter,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import fakeRestDataProvider from "ra-data-fakerest";

const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  { allowMissing: true },
);

export default {
  title: "Display/Assistant",
  parameters: { docs: { codePanel: true } },
};

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/"]}>
    <Admin
      dataProvider={fakeRestDataProvider({}) as DataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="dummy"
        list={() => (
          <div className="p-4">
            <Assistant transport={echoTransport} />
          </div>
        )}
      />
    </Admin>
  </TestMemoryRouter>
);

const mockToolTransport: AssistantTransport = {
  send: async function* (_messages) {
    const ack = "Sure — calling setFilter with status=open…";
    for (const ch of ack) {
      yield { type: "text", delta: ch };
      await new Promise((r) => setTimeout(r, 5));
    }
    yield { type: "tool-call", toolName: "setFilter", args: { status: "open" } };
    yield { type: "done" };
  },
};

export const WithTools = () => (
  <TestMemoryRouter initialEntries={["/"]}>
    <Admin
      dataProvider={fakeRestDataProvider({}) as DataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="dummy"
        list={() => (
          <div className="p-4">
            <Assistant
              transport={mockToolTransport}
              tools={{
                setFilter: {
                  description: "Apply a filter on the current list",
                  parameters: { status: "string" },
                  handler: ({ status }) => {
                    return { applied: status };
                  },
                },
              }}
            />
          </div>
        )}
      />
    </Admin>
  </TestMemoryRouter>
);
