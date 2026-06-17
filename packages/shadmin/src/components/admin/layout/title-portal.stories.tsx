import { CoreAdminContext } from "shadmin-core";
import { MemoryRouter } from "react-router";
import { ThemeProvider, Title, TitlePortal } from "@/components/admin";

export default {
  title: "UI & Layout/TitlePortal",
};

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <MemoryRouter>
    <ThemeProvider>
      <CoreAdminContext>{children}</CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);

export const Empty = () => (
  <Wrapper>
    <header className="flex h-12 shrink-0 items-center gap-2 px-4 border-b">
      <TitlePortal />
    </header>
    <main className="p-4">
      No {"<Title>"} rendered yet. The portal slot is empty.
    </main>
  </Wrapper>
);

export const WithTitle = () => (
  <Wrapper>
    <header className="flex h-12 shrink-0 items-center gap-2 px-4 border-b">
      <TitlePortal />
    </header>
    <main className="p-4">
      <Title title="Hello from a portal" />
      Page content. The header above receives the title via portal.
    </main>
  </Wrapper>
);

export const CustomClass = () => (
  <Wrapper>
    <header className="flex h-12 shrink-0 items-center gap-2 px-4 border-b bg-muted">
      <TitlePortal className="text-primary" />
    </header>
    <main className="p-4">
      <Title title="Styled title slot" />
    </main>
  </Wrapper>
);

export const Basic = Empty;
