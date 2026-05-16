import React from "react";
import { CoreAdminContext, AuthProvider, memoryStore } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { Power } from "lucide-react";

import { Logout } from "@/components/admin/logout";
import { ThemeProvider } from "@/components/admin/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default {
  title: "UI & Layout/Logout",
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
    Promise.resolve({ id: 1, fullName: "Jane Doe", avatar: undefined }),
};

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <MemoryRouter>
    <ThemeProvider>
      <CoreAdminContext
        authProvider={authProvider}
        i18nProvider={polyglotI18nProvider(() => defaultMessages, "en", undefined, {
          allowMissing: true,
        })}
        store={memoryStore()}
      >
        <div className="p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Open menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>{children}</DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);

export const Basic = () => (
  <Wrapper>
    <Logout />
  </Wrapper>
);

export const CustomIcon = () => (
  <Wrapper>
    <Logout icon={<Power />} />
  </Wrapper>
);

export const WithRedirect = () => (
  <Wrapper>
    <Logout redirectTo="/login" />
  </Wrapper>
);
