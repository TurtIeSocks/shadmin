import { GlassPanel } from "@/components/aurora/glass-panel";
import { GradientText } from "@/components/aurora/gradient-text";
import { Reveal, RevealItem } from "@/components/aurora/reveal";
import { manifest } from "@/docs/manifest";

// Derived from the registry manifest (single source of truth) so these never
// drift from the /docs counts. See generate-docs-manifest.mjs.
const componentCount = manifest.items.length;
const blockCount = manifest.items.filter(
  (item) => item.type === "registry:block",
).length;

const stats = [
  { value: String(componentCount), label: "Components" },
  { value: String(blockCount), label: "Blocks" },
  { value: "100%", label: "Open source (MIT)" },
];

export function Open() {
  return (
    <section
      id="open"
      aria-label="Open Source Stats"
      className="relative py-24 md:py-32"
    >
      <div className="relative mx-auto max-w-md px-6 text-center sm:max-w-3xl lg:max-w-7xl lg:px-8">
        <Reveal>
          <RevealItem>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Open source, <GradientText>Open Code</GradientText>
            </p>
            <p className="mx-auto mt-5 max-w-prose text-xl text-muted-foreground mb-10">
              Don't get locked-in to proprietary, black-box solutions. With
              Shadmin you always have 100% control over your project.
            </p>
          </RevealItem>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            {stats.map((stat) => (
              <RevealItem key={stat.label}>
                <GlassPanel className="text-center p-8">
                  <div className="text-5xl font-bold mb-3">
                    <GradientText>{stat.value}</GradientText>
                  </div>
                  <p className="text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                </GlassPanel>
              </RevealItem>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
