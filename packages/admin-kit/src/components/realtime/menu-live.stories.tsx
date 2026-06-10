import { MemoryRouter } from "react-router";
import { CoreAdminContext, memoryStore } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import { ThemeProvider } from "@/components/admin";
import { realtimeDataProvider } from "@/components/realtime/realtime-data-provider";
import fakeRestProvider from "ra-data-fakerest";
import { MenuLiveItemLink } from "@/components/realtime/menu-live";
import { menuTransport } from "./__fixtures__/menu-live-fixtures";

const dataProvider = realtimeDataProvider(fakeRestProvider({}, false), menuTransport);
const i18nProvider = polyglotI18nProvider(() => englishMessages);

export default { title: "realtime/MenuLive" };

export const Basic = () => (
  <ThemeProvider>
    <MemoryRouter initialEntries={["/other"]}>
      <CoreAdminContext dataProvider={dataProvider} i18nProvider={i18nProvider} store={memoryStore()}>
        <MenuLiveItemLink to="/posts" resource="posts" primaryText="Posts" />
      </CoreAdminContext>
    </MemoryRouter>
  </ThemeProvider>
);
