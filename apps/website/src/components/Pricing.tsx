import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Container } from "./Container";
import { GlassPanel } from "./aurora/GlassPanel";
import { GradientText } from "./aurora/GradientText";
import { Eyebrow } from "./aurora/Eyebrow";
import { Reveal } from "./aurora/Reveal";

const features = [
  "Unlimited users",
  "Unlimited projects",
  "Free SSO",
  "Host on Supabase or your own infrastructure",
];

export function Pricing() {
  return (
    <section
      id="pricing"
      aria-label="Pricing"
      className="py-24 md:py-32"
    >
      <Container>
        <Reveal className="flex flex-col items-center text-center gap-4 mb-12">
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
            Free as in <GradientText>beer</GradientText>
          </h2>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Free and open source under the MIT license — no tiers, no seats, no catch.
          </p>
        </Reveal>
        <Reveal className="flex justify-center">
          <GlassPanel bezel className="w-full max-w-sm p-8">
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-semibold text-foreground">Open-Source</h3>
              <p className="text-sm text-muted-foreground">The one and only tier</p>
            </div>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight text-foreground">
                <GradientText>$0</GradientText>
              </span>
              <span className="text-sm text-muted-foreground">/month</span>
            </p>
            <ul className="mt-8 space-y-2 text-sm text-muted-foreground xl:mt-10">
              {features.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <Check aria-hidden="true" className="h-6 w-5 flex-none text-foreground" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-10 w-full" size="lg">
              <a href="https://shadmin.turtlesocks.dev/docs/install" aria-describedby="free-tier">
                Get started
              </a>
            </Button>
          </GlassPanel>
        </Reveal>
      </Container>
    </section>
  );
}
