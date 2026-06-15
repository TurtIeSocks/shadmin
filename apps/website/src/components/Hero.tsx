import HeroScreenshot from "/img/hero-screenshot.jpeg";
import { Eyebrow } from "@/components/aurora/Eyebrow";
import { GlassPanel } from "@/components/aurora/GlassPanel";
import { GradientText } from "@/components/aurora/GradientText";
import { MagneticButton } from "@/components/aurora/MagneticButton";
import { Reveal, RevealItem } from "@/components/aurora/Reveal";
import HotspotSvg from "./HotspotSvg";

export function Hero() {
  return (
    <div className="relative py-24 md:py-32 text-center">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Copy block */}
        <Reveal stagger className="mx-auto max-w-3xl flex flex-col items-center gap-6">
          <RevealItem>
            <Eyebrow>Open source · shadcn registry</Eyebrow>
          </RevealItem>

          <RevealItem>
            <h1 className="text-5xl md:text-7xl font-bold tracking-[-0.02em] leading-[1.05] text-foreground">
              Build admin panels that{" "}
              <GradientText>don&rsquo;t look like admin panels.</GradientText>
            </h1>
          </RevealItem>

          <RevealItem>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Production-ready shadcn blocks for internal tools, dashboards, B2B
              apps, and admin panels with React.
            </p>
          </RevealItem>

          <RevealItem>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <MagneticButton
                href="https://shadmin.turtlesocks.dev/docs/install"
                external
                variant="aurora"
              >
                Get started
              </MagneticButton>
              <MagneticButton
                href="https://shadmin.turtlesocks.dev/demo"
                external
                variant="ghost"
              >
                Live demo
              </MagneticButton>
            </div>
          </RevealItem>
        </Reveal>

        {/* Screenshot / interactive graphic */}
        <Reveal className="mt-16 sm:mt-24">
          <GlassPanel bezel>
            <img
              src={HeroScreenshot}
              alt="Shadmin dashboard screenshot"
              className="mx-auto rounded-[calc(2rem-0.5rem)] w-full xl:hidden"
            />
            <div className="hidden xl:block">
              <HotspotSvg />
            </div>
          </GlassPanel>
        </Reveal>
      </div>
    </div>
  );
}
