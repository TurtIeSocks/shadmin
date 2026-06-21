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
