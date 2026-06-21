import { Reveal, RevealItem } from "./reveal";
import { Heading, Lead, Section } from "./section";
import { WindowChrome } from "./window-chrome";

// Syntax tint palette (works on a dark code surface in both themes).
const kw = "text-[#a78bfa]"; // keywords — brand violet
const str = "text-[#34d399]"; // strings — green
const tag = "text-[#f472b6]"; // JSX tags — pink
const attr = "text-[#7dd3fc]"; // attributes — sky
const punct = "text-zinc-500";

export function CodeShowcase() {
  return (
    <Section>
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Copy */}
        <Reveal>
          <Heading>
            Built by developers{" "}
            <span className="text-brand-gradient">for developers</span>
          </Heading>
          <Lead>
            Composability, separation of concerns, clean code, strong typing and
            smart auto-completion ensure a pleasant DX.
          </Lead>
        </Reveal>

        {/* Code */}
        <Reveal delay={0.1}>
          <RevealItem className="rounded-2xl bg-muted/40 p-1.5 ring-1 ring-border/60">
            <WindowChrome title="App.tsx">
              <pre className="overflow-x-auto bg-zinc-950 p-5 font-mono text-sm leading-relaxed text-zinc-100">
                <code>
                  <span className={kw}>import</span> {"{ "}
                  <span className="text-zinc-100">Admin, Resource</span>
                  {" }"} <span className={kw}>from</span>{" "}
                  <span className={str}>&quot;shadmin&quot;</span>
                  <span className={punct}>;</span>
                  {"\n\n"}
                  <span className={kw}>export const</span>{" "}
                  <span className="text-zinc-100">App</span>{" "}
                  <span className={punct}>= () =&gt; (</span>
                  {"\n  "}
                  <span className={punct}>&lt;</span>
                  <span className={tag}>Admin</span>{" "}
                  <span className={attr}>dataProvider</span>
                  <span className={punct}>=</span>
                  <span className={punct}>{"{"}</span>
                  <span className="text-zinc-100">dataProvider</span>
                  <span className={punct}>{"}"}</span>
                  <span className={punct}>&gt;</span>
                  {"\n    "}
                  <span className={punct}>&lt;</span>
                  <span className={tag}>Resource</span>{" "}
                  <span className={attr}>name</span>
                  <span className={punct}>=</span>
                  <span className={str}>&quot;products&quot;</span>{" "}
                  <span className={attr}>list</span>
                  <span className={punct}>=</span>
                  <span className={punct}>{"{"}</span>
                  <span className="text-zinc-100">ProductList</span>
                  <span className={punct}>{"}"}</span>{" "}
                  <span className={attr}>edit</span>
                  <span className={punct}>=</span>
                  <span className={punct}>{"{"}</span>
                  <span className="text-zinc-100">ProductEdit</span>
                  <span className={punct}>{"}"}</span>{" "}
                  <span className={punct}>/&gt;</span>
                  {"\n    "}
                  <span className={punct}>&lt;</span>
                  <span className={tag}>Resource</span>{" "}
                  <span className={attr}>name</span>
                  <span className={punct}>=</span>
                  <span className={str}>&quot;orders&quot;</span>{" "}
                  <span className={attr}>list</span>
                  <span className={punct}>=</span>
                  <span className={punct}>{"{"}</span>
                  <span className="text-zinc-100">OrderList</span>
                  <span className={punct}>{"}"}</span>{" "}
                  <span className={punct}>/&gt;</span>
                  {"\n  "}
                  <span className={punct}>&lt;/</span>
                  <span className={tag}>Admin</span>
                  <span className={punct}>&gt;</span>
                  {"\n"}
                  <span className={punct}>);</span>
                </code>
              </pre>
            </WindowChrome>
          </RevealItem>
        </Reveal>
      </div>
    </Section>
  );
}
