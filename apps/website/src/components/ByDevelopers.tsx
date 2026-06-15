import vscodeScreenshot from "/img/vscode.webp";
import { Container } from "./Container";
import { GlassPanel } from "./aurora/GlassPanel";
import { GradientText } from "./aurora/GradientText";
import { Reveal, RevealItem } from "./aurora/Reveal";

export function ByDevelopers() {
  return (
    <section aria-label="Built by developers" className="py-24 md:py-32">
      <Container>
        <Reveal className="grid grid-cols-1 gap-x-16 gap-y-12 items-center lg:grid-cols-2">
          <RevealItem className="max-w-md mx-auto lg:mx-0">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
              Built by developers{" "}
              <GradientText>for developers</GradientText>
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Composability, separation of concerns, clean code, strong typing
              and smart auto-completion ensure a pleasant DX.
            </p>
          </RevealItem>
          <RevealItem>
            <GlassPanel bezel className="overflow-hidden">
              <img
                alt="VSCode Screenshot"
                src={vscodeScreenshot}
                className="w-full rounded-[calc(2rem-0.5rem)]"
              />
            </GlassPanel>
          </RevealItem>
        </Reveal>
      </Container>
    </section>
  );
}
