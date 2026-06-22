import {
  BicepsFlexed,
  GraduationCap,
  LayoutPanelLeft,
  LockOpen,
  Plug,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface WhyReason {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const whyReasons: WhyReason[] = [
  {
    title: "Get a head start",
    description:
      "Kickstart your project with pre-built components — no need to reinvent the wheel.",
    icon: LayoutPanelLeft,
  },
  {
    title: "Battle-tested foundation",
    description:
      "Built on the battle-tested ra-core foundation — a rich library of hooks maintained by experienced open-source developers.",
    icon: GraduationCap,
  },
  {
    title: "Headless",
    description:
      "Based on ra-core, a rich library of hooks that can be used with any React component.",
    icon: Plug,
  },
  {
    title: "No lock-in",
    description:
      "The code is open-source. Host it anywhere with zero hidden costs.",
    icon: LockOpen,
  },
  {
    title: "Industry best practices",
    description:
      "Responsive design, accessibility, and performance are built-in.",
    icon: BicepsFlexed,
  },
  {
    title: "AI ready",
    description: "Shadmin comes with an MCP server.",
    icon: Sparkles,
  },
];
