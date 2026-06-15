import { Container } from "./Container";
import { GlassPanel } from "./aurora/GlassPanel";
import { GradientText } from "./aurora/GradientText";
import { Reveal, RevealItem } from "./aurora/Reveal";

export function ByDevelopers() {
  return (
    <section aria-label="Built by developers" className="py-24 md:py-32">
      <Container>
        <Reveal className="grid grid-cols-1 gap-x-16 gap-y-12 items-center lg:grid-cols-2">
          <RevealItem className="max-w-md mx-auto lg:mx-0">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
              Built by developers{" "}
              <GradientText>for developers</GradientText>
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Composability, separation of concerns, clean code, strong typing
              and smart auto-completion ensure a pleasant DX.
            </p>
          </RevealItem>
          <RevealItem>
            <GlassPanel bezel className="overflow-hidden">
              <div className="rounded-[calc(2rem-0.5rem)] overflow-hidden bg-background/70 border border-border">
                {/* Title bar */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-foreground/5">
                  <div className="flex items-center gap-1.5">
                    <span className="size-3 rounded-full" style={{ backgroundColor: "#ed6a5e" }} aria-hidden="true" />
                    <span className="size-3 rounded-full" style={{ backgroundColor: "#f4bf4f" }} aria-hidden="true" />
                    <span className="size-3 rounded-full" style={{ backgroundColor: "#61c554" }} aria-hidden="true" />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground ml-2">App.tsx</span>
                </div>

                {/* Code block */}
                <pre className="font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto p-4 text-muted-foreground">
                  <code>
                    <span style={{ color: "#7f77dd" }}>{"import"}</span>
                    {" { "}
                    <span className="text-foreground">{"Admin, Resource"}</span>
                    {" } "}
                    <span style={{ color: "#7f77dd" }}>{"from"}</span>
                    {" "}
                    <span style={{ color: "#1d9e75" }}>{'"shadmin"'}</span>
                    {";\n\n"}
                    <span style={{ color: "#7f77dd" }}>{"export const"}</span>
                    {" "}
                    <span className="text-foreground">{"App"}</span>
                    {" = () => (\n  "}
                    <span style={{ color: "#d4537e" }}>{"<Admin"}</span>
                    {" "}
                    <span className="text-foreground">{"dataProvider"}</span>
                    {"={"}
                    <span className="text-foreground">{"dataProvider"}</span>
                    {"}"}
                    <span style={{ color: "#d4537e" }}>{">"}</span>
                    {"\n    "}
                    <span style={{ color: "#d4537e" }}>{"<Resource"}</span>
                    {" "}
                    <span className="text-foreground">{"name"}</span>
                    {"="}
                    <span style={{ color: "#1d9e75" }}>{'"products"'}</span>
                    {" "}
                    <span className="text-foreground">{"list"}</span>
                    {"={"}
                    <span className="text-foreground">{"ProductList"}</span>
                    {"} "}
                    <span className="text-foreground">{"edit"}</span>
                    {"={"}
                    <span className="text-foreground">{"ProductEdit"}</span>
                    {"} "}
                    <span style={{ color: "#d4537e" }}>{"/>"}</span>
                    {"\n    "}
                    <span style={{ color: "#d4537e" }}>{"<Resource"}</span>
                    {" "}
                    <span className="text-foreground">{"name"}</span>
                    {"="}
                    <span style={{ color: "#1d9e75" }}>{'"orders"'}</span>
                    {" "}
                    <span className="text-foreground">{"list"}</span>
                    {"={"}
                    <span className="text-foreground">{"OrderList"}</span>
                    {"} "}
                    <span style={{ color: "#d4537e" }}>{"/>"}</span>
                    {"\n  "}
                    <span style={{ color: "#d4537e" }}>{"</Admin>"}</span>
                    {"\n);\n"}
                  </code>
                </pre>
              </div>
            </GlassPanel>
          </RevealItem>
        </Reveal>
      </Container>
    </section>
  );
}
