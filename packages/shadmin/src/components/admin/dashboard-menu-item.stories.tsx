import { Resource, TestMemoryRouter } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import fakeRestDataProvider from "ra-data-fakerest";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import {
  Admin,
  DashboardMenuItem,
  ListGuesser,
  ShowGuesser,
} from "@/components/admin";

export default {
  title: "UI & Layout/DashboardMenuItem",
};

const data = {
  posts: [{ id: 1, title: "Hello world" }],
};
const dataProvider = fakeRestDataProvider(data);
const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  { allowMissing: true },
);

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      dashboard={() => <div>Dashboard view</div>}
      layout={({ children: layoutChildren }) => (
        <SidebarProvider>
          <Sidebar variant="floating">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>{children}</SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex-1 p-4">{layoutChildren}</main>
        </SidebarProvider>
      )}
    >
      <Resource name="posts" list={ListGuesser} show={ShowGuesser} />
    </Admin>
  </TestMemoryRouter>
);

export const Basic = () => (
  <Wrapper>
    <DashboardMenuItem />
  </Wrapper>
);
