export function Footer() {
  return (
    <footer className="glass border-t border-border/40">
      <div className="mx-auto max-w-7xl px-6 py-8 md:flex md:items-center md:justify-between lg:px-8">
        {/* Left: logo dot + wordmark */}
        <div className="flex items-center gap-2.5 justify-center md:justify-start">
          <span className="bg-aurora size-3 rounded-full" aria-hidden="true" />
          <span className="text-sm font-semibold tracking-tight text-foreground">
            shadmin
          </span>
        </div>

        {/* Center-ish: nav links */}
        <nav className="flex justify-center gap-6 mt-4 md:mt-0">
          <a
            href="https://github.com/TurtIeSocks/shadmin"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <img
              src="/img/github-mark-white.svg"
              alt=""
              aria-hidden="true"
              className="size-4 opacity-70"
            />
            GitHub
          </a>
          <a
            href="https://shadmin.turtlesocks.dev/docs/install"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Docs
          </a>
          <a
            href="https://shadmin.turtlesocks.dev/demo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Demo
          </a>
        </nav>

        {/* Right: copyright */}
        <p className="mt-4 md:mt-0 text-center md:text-right text-xs leading-5 text-muted-foreground">
          &copy; 2026 Shadmin. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
