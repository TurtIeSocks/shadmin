import {
  type DataProvider,
  memoryStore,
  Resource,
  TestMemoryRouter,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import fakeRestDataProvider from "ra-data-fakerest";
import { Admin, KanbanBoard } from "@/components/admin";
import { List } from "@/components/admin/list";

const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  {
    allowMissing: true,
  },
);

const COLUMNS = [
  { id: "todo", label: "To do" },
  { id: "doing", label: "In progress" },
  { id: "done", label: "Done" },
];

const data = {
  tasks: [
    {
      id: 1,
      title: "Design mockup",
      status: "done",
      description: "Figma screens for v2",
    },
    {
      id: 2,
      title: "Wire up API",
      status: "doing",
      description: "Connect to REST endpoints",
    },
    {
      id: 3,
      title: "Write tests",
      status: "todo",
      description: "Unit + integration coverage",
    },
    {
      id: 4,
      title: "Deploy preview",
      status: "doing",
      description: "Vercel preview environment",
    },
    {
      id: 5,
      title: "Review PR",
      status: "todo",
      description: "Code review for feature branch",
    },
  ],
};

const dataProvider = fakeRestDataProvider(data) as DataProvider;

export default {
  title: "Extras/KanbanBoard",
  parameters: { docs: { codePanel: true } },
};

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/tasks"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="tasks"
        list={() => (
          <List perPage={500}>
            <KanbanBoard
              groupBy="status"
              columns={COLUMNS}
              titleSource="title"
            />
          </List>
        )}
        recordRepresentation="title"
      />
    </Admin>
  </TestMemoryRouter>
);

export const WithDescription = () => (
  <TestMemoryRouter initialEntries={["/tasks"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="tasks"
        list={() => (
          <List perPage={500}>
            <KanbanBoard
              groupBy="status"
              columns={COLUMNS}
              titleSource="title"
              descriptionSource="description"
            />
          </List>
        )}
        recordRepresentation="title"
      />
    </Admin>
  </TestMemoryRouter>
);
