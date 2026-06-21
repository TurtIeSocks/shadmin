import { Link } from "react-router";
import { Brand } from "@/components/brand";

interface DemoLinkProps {
  to: string;
  title: string;
  description: string;
}

function DemoLink({ to, title, description }: DemoLinkProps) {
  return (
    <Link
      to={to}
      className="group flex flex-col gap-2 rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <span className="text-lg font-semibold group-hover:text-primary transition-colors">
        {title}
      </span>
      <span className="text-sm text-muted-foreground">{description}</span>
    </Link>
  );
}

export default function Launcher() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-10 flex flex-col items-center gap-4 text-center">
        <Brand markSize={32} />
        <p className="text-muted-foreground max-w-md">
          Interactive demo — explore the admin app, component gallery, and
          feature showcases.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <DemoLink
          to="/demo/app"
          title="Admin App"
          description="A full working admin with resources, list, edit, and auth."
        />
        <DemoLink
          to="/demo/components"
          title="Components"
          description="Browse every UI primitive and compound component."
        />
        <DemoLink
          to="/demo/features"
          title="Features"
          description="See data grids, forms, filters, and more in context."
        />
      </div>
    </main>
  );
}
