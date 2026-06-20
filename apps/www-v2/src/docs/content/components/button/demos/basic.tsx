import { Button } from "shadmin/components/ui/button";

export default function ButtonBasicDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button>Real shadmin button</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  );
}
