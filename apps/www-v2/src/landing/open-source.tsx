import { Reveal, RevealItem } from "./reveal";
import { Heading, Lead, Section } from "./section";

const stats = [
  { value: "40+", label: "Components" },
  { value: "15+", label: "Blocks" },
  { value: "100%", label: "Open source (MIT)" },
];

export function OpenSource() {
  return (
    <Section>
      <Reveal className="mx-auto max-w-3xl text-center">
        <Heading>
          Open source, <span className="text-brand-gradient">Open Code</span>
        </Heading>
        <Lead>
          Don&apos;t get locked-in to proprietary, black-box solutions. With
          Shadmin you always have 100% control over your project.
        </Lead>
      </Reveal>

      <Reveal className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <RevealItem
            key={s.label}
            className="rounded-2xl bg-muted/40 p-1.5 ring-1 ring-border/60"
          >
            <div className="rounded-[0.85rem] border border-border/40 bg-card px-6 py-10 text-center">
              <p className="text-5xl font-bold text-brand-gradient">
                {s.value}
              </p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                {s.label}
              </p>
            </div>
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  );
}
