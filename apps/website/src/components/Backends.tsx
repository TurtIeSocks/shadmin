import SupabaseLogo from "/img/supabase-logo-icon.svg";
import AppwriteLogo from "/img/appwrite-logo.svg";
import FirebaseLogo from "/img/firebase-logo.svg";
import StrapiLogo from "/img/strapi-logo.svg";
import HasuraLogo from "/img/hasura-logo.svg";
import DataProviderSchema from "/img/dataProvider-schema.svg";
import { AuroraBackground } from "@/components/aurora/AuroraBackground";
import { GlassPanel } from "@/components/aurora/GlassPanel";
import { GradientText } from "@/components/aurora/GradientText";
import { Eyebrow } from "@/components/aurora/Eyebrow";
import { MagneticButton } from "@/components/aurora/MagneticButton";
import { Reveal, RevealItem } from "@/components/aurora/Reveal";

const backends = [
  { name: "Supabase", logo: SupabaseLogo },
  { name: "Appwrite", logo: AppwriteLogo },
  { name: "Firebase", logo: FirebaseLogo },
  { name: "Strapi", logo: StrapiLogo },
  { name: "Hasura", logo: HasuraLogo },
];

export function Backends() {
  return (
    <section
      id="backends"
      aria-label="Supported Backends"
      className="relative isolate overflow-hidden py-24 md:py-32"
    >
      <AuroraBackground />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-16 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 items-center">
            <RevealItem>
              <div className="lg:max-w-lg">
                <Eyebrow className="mb-4">Effortless Integration</Eyebrow>
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Connect to{" "}
                  <GradientText>Any Backend</GradientText>
                </p>
                <p className="my-10 text-lg leading-8 text-muted-foreground">
                  Shadmin is designed to fit seamlessly with the tools you
                  already know and love. As a single-page app, it connects to
                  any backend—REST, GraphQL, or custom APIs—and works with any
                  authentication provider.
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  {backends.map((backend) => (
                    <GlassPanel
                      key={backend.name}
                      className="inline-flex items-center text-sm font-semibold py-1.5 px-3 text-foreground"
                    >
                      <img
                        alt={backend.name}
                        src={backend.logo}
                        width={16}
                        height={16}
                        className="mr-2 inline-block"
                      />
                      {backend.name}
                    </GlassPanel>
                  ))}
                  <GlassPanel className="inline-flex items-center text-sm font-semibold py-1.5 px-3 text-muted-foreground">
                    Works with any REST or GraphQL API
                  </GlassPanel>
                </div>
                <MagneticButton
                  href="https://shadmin.turtlesocks.dev/docs/data-providers"
                  variant="aurora"
                  external
                >
                  Learn More
                </MagneticButton>
              </div>
            </RevealItem>
            <RevealItem>
              <GlassPanel bezel className="w-full mx-auto max-w-md p-4">
                <img
                  alt="DataProvider Schema"
                  src={DataProviderSchema}
                  className="w-full"
                />
              </GlassPanel>
            </RevealItem>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
