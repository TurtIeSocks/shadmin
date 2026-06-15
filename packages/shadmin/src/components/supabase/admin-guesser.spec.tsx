import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { exampleSchema } from "@/components/supabase/__fixtures__";

// Mock supabase-js so we don't need real credentials in the test.
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  })),
}));

// Mock ra-supabase-core so we don't need a real Supabase instance. The guesser
// introspects the project's OpenAPI schema at runtime, so a static example
// schema fixture stands in for that response.
const fakeAuth = {
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
  checkError: async () => {},
  getPermissions: async () => null,
};

const fakeData = {
  getList: async () => ({ data: [], total: 0 }),
  getOne: async () => ({ data: { id: 1 } }),
  getMany: async () => ({ data: [] }),
  getManyReference: async () => ({ data: [], total: 0 }),
  update: async () => ({ data: { id: 1 } }),
  updateMany: async () => ({ data: [] }),
  create: async () => ({ data: { id: 1 } }),
  delete: async () => ({ data: { id: 1 } }),
  deleteMany: async () => ({ data: [] }),
};

const fakeMutationResult = {
  mutate: vi.fn(),
  mutateAsync: vi.fn().mockResolvedValue(undefined),
  isPending: false,
  isError: false,
  isSuccess: false,
  error: null,
  data: undefined,
  reset: vi.fn(),
  status: "idle" as const,
  variables: undefined,
  context: undefined,
  isIdle: true,
  submittedAt: 0,
  failureCount: 0,
  failureReason: null,
  isPaused: false,
};

vi.mock("ra-supabase-core", () => ({
  supabaseAuthProvider: () => fakeAuth,
  supabaseDataProvider: () => fakeData,
  useAPISchema: () => ({
    data: exampleSchema,
    error: null,
    isPending: false,
  }),
  useResetPassword: () => [vi.fn(), fakeMutationResult],
  useSetPassword: () => [vi.fn(), fakeMutationResult],
  useSupabaseAccessToken: () => null,
  useRedirectIfAuthenticated: () => {},
}));

import { Basic } from "./admin-guesser.stories";

describe("<AdminGuesser />", () => {
  it("renders the admin layout for the Basic story", async () => {
    const screen = render(<Basic />);
    // With the mocked schema and authProvider, the guesser resolves checkAuth
    // and renders the full Admin layout. Only the static wrapper is asserted —
    // the actual Resource list is data-driven and out of scope here.
    await expect.element(screen.getByRole("main")).toBeInTheDocument();
  });
});
