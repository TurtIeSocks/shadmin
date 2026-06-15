import { MemoryRouter } from "react-router";
import { Link, ThemeProvider } from "@/components/admin";

export default {
  title: "UI & Layout/Link",
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
      <Link to="https://shadmin.turtlesocks.dev" target="_blank">
        Shadmin docs
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
