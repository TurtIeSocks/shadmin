import { Extension, type Editor, type Range } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";

export interface SlashTriggerProps {
  /** PM range covering the typed "/" + query, to be deleted on insert. */
  range: Range;
  /** Anchor rect of the trigger in the viewport, for popover positioning. */
  clientRect: (() => DOMRect | null) | null;
}

export interface SlashCommandOptions {
  /** Fired when the picker should open (slash typed / query updated). */
  onTrigger: (props: SlashTriggerProps) => void;
  /** Fired when the suggestion is dismissed (escape, deletion, blur). */
  onClose: () => void;
}

export interface SlashCommandStorage {
  /**
   * Programmatically open the catalog picker (e.g. the ⊕ gutter button). The
   * chrome registers the real implementation; calling before mount is a no-op.
   * Pass a `range` to replace it on insert, or omit to append at the caret.
   */
  open: ((range?: Range) => void) | null;
}

declare module "@tiptap/core" {
  interface Storage {
    slashCommand: SlashCommandStorage;
  }
}

/**
 * Opens the catalog picker when the user types "/". The callbacks are supplied
 * per editor instance (see `useBlockEditor`), so multiple editors on one page do
 * not cross-talk. This extension only signals open/close + reports the range;
 * the picker performs the actual insert via {@link insertBlock}.
 *
 * For non-slash entry points (the ⊕ gutter button, tests) the chrome registers
 * an `open` function in this extension's storage, keeping every "open the
 * picker" path unified on a single per-editor channel.
 */
export const SlashCommand = Extension.create<
  SlashCommandOptions,
  SlashCommandStorage
>({
  name: "slashCommand",

  addOptions() {
    return {
      onTrigger: () => {},
      onClose: () => {},
    };
  },

  addStorage() {
    return { open: null };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        startOfLine: false,
        // The picker performs the actual insert; selecting an item is handled by
        // the React picker, so `command` is a no-op here.
        command: () => {},
        render: () => ({
          onStart: (props) =>
            this.options.onTrigger({
              range: props.range,
              clientRect: props.clientRect ?? null,
            }),
          onUpdate: (props) =>
            this.options.onTrigger({
              range: props.range,
              clientRect: props.clientRect ?? null,
            }),
          onExit: () => this.options.onClose(),
        }),
      }),
    ];
  },
});

/** Replace the slash query range with a new block of the given name + default attrs. */
export function insertBlock(
  editor: Editor,
  blockName: string,
  range?: Range,
): void {
  const chain = editor.chain().focus();
  if (range) chain.deleteRange(range);
  chain.insertContent({ type: blockName }).run();
}
