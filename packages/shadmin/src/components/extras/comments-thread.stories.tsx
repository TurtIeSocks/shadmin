import {
  CoreAdminContext,
  RecordContextProvider,
  TestMemoryRouter,
  memoryStore,
} from "shadmin-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import fakeRestProvider from "ra-data-fakerest";
import { ThemeProvider } from "@/components/admin";
import { CommentsThread } from "@/components/extras";

const i18nProvider = polyglotI18nProvider(() => englishMessages);

const records = {
  posts: [{ id: 1, title: "My post" }],
  comments: [
    {
      id: 1,
      parentId: 1,
      authorId: "alice",
      authorName: "Alice",
      body: "Looks good to me.",
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: 2,
      parentId: 1,
      authorId: "bob",
      authorName: "Bob",
      body: "Let's also bump the version.",
      createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    },
    {
      id: 3,
      parentId: 99,
      authorId: "carol",
      authorName: "Carol",
      body: "Unrelated comment",
      createdAt: new Date().toISOString(),
    },
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
        <RecordContextProvider value={{ id: 1, title: "My post" }}>
          {children}
        </RecordContextProvider>
      </CoreAdminContext>
    </TestMemoryRouter>
  </ThemeProvider>
);

export default { title: "Extras/CommentsThread" };

export const Basic = () => (
  <Wrapper>
    <CommentsThread reference="comments" target="parentId" />
  </Wrapper>
);

export const Resolvable = () => (
  <Wrapper>
    <CommentsThread reference="comments" target="parentId" resolvable />
  </Wrapper>
);

export const Empty = () => (
  <ThemeProvider>
    <TestMemoryRouter>
      <CoreAdminContext
        dataProvider={fakeRestProvider({ comments: [] }, false)}
        i18nProvider={i18nProvider}
        store={memoryStore()}
      >
        <RecordContextProvider value={{ id: 42, title: "Lonely post" }}>
          <CommentsThread reference="comments" target="parentId" />
        </RecordContextProvider>
      </CoreAdminContext>
    </TestMemoryRouter>
  </ThemeProvider>
);
