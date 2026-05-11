import React from "react";
import {
  CoreAdminContext,
  PreferencesEditorContextProvider,
  memoryStore,
  useTranslate,
  useSetInspectorTitle,
  usePreference,
} from "ra-core";
import { i18nProvider } from "@/lib/i18nProvider.ts";
import {
  Configurable,
  Inspector,
  InspectorButton,
  ThemeProvider,
} from "@/components/admin";

export default {
  title: "Inspector/Inspector",
};

/**
 * The editor body used inside the Inspector when the user clicks the cogwheel
 * on the sample TextBlock. It reads and writes a "content" preference scoped
 * to the configurable's key via `usePreference`.
 */
const TextBlockEditor = () => {
  useSetInspectorTitle("ra.inspector.textBlock", { _: "Text block" });
  const translate = useTranslate();
  const [content = "Edit me from the inspector", setContent] =
    usePreference<string>("content", "Edit me from the inspector");

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs uppercase tracking-wide text-muted-foreground">
        {translate("ra.inspector.textBlock.content", { _: "Content" })}
      </label>
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={4}
        className="rounded-md border bg-background px-2 py-1 text-sm shadow-xs"
      />
    </div>
  );
};

/**
 * The sample text block. Reads the same "content" preference key as the editor
 * via {@link usePreference} (scoped by the surrounding {@link Configurable}).
 */
const TextBlock = () => {
  const [content = "Edit me from the inspector"] = usePreference<string>(
    "content",
    "Edit me from the inspector",
  );
  return <p className="text-base">{content}</p>;
};

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <ThemeProvider>
    <CoreAdminContext i18nProvider={i18nProvider} store={memoryStore()}>
      <PreferencesEditorContextProvider>
        <div className="flex min-h-[300px] flex-col gap-4 p-6">
          <div className="flex items-center gap-2 border-b pb-2">
            <span className="text-sm font-semibold">My App</span>
            <div className="ml-auto">
              <InspectorButton />
            </div>
          </div>
          <div className="flex flex-col gap-6">{children}</div>
          <Inspector />
        </div>
      </PreferencesEditorContextProvider>
    </CoreAdminContext>
  </ThemeProvider>
);

export const Basic = () => (
  <Wrapper>
    <p className="text-sm text-muted-foreground">
      Click the cog in the top-right to enter edit mode, then hover the text
      block.
    </p>
    <Configurable preferenceKey="textBlock" editor={<TextBlockEditor />}>
      <TextBlock />
    </Configurable>
  </Wrapper>
);

export const MultipleConfigurables = () => (
  <Wrapper>
    <p className="text-sm text-muted-foreground">
      Each block has its own preference key, so each gets its own editor.
    </p>
    <Configurable preferenceKey="textBlock.one" editor={<TextBlockEditor />}>
      <TextBlock />
    </Configurable>
    <Configurable preferenceKey="textBlock.two" editor={<TextBlockEditor />}>
      <TextBlock />
    </Configurable>
  </Wrapper>
);
