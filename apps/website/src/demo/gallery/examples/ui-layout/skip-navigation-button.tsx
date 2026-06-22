import { SkipNavigationButton } from "shadmin/components/admin";

export default function Example() {
  return (
    <div className="relative">
      <SkipNavigationButton />
      <p className="text-sm text-muted-foreground mt-2">
        Tab into this area to reveal the skip-navigation button.
      </p>
      <main id="main-content" className="sr-only">
        Main content
      </main>
    </div>
  );
}
