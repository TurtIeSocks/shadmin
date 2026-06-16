import { Container } from "./container";
import { GlassPanel } from "./aurora/glass-panel";
import { GradientText } from "./aurora/gradient-text";
import { Reveal, RevealItem } from "./aurora/reveal";
import { AuroraBadge } from "./aurora/aurora-badge";
import {
  BicepsFlexed,
  Plug,
  GraduationCap,
  LayoutPanelLeft,
  LockOpen,
  Sparkles,
} from "lucide-react";

const features = [
  {
    name: "Get a head start",
    description:
      "Kickstart your project with pre-built components — no need to reinvent the wheel.",
    icon: LayoutPanelLeft,
  },
  {
    name: "Battle-tested foundation",
    description:
      "Built on the battle-tested ra-core foundation — a rich library of hooks maintained by experienced open-source developers.",
    icon: GraduationCap,
  },
  {
    name: "Headless",
    description:
      "Based on ra-core, a rich library of hooks that can be used with any React component.",
    icon: Plug,
  },
  {
    name: "No lock-in",
    description:
      "The code is open-source. Host it anywhere with zero hidden costs.",
    icon: LockOpen,
  },
  {
    name: "Industry best practices",
    description:
      "Responsive design, accessibility, and performance are built-in.",
    icon: BicepsFlexed,
  },
  {
    name: "AI ready",
    description: "Shadmin comes with an MCP server.",
    icon: Sparkles,
  },
];

export function Why() {
  return (
    <section
      id="why"
      aria-label="Why choose Shadmin"
      className="py-24 md:py-32"
    >
      <Container>
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            Why choose <GradientText>Shadmin</GradientText>?
          </h2>
        </div>
        <Reveal
          stagger
          className="grid max-w-xl grid-cols-1 gap-6 mx-auto lg:max-w-none lg:grid-cols-2 xl:grid-cols-3"
        >
          {features.map((feature) => (
            <RevealItem key={feature.name}>
              <GlassPanel className="p-6 h-full">
                <div className="flex items-start gap-4">
                  <AuroraBadge className="size-10 rounded-lg">
                    <feature.icon
                      aria-hidden="true"
                      className="size-5 text-white"
                    />
                  </AuroraBadge>
                  <div>
                    <dt className="text-base font-semibold text-foreground">
                      {feature.name}
                    </dt>
                    <dd className="mt-1 text-sm text-muted-foreground">
                      {feature.description}
                    </dd>
                  </div>
                </div>
              </GlassPanel>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
