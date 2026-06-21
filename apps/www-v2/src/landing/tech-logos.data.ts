export interface TechLogo {
  label: string;
  src: string;
  /** Render as a theme-adaptive silhouette (brightness-0 dark:invert). */
  silhouette?: boolean;
}

export const techLogos: TechLogo[] = [
  { label: "React", src: "/img/react-logo.svg" },
  { label: "shadcn/ui", src: "/img/shadcn-ui-logo.svg", silhouette: true },
  { label: "Tailwind CSS", src: "/img/tailwind-logo.svg" },
  { label: "Radix UI", src: "/img/radix-ui-logo.svg", silhouette: true },
  {
    label: "React Router",
    src: "/img/react-router-logo.svg",
    silhouette: true,
  },
  { label: "TanStack Query", src: "/img/react-query-logo.svg" },
  { label: "React Hook Form", src: "/img/react-hook-form-logo.svg" },
  { label: "TypeScript", src: "/img/ts-logo.svg" },
];
