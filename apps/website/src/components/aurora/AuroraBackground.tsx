import { cn } from "@/lib/utils";

export function AuroraBackground({ className }: { className?: string }) {
  const orbs = [
    "left-[-60px] top-[-90px] size-[300px]",
    "right-[40px] top-[-50px] size-[260px]",
    "right-[-40px] bottom-[-110px] size-[280px]",
    "left-[20px] bottom-[-90px] size-[220px]",
  ];
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {orbs.map((pos, i) => (
        <div
          key={pos}
          className={cn("absolute rounded-full blur-[58px]", pos)}
          style={{ background: `var(--orb-${i + 1})` }}
        />
      ))}
    </div>
  );
}
