import { CoreAdminContext, RecordContextProvider } from "ra-core";

import { SimpleForm, ThemeProvider } from "shadcn-admin-kit/components/admin";
import { RichTextInput } from "shadcn-admin-kit/components/rich-text-input";
import { i18nProvider } from "shadcn-admin-kit/lib/i18n-provider";

const record = {
  id: 1,
  body: "<p>Smoke test content</p>",
};

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <CoreAdminContext i18nProvider={i18nProvider}>
        <RecordContextProvider value={record}>
          <main className="mx-auto max-w-3xl p-6">
            <SimpleForm defaultValues={record} toolbar={null}>
              <RichTextInput source="body" />
            </SimpleForm>
          </main>
        </RecordContextProvider>
      </CoreAdminContext>
    </ThemeProvider>
  );
}

export default App;
