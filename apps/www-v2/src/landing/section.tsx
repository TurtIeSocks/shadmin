import type { ReactNode } from "react";
import { cn } from "shadmin/lib/utils";
import { RevealItem } from "./reveal";

interface EyebrowProps {
  children: ReactNode;
  className?: string;
}

/** Gradient eyebrow pill before an H2 — matches the /docs landing. */
export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <RevealItem
      as="span"
      className={cn(
        "inline-block rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-gradient",
        className,
      )}
    >
      {children}
    </RevealItem>
  );
}

interface HeadingProps {
  children: ReactNode;
  className?: string;
}

/** Section H2 — bold, tight tracking, reveals as a stagger item. */
export function Heading({ children, className }: HeadingProps) {
  return (
    <RevealItem
      as="h2"
      className={cn(
        "mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl",
        className,
      )}
    >
      {children}
    </RevealItem>
  );
}

interface LeadProps {
  children: ReactNode;
  className?: string;
}

/** Section sub-paragraph below the heading. */
export function Lead({ children, className }: LeadProps) {
  return (
    <RevealItem
      as="p"
      className={cn(
        "mt-4 text-lg leading-relaxed text-muted-foreground",
        className,
      )}
    >
      {children}
    </RevealItem>
  );
}

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

/** Vertical-rhythm wrapper: generous py + centered max-width container. */
export function Section({ children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn("py-24 md:py-32", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

/**
 * Section-to-section divider: a center-tapered hairline with a small brand-gradient
 * gem at the middle (the brand-language successor to v1's glass separator).
 */
export function SectionDivider() {
  return (
    <div className="relative mx-auto w-full max-w-5xl px-6" aria-hidden>
      <hr className="m-0 h-px border-0 bg-border [mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]" />
      <span className="absolute left-1/2 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[3px] bg-brand-gradient shadow-[0_0_16px_1px_rgba(139,92,246,0.5)] ring-1 ring-white/30" />
    </div>
  );
}

interface LogoChipProps {
  label: string;
  src: string;
  /** Render the icon as a theme-adaptive silhouette (brightness-0 dark:invert). */
  silhouette?: boolean;
}

/** Pill chip with a backend/host logo + label, used in the integration rows. */
export function LogoChip({ label, src, silhouette }: LogoChipProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3.5 py-1.5 text-sm font-medium text-foreground">
      <img
        src={src}
        alt=""
        aria-hidden
        width={18}
        height={18}
        className={cn("size-[18px]", silhouette && "brightness-0 dark:invert")}
      />
      {label}
    </span>
  );
}

interface BezelPanelProps {
  children: ReactNode;
  className?: string;
}

/**
 * Double-bezel frame for hero/feature mockups: a soft outer ring around an inset
 * card surface, giving screenshots/code/diagrams depth. Renders as a `Reveal`
 * stagger child so it animates in when it scrolls into view.
 */
export function BezelPanel({ children, className }: BezelPanelProps) {
  return (
    <RevealItem
      className={cn(
        "rounded-2xl bg-muted/40 p-1.5 ring-1 ring-border/60",
        className,
      )}
    >
      {children}
    </RevealItem>
  );
}
