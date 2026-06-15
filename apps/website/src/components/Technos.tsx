import { Container } from "./Container";
import { GlassPanel } from "@/components/aurora/GlassPanel";
import { GradientText } from "@/components/aurora/GradientText";
import { Eyebrow } from "@/components/aurora/Eyebrow";
import { Reveal, RevealItem } from "@/components/aurora/Reveal";

import TypeScriptLogo from "/img/ts-logo.svg";
import ReactLogo from "/img/react-logo.svg";
import ShadcnUILogo from "/img/shadcn-ui-logo.svg";
import ReactRouterLogo from "/img/react-router-logo.svg";
import ReactQueryLogo from "/img/react-query-logo.svg";
import TailwindLogo from "/img/tailwind-logo.svg";
import RadixUILogo from "/img/radix-ui-logo.svg";
import ReactHookFormLogo from "/img/react-hook-form-logo.svg";

const technos = [
  {
    name: "React",
    logo: ReactLogo,
  },
  {
    name: "shadcn/ui",
    logo: ShadcnUILogo,
  },
  {
    name: "Tailwind CSS",
    logo: TailwindLogo,
  },
  {
    name: "Radix UI",
    logo: RadixUILogo,
  },
  {
    name: "React Router",
    logo: ReactRouterLogo,
  },
  {
    name: "TanStack Query",
    logo: ReactQueryLogo,
  },
  {
    name: "React Hook Form",
    logo: ReactHookFormLogo,
  },
  {
    name: "TypeScript",
    logo: TypeScriptLogo,
  },
];

export function Technos() {
  return (
    <section id="techno" aria-label="Logo cloud" className="py-24 md:py-32">
      <Container>
        <Reveal className="flex flex-col items-center gap-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <Eyebrow>The Stack</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Built on tools you{" "}
              <GradientText>trust</GradientText>
            </h2>
            <p className="mt-2 max-w-xl text-lg leading-8 text-muted-foreground">
              Shadmin leverages first-class libraries, acclaimed by the React
              community for their robustness, documentation and performance.
            </p>
          </div>

          <GlassPanel className="w-full max-w-4xl px-8 py-8">
            <Reveal stagger className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8 md:gap-x-14 md:gap-y-10">
              {technos.map((techno) => (
                <RevealItem key={techno.name}>
                  <div className="flex flex-col items-center gap-2 group cursor-default">
                    <span
                      role="img"
                      aria-label={techno.name}
                      style={{
                        maskImage: `url(${techno.logo})`,
                        WebkitMaskImage: `url(${techno.logo})`,
                        maskRepeat: "no-repeat",
                        WebkitMaskRepeat: "no-repeat",
                        maskPosition: "center",
                        WebkitMaskPosition: "center",
                        maskSize: "contain",
                        WebkitMaskSize: "contain",
                      }}
                      className="size-14 bg-foreground/55 transition duration-300 group-hover:bg-foreground"
                    />
                    <p className="text-sm text-muted-foreground transition duration-300 group-hover:text-foreground">
                      {techno.name}
                    </p>
                  </div>
                </RevealItem>
              ))}
            </Reveal>
          </GlassPanel>
        </Reveal>
      </Container>
    </section>
  );
}
