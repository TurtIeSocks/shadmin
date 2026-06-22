import { LinearProgress } from "shadmin/components/admin";

export default function Example() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Indeterminate</p>
        <LinearProgress timeout={0} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Determinate (65%)</p>
        <LinearProgress timeout={0} value={65} />
      </div>
    </div>
  );
}
