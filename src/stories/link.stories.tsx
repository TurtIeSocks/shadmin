import { MemoryRouter } from "react-router";
import { Link, ThemeProvider } from "@/components/admin";

export default {
  title: "Navigation/Link",
};

export const Basic = () => (
  <ThemeProvider>
    <MemoryRouter>
      <Link to="/posts/1">View post</Link>
    </MemoryRouter>
  </ThemeProvider>
);

export const External = () => (
  <ThemeProvider>
    <MemoryRouter>
      <Link to="https://marmelab.com/shadcn-admin-kit" target="_blank">
        Shadcn Admin Kit docs
      </Link>
    </MemoryRouter>
  </ThemeProvider>
);

export const CustomClass = () => (
  <ThemeProvider>
    <MemoryRouter>
      <Link to="/posts/1" className="text-destructive">
        Danger zone
      </Link>
    </MemoryRouter>
  </ThemeProvider>
);
