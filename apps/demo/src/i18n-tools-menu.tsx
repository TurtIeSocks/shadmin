import { useState } from "react";
import { LanguagesIcon } from "lucide-react";
import { useTranslate } from "ra-core";

import { I18nKeyEditor } from "shadmin/components/extras/i18n-key-editor";
import { Button } from "shadmin/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "shadmin/components/ui/dialog";

import { i18nProvider } from "./i18nProvider";

/**
 * Sample subtree that translates a mix of present + missing keys, so the
 * I18nKeyEditor's floating panel captures something visible when the dialog
 * opens. Real apps would replace this with whatever subtree needs translation
 * scaffolding (e.g. a custom page being authored).
 */
const SampleTranslations = () => {
  const translate = useTranslate();
  return (
    <div className="rounded-md border p-3 text-sm">
      <p className="mb-2 font-medium">Sample translation calls</p>
      <ul className="space-y-1 text-muted-foreground">
        <li>{translate("ra.action.save")}</li>
        <li>{translate("demo.translation_editor.welcome")}</li>
        <li>{translate("demo.translation_editor.intro")}</li>
        <li>{translate("demo.translation_editor.cta")}</li>
      </ul>
    </div>
  );
};

/**
 * Header button that opens the I18nKeyEditor inside a dialog.
 *
 * I18nKeyEditor is a provider wrapper that captures missing-translation keys
 * from `useTranslate()` calls in its subtree and surfaces them via an inline
 * floating panel. Inside this dialog it scaffolds a sample subtree so users
 * see captured keys immediately; in a real app, the wrapper would sit higher
 * in the tree around the surface being authored.
 *
 * Note: this differs from the plan's "no props" prescription because
 * I18nKeyEditor requires `baseProvider` + `children` — there is no standalone
 * editor surface, only the wrapper-with-floating-panel pattern.
 */
export const I18nKeyEditorButton = () => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Translate UI">
          <LanguagesIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>UI Translation Editor</DialogTitle>
          <DialogDescription>
            Captures missing translation keys translated inside this dialog and
            surfaces them in a floating panel where you can edit + export.
          </DialogDescription>
        </DialogHeader>
        <I18nKeyEditor baseProvider={i18nProvider}>
          <SampleTranslations />
        </I18nKeyEditor>
      </DialogContent>
    </Dialog>
  );
};
