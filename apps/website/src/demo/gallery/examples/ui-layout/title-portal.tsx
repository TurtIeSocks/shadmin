import { TitlePortal, Title } from "shadmin/components/admin";

export default function Example() {
  return (
    <div className="flex items-center gap-2 h-10 border rounded px-3">
      <TitlePortal className="text-sm font-medium" />
      <Title title="Posts List" />
    </div>
  );
}
