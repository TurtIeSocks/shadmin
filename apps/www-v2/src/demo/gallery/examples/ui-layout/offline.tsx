export default function Example() {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        Offline renders nothing when online. Below is a forced offline banner:
      </p>
      <div className="rounded border overflow-hidden">
        <div className="bg-destructive text-destructive-foreground px-4 py-2 text-sm text-center flex items-center justify-center gap-2">
          You are offline
        </div>
      </div>
    </div>
  );
}
