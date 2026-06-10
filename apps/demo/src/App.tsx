import { Field, FieldLabel } from "shadcn-admin-kit/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "shadcn-admin-kit/components/ui/select";
import { lazy } from "react";

const demos = {
  default: {
    label: "Default (CRM)",
    load: () => import("./App.crm"),
  },
  guessers: {
    label: "Guessers",
    load: () => import("./App.guessers"),
  },
  realtime: {
    label: "Realtime",
    load: () => import("./App.realtime"),
  },
  "rich-text": {
    label: "Rich Text Input",
    load: () => import("./App.rich-text-input"),
  },
  supabase: {
    label: "Supabase (needs .env)",
    load: () => import("./App.supabase"),
  },
} as const;

type DemoKey = keyof typeof demos;

function getCurrentDemo(): DemoKey {
  const param = new URLSearchParams(window.location.search).get("demo");
  return param && param in demos ? (param as DemoKey) : "default";
}

const current = getCurrentDemo();
const SelectedApp = lazy(demos[current].load);

function DemoSwitcher() {
  const handleChange = (event: string) => {
    const url = new URL(window.location.href);
    if (event === "default") {
      url.searchParams.delete("demo");
    } else {
      url.searchParams.set("demo", event);
    }
    url.hash = "";
    window.location.href = url.toString();
  };

  return (
    <Field className="fixed bottom-3 right-3 w-min p-4 bg-accent/75 rounded-2xl shadow-2xl">
      <FieldLabel htmlFor="demo-switcher">Select Demo</FieldLabel>
      <Select value={current} onValueChange={handleChange}>
        <SelectTrigger id="demo-switcher" className="h-8 w-fit">
          <SelectValue placeholder={current} />
        </SelectTrigger>
        <SelectContent side="top">
          {Object.keys(demos).map((u) => (
            <SelectItem key={u} value={u}>
              {u}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

function App() {
  return (
    <>
      <SelectedApp />
      <DemoSwitcher />
    </>
  );
}

export default App;
