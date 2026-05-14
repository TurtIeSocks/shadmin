import { CoreAdminContext, memoryStore } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { ThemeProvider } from "@/components/admin/theme-provider";
import { OnboardingTour } from "@/components/admin/onboarding-tour";

export default {
  title: "Navigation/OnboardingTour",
  parameters: { docs: { codePanel: true } },
};

const i18nProvider = polyglotI18nProvider(() => defaultMessages, "en", undefined, {
  allowMissing: true,
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider defaultTheme="system">
    <CoreAdminContext i18nProvider={i18nProvider} store={memoryStore()}>
      <div style={{ width: "600px", height: "400px", position: "relative", padding: "2rem" }}>
        {/* Tour targets */}
        <div
          data-tour="sidebar"
          style={{
            display: "inline-block",
            padding: "8px 16px",
            background: "#f3f4f6",
            borderRadius: "6px",
            marginRight: "12px",
          }}
        >
          Sidebar
        </div>
        <div
          data-tour="search"
          style={{
            display: "inline-block",
            padding: "8px 16px",
            background: "#f3f4f6",
            borderRadius: "6px",
            marginRight: "12px",
          }}
        >
          Search
        </div>
        <div
          data-tour="theme"
          style={{
            display: "inline-block",
            padding: "8px 16px",
            background: "#f3f4f6",
            borderRadius: "6px",
          }}
        >
          Theme
        </div>
        {children}
      </div>
    </CoreAdminContext>
  </ThemeProvider>
);

export const Basic = () => (
  <Wrapper>
    <OnboardingTour
      id="storybook-basic"
      steps={[
        {
          target: '[data-tour="sidebar"]',
          title: "Resources",
          content: "Click any item to navigate.",
        },
        {
          target: '[data-tour="search"]',
          title: "Quick search",
          content: "Press cmd+K to open the palette.",
        },
        {
          target: '[data-tour="theme"]',
          title: "Theme",
          content: "Switch between light and dark.",
        },
      ]}
    />
  </Wrapper>
);

export const CustomPlacement = () => (
  <Wrapper>
    <OnboardingTour
      id="storybook-placement"
      placement="top"
      steps={[
        {
          target: '[data-tour="sidebar"]',
          title: "Resources",
          content: "Tooltip appears above the target.",
        },
        {
          target: '[data-tour="search"]',
          title: "Quick search",
          content: "This one uses right placement.",
          placement: "right",
        },
      ]}
    />
  </Wrapper>
);
