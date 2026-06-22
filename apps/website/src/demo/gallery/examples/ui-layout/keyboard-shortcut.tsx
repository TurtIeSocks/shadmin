import { KeyboardShortcut } from "shadmin/components/admin";

export default function Example() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4 text-sm">
        <span>Open command palette</span>
        <KeyboardShortcut keyboardShortcut="mod+k" />
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span>Save</span>
        <KeyboardShortcut keyboardShortcut="mod+s" />
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span>Sequence</span>
        <KeyboardShortcut keyboardShortcut="mod+k>p" />
      </div>
    </div>
  );
}
