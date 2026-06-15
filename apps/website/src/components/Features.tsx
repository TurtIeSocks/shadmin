import {
  ArrowDownUp,
  AlignJustify,
  NotepadText,
  KeyRound,
  ScanSearch,
  Earth,
  Palette,
  BugOff,
} from "lucide-react";
import { GlassPanel } from "@/components/aurora/GlassPanel";
import { GradientText } from "@/components/aurora/GradientText";
import { Eyebrow } from "@/components/aurora/Eyebrow";
import { Reveal, RevealItem } from "@/components/aurora/Reveal";
import { cn } from "@/lib/utils";

const features = [
  {
    name: "Data Fetching",
    description: "Efficient hooks for robust API interactions",
    icon: ArrowDownUp,
    emphasis: true,
  },
  {
    name: "Lists & Data Tables",
    description: "Flexible list components for displaying data collections",
    icon: AlignJustify,
    emphasis: false,
  },
  {
    name: "Forms & Validation",
    description:
      "Data-bound inputs, adaptable layouts, and dynamic field support",
    icon: NotepadText,
    emphasis: true,
  },
  {
    name: "Authentication",
    description: "Secure authentication flows and user management",
    icon: KeyRound,
    emphasis: false,
  },
  {
    name: "Search & Filtering",
    description:
      "Components for search-as-you-type, combined filters, and more",
    icon: ScanSearch,
    emphasis: false,
  },
  {
    name: "I18n",
    description: "Internationalization support for global applications",
    icon: Earth,
    emphasis: false,
  },
  {
    name: "Flexible Theming",
    description: "App themes, light/dark mode & granular component styling",
    icon: Palette,
    emphasis: false,
  },
  {
    name: "Resilient UI",
    description: "Gracefully manages loading, empty, and error states",
    icon: BugOff,
    emphasis: false,
  },
];

export function Features() {
  return (
    <section
      id="features"
      aria-label="Shadmin Essential Features"
      className="relative py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal className="flex flex-col items-center gap-4 text-center mb-16">
          <Eyebrow>All the Essentials</Eyebrow>
          <h2 className="text-3xl font-black font-heading tracking-tight text-foreground sm:text-4xl">
            Beyond{" "}
            <GradientText>UI Elements</GradientText>
          </h2>
          <p className="mx-auto max-w-prose text-xl text-muted-foreground">
            With Shadmin, all the essential features come preconfigured with
            proven best practices. Spend less time on repetitive setup and more
            on what makes your app unique: your business logic.
          </p>
        </Reveal>

        <Reveal stagger className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {features.map((feature) => (
            <RevealItem
              key={feature.name}
              className={cn(
                feature.emphasis ? "md:col-span-2" : "md:col-span-1",
              )}
            >
              <GlassPanel
                bezel={feature.emphasis}
                className={cn(
                  "h-full p-6 transition duration-300 hover:-translate-y-1",
                  feature.emphasis ? "p-8" : "p-6",
                )}
              >
                <div className="flex flex-col gap-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-aurora/10">
                    <feature.icon
                      aria-hidden="true"
                      className={cn(
                        "text-aurora",
                        feature.emphasis ? "size-6" : "size-5",
                      )}
                    />
                  </span>
                  <h3
                    className={cn(
                      "font-bold font-heading tracking-tight text-foreground",
                      feature.emphasis ? "text-xl" : "text-base",
                    )}
                  >
                    {feature.name}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </GlassPanel>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
