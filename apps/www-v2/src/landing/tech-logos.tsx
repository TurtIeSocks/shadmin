import { cn } from "shadmin/lib/utils";
import { Eyebrow, Heading, Lead, Section } from "./section";
import { Reveal, RevealItem } from "./reveal";
import { techLogos } from "./tech-logos.data";

/** "The Stack" — grid of the libraries Shadmin is built on. */
export function TechLogos() {
  return (
    <Section>
      <Reveal className="mx-auto max-w-3xl text-center">
        <Eyebrow>The Stack</Eyebrow>
        <Heading>
          Built on tools you <span className="text-brand-gradient">trust</span>
        </Heading>
        <Lead>
          Shadmin leverages first-class libraries, acclaimed by the React
          community for their robustness, documentation and performance.
        </Lead>
      </Reveal>

      <Reveal className="mx-auto mt-14 flex max-w-5xl flex-wrap items-center justify-center gap-x-12 gap-y-10">
        {techLogos.map((logo) => (
          <RevealItem
            key={logo.label}
            className="group flex flex-col items-center gap-2"
          >
            <img
              src={logo.src}
              alt={logo.label}
              width={56}
              height={56}
              className={cn(
                "size-14 opacity-65 transition-opacity duration-300 group-hover:opacity-100",
                logo.silhouette && "brightness-0 dark:invert",
              )}
            />
            <span className="text-xs font-medium text-muted-foreground">
              {logo.label}
            </span>
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  );
}
