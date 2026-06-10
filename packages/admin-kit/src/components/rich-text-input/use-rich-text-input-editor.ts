import { useTiptapEditor } from "./minimal-tiptap/hooks/use-tiptap-editor";

const useRichTextInputEditor = () => {
  const { editor } = useTiptapEditor();

  return editor;
};

export { useRichTextInputEditor };
