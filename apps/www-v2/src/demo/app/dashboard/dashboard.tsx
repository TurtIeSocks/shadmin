import { Count } from "shadmin/components/admin";
import { ResourceContextProvider } from "shadmin-core";
import { Package, ShoppingCart, Star, Tag, Users } from "lucide-react";

interface StatCardProps {
  resource: string;
  label: string;
  icon: React.ReactNode;
  linkTo?: string;
}

function StatCard({ resource, label, icon, linkTo }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <div className="mt-2 text-3xl font-bold">
        <ResourceContextProvider value={resource}>
          <Count link={!!linkTo} />
        </ResourceContextProvider>
      </div>
    </div>
  );
}

/** Real dashboard — stat cards for each core resource. */
export function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your store data.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          resource="customers"
          label="Customers"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          resource="products"
          label="Products"
          icon={<Package className="h-4 w-4" />}
        />
        <StatCard
          resource="orders"
          label="Orders"
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <StatCard
          resource="reviews"
          label="Reviews"
          icon={<Star className="h-4 w-4" />}
        />
        <StatCard
          resource="tags"
          label="Tags"
          icon={<Tag className="h-4 w-4" />}
        />
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Pending Reviews</h2>
        <ResourceContextProvider value="reviews">
          <p className="text-sm text-muted-foreground">
            <Count filter={{ approved: false }} /> reviews awaiting moderation.
          </p>
        </ResourceContextProvider>
      </div>
    </div>
  );
}
