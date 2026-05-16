import { CoreAdminContext, ListBase, TestMemoryRouter, memoryStore } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import fakeRestProvider from "ra-data-fakerest";
import { ApprovalQueue, ThemeProvider } from "@/components/admin";

const i18nProvider = polyglotI18nProvider(() => englishMessages);

const records = {
  expenses: [
    { id: 1, title: "Conference travel", amount: 1200, status: "pending", requester: "alice" },
    { id: 2, title: "Software license", amount: 450, status: "pending", requester: "bob" },
    { id: 3, title: "Office supplies", amount: 89, status: "approved", requester: "carol" },
  ],
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <TestMemoryRouter>
      <CoreAdminContext
        dataProvider={fakeRestProvider(records, false)}
        i18nProvider={i18nProvider}
        store={memoryStore()}
      >
        <ListBase resource="expenses" filter={{ status: "pending" }}>
          {children}
        </ListBase>
      </CoreAdminContext>
    </TestMemoryRouter>
  </ThemeProvider>
);

export default { title: "Extras/ApprovalQueue" };

export const Basic = () => (
  <Wrapper>
    <ApprovalQueue titleSource="title" />
  </Wrapper>
);

export const RequireReason = () => (
  <Wrapper>
    <ApprovalQueue titleSource="title" requireReason />
  </Wrapper>
);
