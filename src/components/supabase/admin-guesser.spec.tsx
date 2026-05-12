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

// Mock ra-supabase-core so we don't need a real Supabase instance.
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

import { AdminGuesser } from "@/components/supabase/admin-guesser";

describe("<AdminGuesser />", () => {
  it("renders without crashing given instanceUrl and apiKey", async () => {
    const screen = render(
      <AdminGuesser instanceUrl="http://localhost:54321" apiKey="sb_publishable_x" />,
    );
    // The fake checkAuth resolves successfully, so the admin renders
    // the full layout with a main landmark. Assert that it mounted.
    await expect.element(screen.getByRole("main")).toBeInTheDocument();
  });
});
