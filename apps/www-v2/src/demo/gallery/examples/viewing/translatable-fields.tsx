import { RecordContextProvider, ResourceContextProvider } from "shadmin-core";
import { TranslatableFields, TextField } from "shadmin/components/admin";

export default function TranslatableFieldsExample() {
  return (
    <ResourceContextProvider value="products">
      <RecordContextProvider
        value={{
          id: 1,
          name: {
            en: "Widget Pro",
            fr: "Widget Pro (FR)",
            es: "Widget Pro (ES)",
          },
          description: {
            en: "A professional widget",
            fr: "Un widget professionnel",
            es: "Un widget profesional",
          },
        }}
      >
        <TranslatableFields locales={["en", "fr", "es"]} defaultLocale="en">
          <TextField source="name" />
          <TextField source="description" />
        </TranslatableFields>
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
