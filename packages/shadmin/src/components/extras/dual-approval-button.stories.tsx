import type React from "react";
import {
  type AuthProvider,
  CoreAdminContext,
  RecordContextProvider,
  ResourceContextProvider,
  TestMemoryRouter,
  memoryStore,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import fakeRestDataProvider from "ra-data-fakerest";
import { ThemeProvider } from "@/components/admin";
import { DualApprovalButton } from "@/components/extras";

const i18nProvider = polyglotI18nProvider(() => englishMessages);

const baseRecords = {
  expenses: [{ id: 1, title: "Travel", status: "pending", approvers: [] }],
};

const authProvider = (currentUserId: string): AuthProvider => ({
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
  checkError: async () => {},
  getPermissions: async () => [],
  getIdentity: async () => ({ id: currentUserId, fullName: currentUserId }),
});

const Wrapper = ({
  children,
  approvers = [],
  currentUserId = "alice",
}: {
  children: React.ReactNode;
  approvers?: string[];
  currentUserId?: string;
}) => (
  <ThemeProvider>
    <TestMemoryRouter>
      <CoreAdminContext
        dataProvider={fakeRestDataProvider(baseRecords, false)}
        authProvider={authProvider(currentUserId)}
        i18nProvider={i18nProvider}
        store={memoryStore()}
      >
        <ResourceContextProvider value="expenses">
          <RecordContextProvider
            value={{ id: 1, title: "Travel", status: "pending", approvers }}
          >
            <div className="p-4">{children}</div>
          </RecordContextProvider>
        </ResourceContextProvider>
      </CoreAdminContext>
    </TestMemoryRouter>
  </ThemeProvider>
);

export default { title: "Extras/DualApprovalButton" };

export const Basic = () => (
  <Wrapper>
    <DualApprovalButton required={2} />
  </Wrapper>
);

export const FirstApproverPending = () => (
  <Wrapper approvers={["bob"]} currentUserId="alice">
    <DualApprovalButton required={2} />
  </Wrapper>
);

export const SelfApprovalBlocked = () => (
  <Wrapper approvers={["alice"]} currentUserId="alice">
    <DualApprovalButton required={2} />
  </Wrapper>
);

export const ThresholdReached = () => (
  <Wrapper approvers={["alice", "bob"]} currentUserId="carol">
    <DualApprovalButton required={2} />
  </Wrapper>
);
