import { Reveal, RevealItem } from "./reveal";
import { Eyebrow, Heading, Lead, Section } from "./section";
import { WindowChrome } from "./window-chrome";

const deployLogos = [
  { label: "Vercel", src: "/img/logo-vercel.svg", silhouette: true },
  { label: "Netlify", src: "/img/netlify-logo.svg" },
  { label: "GitHub Pages", src: "/img/github-logo.svg", silhouette: true },
  { label: "Cloudflare", src: "/img/cloudflare-logo.svg" },
];

export function Deploy() {
  return (
    <Section>
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Copy + logo chips */}
        <Reveal>
          <Eyebrow>Zero Lock-In</Eyebrow>
          <Heading>
            Host <span className="text-brand-gradient">Anywhere</span>
          </Heading>
          <Lead>
            Shadmin apps are lightweight, static assets you can host almost
            anywhere—for close to nothing. When you go to production, you own
            your app. No hidden fees, no SSO paywalls, and no surprises.
          </Lead>

          <RevealItem className="mt-8 flex flex-wrap items-center gap-3">
            {deployLogos.map((logo) => (
              <span
                key={logo.label}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3.5 py-1.5 text-sm font-medium text-foreground"
              >
                <img
                  src={logo.src}
                  alt=""
                  aria-hidden
                  width={18}
                  height={18}
                  className={
                    logo.silhouette
                      ? "size-[18px] brightness-0 dark:invert"
                      : "size-[18px]"
                  }
                />
                {logo.label}
              </span>
            ))}
          </RevealItem>
        </Reveal>

        {/* Terminal */}
        <Reveal delay={0.1}>
          <RevealItem className="rounded-2xl bg-muted/40 p-1.5 ring-1 ring-border/60">
            <WindowChrome title="Terminal">
              <div className="bg-zinc-950 p-5 font-mono text-sm leading-relaxed">
                <span className="text-zinc-500">$ </span>
                <span className="text-zinc-100">
                  npx shadcn@latest add
                  https://shadmin.turtlesocks.dev/r/admin.json
                </span>
              </div>
            </WindowChrome>
          </RevealItem>
        </Reveal>
      </div>
    </Section>
  );
}
