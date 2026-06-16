import SupabaseLogo from "/img/supabase-logo-icon.svg";
import AppwriteLogo from "/img/appwrite-logo.svg";
import FirebaseLogo from "/img/firebase-logo.svg";
import StrapiLogo from "/img/strapi-logo.svg";
import HasuraLogo from "/img/hasura-logo.svg";
import { LayoutDashboard, ChevronDown, Database } from "lucide-react";
import { GlassPanel } from "@/components/aurora/glass-panel";
import { GradientText } from "@/components/aurora/gradient-text";
import { LogoChip } from "@/components/aurora/logo-chip";
import { MagneticButton } from "@/components/aurora/magnetic-button";
import { SplitSection } from "@/components/aurora/split-section";

const backends = [
  { name: "Supabase", logo: SupabaseLogo },
  { name: "Appwrite", logo: AppwriteLogo },
  { name: "Firebase", logo: FirebaseLogo },
  { name: "Strapi", logo: StrapiLogo },
  { name: "Hasura", logo: HasuraLogo },
];

export function Backends() {
  return (
    <SplitSection
      id="backends"
      ariaLabel="Supported Backends"
      eyebrow="Effortless Integration"
      title={
        <>
          Connect to <GradientText>Any Backend</GradientText>
        </>
      }
      description="Shadmin is designed to fit seamlessly with the tools you already know and love. As a single-page app, it connects to any backend—REST, GraphQL, or custom APIs—and works with any authentication provider."
      leftExtra={
        <>
          <div className="mb-6 flex flex-wrap gap-3">
            {backends.map((backend) => (
              <LogoChip
                key={backend.name}
                name={backend.name}
                src={backend.logo}
              />
            ))}
            <LogoChip name="Works with any REST or GraphQL API" />
          </div>
          <MagneticButton
            href="https://shadmin.turtlesocks.dev/docs/data-providers"
            variant="aurora"
            external
          >
            Learn More
          </MagneticButton>
        </>
      }
      right={
        <div className="mx-auto w-full max-w-md">
          <GlassPanel bezel className="p-6">
            <div className="flex flex-col items-center gap-0">
              {/* Your App node */}
              <div className="w-full rounded-xl bg-foreground/5 border border-border px-6 py-4 flex items-center gap-3">
                <LayoutDashboard
                  className="size-5 text-foreground shrink-0"
                  aria-hidden="true"
                />
                <span className="font-semibold text-foreground">Your App</span>
              </div>

              {/* Connector 1 */}
              <div className="flex flex-col items-center gap-1 py-2">
                <div className="w-px h-4 bg-border" />
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-foreground/5 border border-border text-muted-foreground">
                  useGetList('posts')
                </span>
                <ChevronDown
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>

              {/* dataProvider node */}
              <div className="w-full rounded-xl bg-aurora px-6 py-4 flex items-center justify-center">
                <span className="font-bold text-white tracking-wide">
                  dataProvider
                </span>
              </div>

              {/* Connector 2 */}
              <div className="flex flex-col items-center gap-1 py-2">
                <ChevronDown
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-foreground/5 border border-border text-muted-foreground">
                  REST · GraphQL · any API
                </span>
                <div className="w-px h-4 bg-border" />
              </div>

              {/* Your Backend node */}
              <div className="w-full rounded-xl bg-foreground/5 border border-border px-6 py-4 flex items-center gap-3">
                <Database
                  className="size-5 text-foreground shrink-0"
                  aria-hidden="true"
                />
                <span className="font-semibold text-foreground">
                  Your Backend
                </span>
              </div>
            </div>
          </GlassPanel>
        </div>
      }
    />
  );
}
