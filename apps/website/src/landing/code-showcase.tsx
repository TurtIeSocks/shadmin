import { ShikiHighlighter } from "react-shiki";
import { SHIKI_THEME } from "@/lib/shiki-theme";
import { Reveal } from "./reveal";
import { Heading, Lead, Section } from "./section";
import { BezelPanel } from "./section";
import { WindowChrome } from "./window-chrome";

const APP_TSX = `import { Admin, Resource } from "shadmin";

export const App = () => (
  <Admin dataProvider={dataProvider}>
    <Resource name="products" list={ProductList} edit={ProductEdit} />
    <Resource name="orders" list={OrderList} />
  </Admin>
);
`;

/** "Built by developers for developers" split: copy beside a syntax-highlighted App.tsx. */
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

        {/* Code — same react-shiki highlighting as the docs/demo code blocks
            (SHIKI_THEME: light-plus / dark-plus, transparent over the card). */}
        <Reveal delay={0.1}>
          <BezelPanel>
            <WindowChrome title="App.tsx">
              <div className="overflow-x-auto text-sm leading-relaxed">
                <ShikiHighlighter
                  language="tsx"
                  theme={SHIKI_THEME}
                  addDefaultStyles={false}
                  className="!bg-transparent p-5"
                >
                  {APP_TSX}
                </ShikiHighlighter>
              </div>
            </WindowChrome>
          </BezelPanel>
        </Reveal>
      </div>
    </Section>
  );
}
