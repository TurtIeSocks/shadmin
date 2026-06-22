// ResourceMenuItem renders the resource's icon/label from the Admin's resource
// registry; isolated (no <Admin>) it can't resolve those and throws. It's shown
// live in this demo's own sidebar, so describe it + point there.
export default function Example() {
  return (
    <div className="mx-auto max-w-md rounded-lg border bg-muted/30 p-6 text-sm">
      <p className="font-medium text-foreground">ResourceMenuItem</p>
      <p className="mt-1.5 text-muted-foreground">
        A sidebar navigation link to a resource's list view, with its icon and
        pluralized label. It renders inside the Admin&apos;s{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
          &lt;Menu&gt;
        </code>
        . See it live in the <strong className="text-foreground">App</strong>{" "}
        zone of this demo&apos;s sidebar — Customers, Orders, Products… are each
        a ResourceMenuItem.
      </p>
    </div>
  );
}
