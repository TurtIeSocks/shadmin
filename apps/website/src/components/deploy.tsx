import VercelLogo from "/img/logo-vercel.svg";
import NetlifyLogo from "/img/netlify-logo.svg";
import GitHubPagesLogo from "/img/github-logo.svg";
import CloudflareLogo from "/img/cloudflare-logo.svg";
import { GlassPanel } from "@/components/aurora/glass-panel";
import { GradientText } from "@/components/aurora/gradient-text";
import { LogoChip } from "@/components/aurora/logo-chip";
import { SplitSection } from "@/components/aurora/split-section";
import { WindowChrome } from "@/components/aurora/window-chrome";

const hosts = [
  { name: "Vercel", logo: VercelLogo },
  { name: "Netlify", logo: NetlifyLogo },
  { name: "GitHub Pages", logo: GitHubPagesLogo },
  { name: "Cloudflare", logo: CloudflareLogo },
];

export function Deploy() {
  return (
    <SplitSection
      id="hosts"
      ariaLabel="Hosting backends"
      eyebrow="Zero Lock-In"
      title={
        <>
          Host <GradientText>Anywhere</GradientText>
        </>
      }
      description="Shadmin apps are lightweight, static assets you can host almost anywhere—for close to nothing. When you go to production, you own your app. No hidden fees, no SSO paywalls, and no surprises."
      leftExtra={
        <div className="flex flex-wrap gap-3">
          {hosts.map((host) => (
            <LogoChip key={host.name} name={host.name} src={host.logo} />
          ))}
        </div>
      }
      right={
        <GlassPanel className="p-6">
          <WindowChrome label="Terminal" className="mb-4" />
          <div className="rounded-md bg-foreground/5 border border-border p-4 font-mono text-sm text-foreground">
            <span className="text-muted-foreground select-none">$ </span>
            npx shadcn@latest add https://shadmin.turtlesocks.dev/r/admin.json
          </div>
        </GlassPanel>
      }
    />
  );
}
