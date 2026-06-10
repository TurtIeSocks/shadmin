import { Book, MessageCircle } from "lucide-react";
import { TestMemoryRouter } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import fakeRestDataProvider from "ra-data-fakerest";
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Admin,
  ListGuesser,
  Resource,
  ResourceMenuItemGroup,
  ShowGuesser,
} from "@/components/admin";

export default {
  title: "UI & Layout/ResourceMenuItemGroup",
};

const data = {
  posts: [{ id: 1, title: "Hello world" }],
  comments: [{ id: 1, body: "Great book!" }],
};
const dataProvider = fakeRestDataProvider(data);
const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  { allowMissing: true },
);

const renderInSidebar = (group: React.ReactElement) => (
  <SidebarProvider>
    <Sidebar variant="floating">
      <SidebarContent>{group}</SidebarContent>
    </Sidebar>
    <main className="flex-1 p-4">Main area</main>
  </SidebarProvider>
);

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      layout={() =>
        renderInSidebar(
          <ResourceMenuItemGroup
            label="Content"
            resources={["posts", "comments"]}
          />,
        )
      }
    >
      <Resource
        name="posts"
        icon={Book}
        list={ListGuesser}
        show={ShowGuesser}
      />
      <Resource
        name="comments"
        icon={MessageCircle}
        list={ListGuesser}
        show={ShowGuesser}
      />
    </Admin>
  </TestMemoryRouter>
);
