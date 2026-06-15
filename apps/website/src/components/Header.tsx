import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { MagneticButton } from "@/components/aurora/MagneticButton";
import { ThemeToggle } from "@/components/aurora/ThemeToggle";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import GithubLogo from "/img/github-mark-white.svg";

const NAV_LINKS = [
  { label: "Features", href: "#features", external: false },
  {
    label: "Docs",
    href: "https://shadmin.turtlesocks.dev/docs/install",
    external: true,
  },
  {
    label: "Demo",
    href: "https://shadmin.turtlesocks.dev/demo",
    external: true,
  },
] as const;

const EASE = [0.32, 0.72, 0, 1] as const;

function HamburgerIcon({ open }: { open: boolean }) {
  const reduce = useReducedMotion();
  return (
    <span className="flex h-5 w-5 flex-col justify-between">
      <span
        className={cn(
          "block h-0.5 w-full rounded-full bg-current origin-center transition-transform",
          !reduce && "duration-300",
          open ? "translate-y-[9px] rotate-45" : "",
        )}
        style={!reduce ? { transitionTimingFunction: `cubic-bezier(${EASE.join(",")})` } : {}}
      />
      <span
        className={cn(
          "block h-0.5 w-full rounded-full bg-current transition-opacity",
          !reduce && "duration-300",
          open ? "opacity-0" : "",
        )}
      />
      <span
        className={cn(
          "block h-0.5 w-full rounded-full bg-current origin-center transition-transform",
          !reduce && "duration-300",
          open ? "-translate-y-[9px] -rotate-45" : "",
        )}
        style={!reduce ? { transitionTimingFunction: `cubic-bezier(${EASE.join(",")})` } : {}}
      />
    </span>
  );
}

function MobileOverlay({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-overlay"
          initial={reduce ? false : "hidden"}
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 backdrop-blur-2xl bg-background/80"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.nav
            className="flex flex-col items-center gap-6"
            variants={
              reduce
                ? undefined
                : {
                    visible: {
                      transition: { staggerChildren: 0.07, delayChildren: 0.05 },
                    },
                  }
            }
          >
            {NAV_LINKS.map((link) => (
              <motion.a
                key={link.href}
                href={link.href}
                variants={reduce ? undefined : itemVariants}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                onClick={onClose}
                className="text-2xl font-semibold text-foreground hover:text-aurora transition-colors"
              >
                {link.label}
              </motion.a>
            ))}
          </motion.nav>

          <motion.div
            variants={reduce ? undefined : itemVariants}
            className="flex flex-col items-center gap-4"
          >
            <ThemeToggle />
            <MagneticButton
              href="https://github.com/TurtIeSocks/shadmin"
              external
              variant="aurora"
              icon={false}
            >
              <img
                src={GithubLogo}
                alt=""
                aria-hidden="true"
                className="h-4 w-4"
              />
              Star on GitHub
            </MagneticButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-50 flex justify-center pt-6 px-4 pointer-events-none">
        <header
          className={cn(
            "pointer-events-auto",
            "glass rounded-full py-2 pl-5 pr-2",
            "flex items-center gap-4",
          )}
        >
          {/* Logo + wordmark */}
          <a href="/" aria-label="Home" className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-aurora">
              <Logo className="h-3.5 w-3.5 text-white" />
            </span>
            <span className="text-sm font-bold tracking-tight">shadmin</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <MagneticButton
              href="https://github.com/TurtIeSocks/shadmin"
              external
              variant="aurora"
              icon={false}
            >
              <img
                src={GithubLogo}
                alt=""
                aria-hidden="true"
                className="h-4 w-4"
              />
              Star on GitHub
            </MagneticButton>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden flex size-9 items-center justify-center rounded-full hover:bg-foreground/5 transition-colors text-foreground"
          >
            <HamburgerIcon open={mobileOpen} />
          </button>
        </header>
      </div>

      <MobileOverlay open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
