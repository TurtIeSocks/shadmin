export default function Home() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16">
      <div className="flex items-center gap-4">
        <img
          src="/shadmin-mark.svg"
          alt=""
          aria-hidden
          className="size-12"
          width={48}
          height={48}
        />
        <h1 className="text-4xl font-bold tracking-tight">
          shad<span className="text-brand-gradient">min</span>
        </h1>
      </div>
      <p className="mt-4 text-muted-foreground">
        shadcn-native admin kit. Landing content lands in Phase 2.
      </p>
    </main>
  );
}
