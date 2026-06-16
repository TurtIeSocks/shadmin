import VercelLogo from "/img/logo-vercel.svg";
import NetlifyLogo from "/img/netlify-logo.svg";
import GitHubPagesLogo from "/img/github-logo.svg";
import CloudflareLogo from "/img/cloudflare-logo.svg";
import { GlassPanel } from "@/components/aurora/glass-panel";
import { GradientText } from "@/components/aurora/gradient-text";
import { Eyebrow } from "@/components/aurora/eyebrow";
import { Reveal, RevealItem } from "@/components/aurora/reveal";

const hosts = [
  { name: "Vercel", logo: VercelLogo },
  { name: "Netlify", logo: NetlifyLogo },
  { name: "GitHub Pages", logo: GitHubPagesLogo },
  { name: "Cloudflare", logo: CloudflareLogo },
];

export function Deploy() {
  return (
    <section
      id="hosts"
      aria-label="Hosting backends"
      className="relative py-24 md:py-32"
    >
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-16 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 items-center">
            <RevealItem>
              <div className="lg:max-w-lg">
                <Eyebrow className="mb-4">Zero Lock-In</Eyebrow>
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Host <GradientText>Anywhere</GradientText>
                </p>
                <p className="my-10 text-lg leading-8 text-muted-foreground">
                  Shadmin apps are lightweight, static assets you can host
                  almost anywhere—for close to nothing. When you go to
                  production, you own your app. No hidden fees, no SSO paywalls,
                  and no surprises.
                </p>
                <div className="flex flex-wrap gap-3">
                  {hosts.map((host) => (
                    <GlassPanel
                      key={host.name}
                      className="inline-flex items-center text-sm font-semibold py-1.5 px-3 text-foreground"
                    >
                      <img
                        alt={host.name}
                        src={host.logo}
                        width={16}
                        height={16}
                        className="mr-2 inline-block"
                      />
                      {host.name}
                    </GlassPanel>
                  ))}
                </div>
              </div>
            </RevealItem>

            <RevealItem>
              <GlassPanel className="lg:-order-1 p-6">
                <div className="flex items-center mb-4 gap-2">
                  <div className="size-3 rounded-full bg-destructive" />
                  <div className="size-3 rounded-full bg-amber-500" />
                  <div className="size-3 rounded-full bg-green-500" />
                  <span className="ml-3 text-xs text-muted-foreground font-medium">
                    Terminal
                  </span>
                </div>
                <div className="rounded-md bg-foreground/5 border border-border p-4 font-mono text-sm text-foreground">
                  <span className="text-muted-foreground select-none">$ </span>
                  npx shadcn@latest add
                  https://shadmin.turtlesocks.dev/r/admin.json
                </div>
              </GlassPanel>
            </RevealItem>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
