import React from "react";
import { CoreAdminContext, AuthProvider, memoryStore } from "shadmin-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { Settings, User } from "lucide-react";

import { UserMenu } from "@/components/admin/user-menu";
import { ThemeProvider } from "@/components/admin/theme-provider";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export default {
  title: "UI & Layout/UserMenu",
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

const authProvider: AuthProvider = {
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  checkError: () => Promise.resolve(),
  checkAuth: () => Promise.resolve(),
  getPermissions: () => Promise.resolve(undefined),
  getIdentity: () =>
    Promise.resolve({
      id: 1,
      fullName: "Jane Doe",
      avatar: undefined,
    }),
};

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <MemoryRouter>
    <ThemeProvider>
      <CoreAdminContext
        authProvider={authProvider}
        i18nProvider={polyglotI18nProvider(
          () => defaultMessages,
          "en",
          undefined,
          {
            allowMissing: true,
          },
        )}
        store={memoryStore()}
      >
        <div className="p-8 flex justify-end">{children}</div>
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);

export const Basic = () => (
  <Wrapper>
    <UserMenu />
  </Wrapper>
);

export const WithCustomItems = () => (
  <Wrapper>
    <UserMenu>
      <DropdownMenuItem>
        <User />
        Profile
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Settings />
        Settings
      </DropdownMenuItem>
    </UserMenu>
  </Wrapper>
);
