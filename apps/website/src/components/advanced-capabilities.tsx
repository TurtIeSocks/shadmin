import { Check } from "lucide-react";
import { GlassPanel } from "@/components/aurora/glass-panel";
import { GradientText } from "@/components/aurora/gradient-text";
import { MagneticButton } from "@/components/aurora/magnetic-button";
import { Reveal } from "@/components/aurora/reveal";
import { Container } from "./container";

const features = [
  {
    name: "Rapid CRUD Generation",
    description: "Automatically generate admin UIs from your API",
  },
  {
    name: "Seamless relationships",
    description: "Combine and display data from multiple resources",
  },
  {
    name: "Roles & permissions",
    description: "Manage user access with fine-grained control",
  },
  {
    name: "Optimistic UI",
    description: "A snappy, native-app experience, even on slow networks",
  },
  {
    name: "Undo Functionality",
    description: "Allows users to instantly revert any changes",
  },
  {
    name: "Bulk Actions",
    description: "Select and modify multiple records at once",
  },
  {
    name: "User preferences",
    description: "Automatically saves and restores user settings and filters",
  },
  {
    name: "Fully customizable",
    description: "Modify components directly in your source code",
  },
];

export function AdvancedCapabilities() {
  return (
    <section
      id="advanced-capabilities"
      aria-label="Shadmin Advanced Capabilities"
      className="py-24 md:py-32"
    >
      <Container>
        <Reveal className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: copy + list + CTA */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Advanced <GradientText>Capabilities</GradientText>
              </h2>
              <p className="text-lg leading-8 text-muted-foreground">
                Beyond the basics, Shadmin offers sophisticated features to
                reduce development costs and enhance the developer experience.
              </p>
            </div>

            <dl className="space-y-3">
              {features.map((feature) => (
                <div key={feature.name} className="flex gap-3 items-start">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-aurora">
                    <Check aria-hidden="true" className="size-3 text-white" />
                  </span>
                  <div>
                    <dt className="inline font-semibold text-foreground">
                      {feature.name}
                    </dt>
                    <dd className="inline text-muted-foreground">
                      {" "}
                      — {feature.description}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>

            <div>
              <MagneticButton
                href="https://shadmin.turtlesocks.dev/docs/install"
                external
                variant="aurora"
              >
                Learn More
              </MagneticButton>
            </div>
          </div>

          {/* Right: data-table mockup (wrapper div keeps the panel hugging its
              content instead of stretching to the tall feature list) */}
          <div>
            <GlassPanel bezel>
              <div className="rounded-[calc(2rem-0.5rem)] overflow-hidden bg-background/60 border border-border text-xs">
                {/* App window header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="font-semibold text-sm text-foreground">
                    Orders
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">3 selected</span>
                    <span className="px-2 py-0.5 rounded border border-border text-muted-foreground cursor-default">
                      Filter
                    </span>
                    <span className="px-2 py-0.5 rounded border border-border text-muted-foreground cursor-default">
                      Export
                    </span>
                  </div>
                </div>

                {/* Table */}
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-foreground/5">
                      <th className="w-8 px-3 py-2 text-left">
                        <span
                          className="inline-flex size-3.5 items-center justify-center rounded border border-border bg-aurora"
                          aria-hidden="true"
                        />
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                        Customer
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                        Product
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Selected rows */}
                    {[
                      {
                        initials: "AK",
                        name: "Alice Kim",
                        product: "Pro Plan",
                        status: "Approved",
                        statusColor: "#22c55e",
                        selected: true,
                      },
                      {
                        initials: "BM",
                        name: "Ben Moss",
                        product: "Starter",
                        status: "Approved",
                        statusColor: "#22c55e",
                        selected: true,
                      },
                      {
                        initials: "CS",
                        name: "Clara Sol",
                        product: "Enterprise",
                        status: "Pending",
                        statusColor: "#f59e0b",
                        selected: true,
                      },
                      {
                        initials: "DT",
                        name: "Dan Tran",
                        product: "Pro Plan",
                        status: "Pending",
                        statusColor: "#f59e0b",
                        selected: false,
                      },
                      {
                        initials: "EL",
                        name: "Eva Lee",
                        product: "Starter",
                        status: "Rejected",
                        statusColor: "#ef4444",
                        selected: false,
                      },
                    ].map((row) => (
                      <tr
                        key={row.name}
                        className={
                          row.selected
                            ? "bg-foreground/5 border-b border-border"
                            : "border-b border-border"
                        }
                      >
                        <td className="px-3 py-2.5">
                          <span
                            className={`inline-flex size-3.5 items-center justify-center rounded border ${row.selected ? "bg-aurora border-transparent" : "border-border bg-transparent"}`}
                            aria-hidden="true"
                          >
                            {row.selected && (
                              <svg
                                viewBox="0 0 8 8"
                                className="size-2 text-white fill-current"
                                aria-hidden="true"
                              >
                                <path
                                  d="M1 4l2 2 4-4"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground/10 font-medium text-foreground"
                              style={{ fontSize: "0.6rem" }}
                            >
                              {row.initials}
                            </span>
                            <span className="text-foreground font-medium">
                              {row.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">
                          {row.product}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className="size-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: row.statusColor }}
                              aria-hidden="true"
                            />
                            <span className="text-foreground">
                              {row.status}
                            </span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Bulk action bar */}
                <div className="flex items-center gap-3 px-4 py-2.5 border-t border-border bg-foreground/5">
                  <span className="text-muted-foreground">3 selected</span>
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded text-xs font-medium bg-aurora text-white cursor-default"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded text-xs font-medium border border-border text-muted-foreground cursor-default"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </GlassPanel>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
