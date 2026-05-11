import { Book, MessageCircle } from "lucide-react";
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
  ListGuesser,
  ResourceMenuItem,
  ShowGuesser,
} from "@/components/admin";

export default {
  title: "Layout/ResourceMenuItem",
};

const data = {
  posts: [{ id: 1, title: "War and Peace" }],
  comments: [{ id: 1, body: "Great book!" }],
};
const dataProvider = fakeRestDataProvider(data);
const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  { allowMissing: true },
);

const Wrapper = ({ children }: { children?: React.ReactNode }) => (
  <TestMemoryRouter initialEntries={["/posts"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
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
      <Resource name="posts" icon={Book} list={ListGuesser} show={ShowGuesser} />
      <Resource
        name="comments"
        icon={MessageCircle}
        list={ListGuesser}
        show={ShowGuesser}
      />
    </Admin>
  </TestMemoryRouter>
);

export const Basic = () => (
  <Wrapper>
    <ResourceMenuItem name="posts" />
  </Wrapper>
);

export const Multiple = () => (
  <Wrapper>
    <ResourceMenuItem name="posts" />
    <ResourceMenuItem name="comments" />
  </Wrapper>
);

export const UnknownResource = () => (
  <Wrapper>
    <ResourceMenuItem name="non-existent" />
  </Wrapper>
);
