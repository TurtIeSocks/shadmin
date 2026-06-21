import { Toolbar, SaveButton } from "shadmin/components/admin";

export default function Example() {
  return (
    <div className="max-w-sm border rounded p-4">
      <Toolbar>
        <SaveButton />
      </Toolbar>
    </div>
  );
}
