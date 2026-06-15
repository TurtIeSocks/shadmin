import { MagneticButton } from "@/components/aurora/MagneticButton";
import { Reveal } from "@/components/aurora/Reveal";

export function CallToAction() {
  return (
    <section className="px-6 py-12 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="bezel rounded-[2.75rem]">
          <div className="bg-aurora rounded-[2.25rem] py-24 md:py-32 px-6 md:px-12 text-center relative overflow-hidden">
          <Reveal className="relative z-10 flex flex-col items-center gap-8">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl max-w-2xl mx-auto">
              Generate a beautiful admin panel in just a few lines of code.
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-8 text-white/80">
              Then customize every detail to fit your unique requirements.
            </p>
            <MagneticButton
              href="https://shadmin.turtlesocks.dev/docs/install"
              external
              variant="ghost"
              className="bg-white text-[#1a1830] border-transparent hover:bg-white/90"
            >
              Get started
            </MagneticButton>
          </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
