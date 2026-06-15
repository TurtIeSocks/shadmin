import { Check } from "lucide-react";
import { GlassPanel } from "@/components/aurora/GlassPanel";
import { GradientText } from "@/components/aurora/GradientText";
import { MagneticButton } from "@/components/aurora/MagneticButton";
import { Reveal } from "@/components/aurora/Reveal";
import { Container } from "./Container";

import featuresScreenshot from "/img/features-screenshot.jpeg";

const features = [
  {
    name: "Rapid CRUD Generation",
    description: "Automatically generate admin UIs from your API",
  },
  {
    name: "Seamless relationships",
    description: "Combine and display data from multiple resources",
  },
  {
    name: "Roles & permissions",
    description: "Manage user access with fine-grained control",
  },
  {
    name: "Optimistic UI",
    description: "A snappy, native-app experience, even on slow networks",
  },
  {
    name: "Undo Functionality",
    description: "Allows users to instantly revert any changes",
  },
  {
    name: "Bulk Actions",
    description: "Select and modify multiple records at once",
  },
  {
    name: "User preferences",
    description: "Automatically saves and restores user settings and filters",
  },
  {
    name: "Fully customizable",
    description: "Modify components directly in your source code",
  },
];

export function AdvancedCapabilities() {
  return (
    <section
      id="advanced-capabilities"
      aria-label="Shadmin Advanced Capabilities"
      className="py-24 md:py-32"
    >
      <Container>
        <Reveal className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: copy + list + CTA */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Advanced{" "}
                <GradientText>Capabilities</GradientText>
              </h2>
              <p className="text-lg leading-8 text-muted-foreground">
                Beyond the basics, Shadmin offers sophisticated features to
                reduce development costs and enhance the developer experience.
              </p>
            </div>

            <dl className="space-y-3">
              {features.map((feature) => (
                <div key={feature.name} className="flex gap-3 items-start">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-aurora">
                    <Check
                      aria-hidden="true"
                      className="size-3 text-white"
                    />
                  </span>
                  <div>
                    <dt className="inline font-semibold text-foreground">
                      {feature.name}
                    </dt>
                    <dd className="inline text-muted-foreground">
                      {" "}
                      — {feature.description}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>

            <div>
              <MagneticButton
                href="https://shadmin.turtlesocks.dev/docs/install"
                external
                variant="aurora"
              >
                Learn More
              </MagneticButton>
            </div>
          </div>

          {/* Right: bezel screenshot */}
          <GlassPanel bezel>
            <img
              alt="Features screenshot"
              src={featuresScreenshot}
              className="w-full rounded-[calc(2rem-1rem)] block"
            />
          </GlassPanel>
        </Reveal>
      </Container>
    </section>
  );
}
