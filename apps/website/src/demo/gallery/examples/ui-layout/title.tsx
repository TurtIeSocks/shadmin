import { TitlePortal, Title } from "shadmin/components/admin";

export default function Example() {
  return (
    <div className="flex items-center gap-2 h-10 border rounded px-3">
      <TitlePortal />
      <Title title="My Dashboard" />
    </div>
  );
}
