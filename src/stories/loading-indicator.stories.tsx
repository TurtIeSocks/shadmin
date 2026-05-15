import { CoreAdminContext, memoryStore } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { QueryClient } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { LoadingIndicator, ThemeProvider } from "@/components/admin";

export default {
  title: "Layout/LoadingIndicator",
};

const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  {
    allowMissing: true,
  },
);

const buildQueryClient = (loading: boolean) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  if (loading) {
    // Register a never-resolving fetch so useLoading returns true.
    client.fetchQuery({
      queryKey: ["loading-indicator-story"],
      queryFn: () => new Promise(() => {}),
    });
  }
  return client;
};

const Wrapper = ({
  loading,
  children,
}: React.PropsWithChildren<{ loading: boolean }>) => (
  <MemoryRouter>
    <ThemeProvider>
      <CoreAdminContext
        i18nProvider={i18nProvider}
        store={memoryStore()}
        queryClient={buildQueryClient(loading)}
      >
        {children}
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);

export const Loading = () => (
  <Wrapper loading>
    <LoadingIndicator />
  </Wrapper>
);

export const Idle = () => (
  <Wrapper loading={false}>
    <div className="flex items-center gap-2">
      <span>Idle (nothing rendered):</span>
      <LoadingIndicator />
    </div>
  </Wrapper>
);
