import {
  PreferencesEditorContextProvider,
  PreferenceKeyContextProvider,
} from "shadmin-core";
import { FieldsSelector } from "shadmin/components/admin";

const PREF_KEY = "preferences.gallery.orders.list";

// Seed columns into the CoreAdminContext store via an initializer component
import { useStore } from "shadmin-core";
import { useEffect } from "react";

const availableColumns = [
  { index: "0", source: "reference", label: "Reference" },
  { index: "1", source: "status", label: "Status" },
  { index: "2", source: "total_ex_taxes", label: "Total" },
  { index: "3", source: "nb_items", label: "Items" },
];

function SeedAndRender() {
  const [, setAvailable] = useStore<typeof availableColumns>(
    `${PREF_KEY}.availableColumns`,
    availableColumns,
  );
  const [, setColumns] = useStore<string[]>(`${PREF_KEY}.columns`, [
    "0",
    "1",
    "2",
  ]);

  useEffect(() => {
    setAvailable(availableColumns);
    setColumns(["0", "1", "2"]);
  }, [setAvailable, setColumns]);

  return (
    <div className="max-w-xs rounded-md border bg-popover p-3 shadow-sm">
      <FieldsSelector />
    </div>
  );
}

export default function FieldsSelectorExample() {
  return (
    <PreferencesEditorContextProvider>
      <PreferenceKeyContextProvider value={PREF_KEY}>
        <SeedAndRender />
      </PreferenceKeyContextProvider>
    </PreferencesEditorContextProvider>
  );
}
