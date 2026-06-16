import type { ReactNode } from "react";
import { Eyebrow } from "@/components/aurora/eyebrow";
import { Reveal, RevealItem } from "@/components/aurora/reveal";

interface SplitSectionProps {
  id: string;
  ariaLabel: string;
  eyebrow: string;
  /** Heading content — wrap the emphasized fragment in <GradientText>. */
  title: ReactNode;
  description: ReactNode;
  /** Extra left-column content below the copy (logo chips, a CTA, …). */
  leftExtra?: ReactNode;
  /** Right-column panel (a mockup, diagram, terminal, …). */
  right: ReactNode;
}

/**
 * Two-column marketing section: a copy block (eyebrow + heading + description +
 * optional extras) beside a panel, stacking to one column below `lg`. Shared by
 * the "Connect to any backend" and "Host anywhere" sections.
 */
export function SplitSection({
  id,
  ariaLabel,
  eyebrow,
  title,
  description,
  leftExtra,
  right,
}: SplitSectionProps) {
  return (
    <section id={id} aria-label={ariaLabel} className="relative py-24 md:py-32">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto grid max-w-2xl grid-cols-1 items-center gap-x-16 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            <RevealItem>
              <div className="lg:max-w-lg">
                <Eyebrow className="mb-4">{eyebrow}</Eyebrow>
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {title}
                </p>
                <p className="my-10 text-lg leading-8 text-muted-foreground">
                  {description}
                </p>
                {leftExtra}
              </div>
            </RevealItem>
            <RevealItem>{right}</RevealItem>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
