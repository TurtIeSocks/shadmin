import { Book, Home, Settings } from "lucide-react";
import { Resource, TestMemoryRouter } from "shadmin-core";
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
  MenuItemLink,
  ShowGuesser,
} from "@/components/admin";

export default {
  title: "UI & Layout/MenuItemLink",
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

const SidebarWrapper = ({ children }: React.PropsWithChildren) => (
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
      <Resource name="posts" list={ListGuesser} show={ShowGuesser} />
    </Admin>
  </TestMemoryRouter>
);

export const Basic = () => (
  <SidebarWrapper>
    <MenuItemLink to="/posts" label="Posts" icon={<Book />} />
  </SidebarWrapper>
);

export const Multiple = () => (
  <SidebarWrapper>
    <MenuItemLink to="/" label="Home" icon={<Home />} />
    <MenuItemLink to="/posts" label="Posts" icon={<Book />} />
    <MenuItemLink
      to="/settings"
      label="Settings"
      icon={<Settings />}
    />
  </SidebarWrapper>
);

export const NoIcon = () => (
  <SidebarWrapper>
    <MenuItemLink to="/posts" label="Posts" />
  </SidebarWrapper>
);

export const WithTooltipProps = () => (
  <SidebarWrapper>
    <MenuItemLink
      to="/posts"
      label="Posts"
      icon={<Book />}
      tooltipProps={{ delayDuration: 0 }}
    />
    <MenuItemLink
      to="/settings"
      label="Settings"
      icon={<Settings />}
      tooltipProps={{ delayDuration: 500 }}
    />
  </SidebarWrapper>
);

export const WithKeyboardShortcutRepresentation = () => (
  <SidebarWrapper>
    <MenuItemLink
      to="/posts"
      label="Posts"
      icon={<Book />}
      keyboardShortcut="mod+p"
      keyboardShortcutRepresentation="⌘P"
    />
    <MenuItemLink
      to="/settings"
      label="Settings"
      icon={<Settings />}
      keyboardShortcut="mod+,"
      keyboardShortcutRepresentation="⌘,"
    />
  </SidebarWrapper>
);

export const WithKeyboardShortcut = () => (
  <SidebarWrapper>
    <MenuItemLink
      to="/posts"
      label="Posts"
      icon={<Book />}
      keyboardShortcut="mod+p"
    />
    <MenuItemLink
      to="/settings"
      label="Settings"
      icon={<Settings />}
      keyboardShortcut="mod+,"
    />
  </SidebarWrapper>
);
