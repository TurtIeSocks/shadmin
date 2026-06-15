import SupabaseLogo from "/img/supabase-logo-icon.svg";
import AppwriteLogo from "/img/appwrite-logo.svg";
import FirebaseLogo from "/img/firebase-logo.svg";
import StrapiLogo from "/img/strapi-logo.svg";
import HasuraLogo from "/img/hasura-logo.svg";
import { LayoutDashboard, ChevronDown, Database } from "lucide-react";
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
      className="relative py-24 md:py-32"
    >
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
              <div className="mx-auto w-full max-w-md">
                <GlassPanel bezel className="p-6">
                  <div className="flex flex-col items-center gap-0">
                  {/* Your App node */}
                  <div className="w-full rounded-xl bg-foreground/5 border border-border px-6 py-4 flex items-center gap-3">
                    <LayoutDashboard className="size-5 text-foreground shrink-0" aria-hidden="true" />
                    <span className="font-semibold text-foreground">Your App</span>
                  </div>

                  {/* Connector 1 */}
                  <div className="flex flex-col items-center gap-1 py-2">
                    <div className="w-px h-4 bg-border" />
                    <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-foreground/5 border border-border text-muted-foreground">
                      useGetList('posts')
                    </span>
                    <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
                  </div>

                  {/* dataProvider node */}
                  <div className="w-full rounded-xl bg-aurora px-6 py-4 flex items-center justify-center">
                    <span className="font-bold text-white tracking-wide">dataProvider</span>
                  </div>

                  {/* Connector 2 */}
                  <div className="flex flex-col items-center gap-1 py-2">
                    <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
                    <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-foreground/5 border border-border text-muted-foreground">
                      REST · GraphQL · any API
                    </span>
                    <div className="w-px h-4 bg-border" />
                  </div>

                  {/* Your Backend node */}
                  <div className="w-full rounded-xl bg-foreground/5 border border-border px-6 py-4 flex items-center gap-3">
                    <Database className="size-5 text-foreground shrink-0" aria-hidden="true" />
                    <span className="font-semibold text-foreground">Your Backend</span>
                  </div>
                </div>
                </GlassPanel>
              </div>
            </RevealItem>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
