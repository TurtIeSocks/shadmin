import { HideOnScroll } from "shadmin/components/admin";

export default function Example() {
  return (
    <HideOnScroll threshold={50}>
      <div className="rounded border bg-card px-4 py-2 text-sm font-medium shadow">
        This bar hides when you scroll down past 50px.
      </div>
    </HideOnScroll>
  );
}
