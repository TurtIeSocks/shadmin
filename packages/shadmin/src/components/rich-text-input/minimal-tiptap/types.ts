import type { Editor } from "@tiptap/react";
import type { EditorView } from "@tiptap/pm/view";
import type { EditorState } from "@tiptap/pm/state";

interface LinkProps {
  url: string;
  text?: string;
  openInNewTab?: boolean;
}

interface ShouldShowProps {
  editor: Editor;
  view: EditorView;
  state: EditorState;
  oldState?: EditorState;
  from: number;
  to: number;
}

interface FormatAction {
  label: string;
  icon?: React.ReactNode;
  action: (editor: Editor) => void;
  isActive: (editor: Editor) => boolean;
  canExecute: (editor: Editor) => boolean;
  shortcuts: string[];
  value: string;
}

export { type LinkProps, type ShouldShowProps, type FormatAction };
