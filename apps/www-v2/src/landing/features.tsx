import { cn } from "shadmin/lib/utils";
import { features, spanClasses } from "./features.data";
import { Reveal, RevealItem } from "./reveal";
import { Eyebrow, Heading, Lead, Section } from "./section";

/** "Beyond UI Elements" — asymmetric bento grid of the kit's headline features. */
export function Features() {
  return (
    <Section>
      <Reveal className="mx-auto max-w-3xl text-center">
        <Eyebrow>All the Essentials</Eyebrow>
        <Heading>
          Beyond <span className="text-brand-gradient">UI Elements</span>
        </Heading>
        <Lead>
          With Shadmin, all the essential features come preconfigured with
          proven best practices. Spend less time on repetitive setup and more on
          what makes your app unique: your business logic.
        </Lead>
      </Reveal>

      <Reveal className="mt-14 grid auto-rows-[minmax(0,1fr)] grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {features.map((f) => {
          const large = f.span === "large";
          return (
            <RevealItem
              key={f.title}
              className={cn(
                "group flex flex-col rounded-xl border border-border/60 bg-card p-5 transition-colors duration-300 hover:border-border",
                f.span && spanClasses[f.span],
              )}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm shadow-indigo-500/20">
                <f.icon className="size-[1.15rem]" strokeWidth={1.5} />
              </span>
              <h3
                className={cn(
                  "mt-4 font-semibold leading-tight text-foreground",
                  large && "text-lg",
                )}
              >
                {f.title}
              </h3>
              <p
                className={cn(
                  "mt-2 text-sm leading-relaxed text-muted-foreground",
                  large && "max-w-sm",
                )}
              >
                {f.description}
              </p>
            </RevealItem>
          );
        })}
      </Reveal>
    </Section>
  );
}
