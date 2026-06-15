import { cn } from "@/lib/utils";

/**
 * Single page-wide aurora atmosphere. Rendered once, fixed behind all content,
 * so the gradient reads as one continuous wash — no per-section seams or banding.
 * Theme-adaptive via the shared --orb-* tokens (light/dark).
 */
export function PageAurora() {
  const orbs = [
    "left-[-140px] top-[-120px] size-[480px]",
    "right-[-120px] top-[6%] size-[440px]",
    "left-[2%] top-[42%] size-[400px]",
    "right-[4%] top-[58%] size-[460px]",
    "left-[30%] bottom-[-140px] size-[440px]",
  ];
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {orbs.map((pos, i) => (
        <div
          key={pos}
          className={cn("absolute rounded-full blur-[90px]", pos)}
          style={{ background: `var(--orb-${(i % 4) + 1})` }}
        />
      ))}
    </div>
  );
}
