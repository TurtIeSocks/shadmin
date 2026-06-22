import type { AuthProvider } from "shadmin-core";

const STORAGE_KEY = "demo_auth";

interface StoredAuth {
  username: string;
}

export const authProvider: AuthProvider = {
  login({ username }: { username: string; password?: string }) {
    if (username !== "demo") {
      return Promise.reject(
        new Error("Invalid credentials. Use username: demo"),
      );
    }
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ username } satisfies StoredAuth),
    );
    return Promise.resolve();
  },

  logout() {
    localStorage.removeItem(STORAGE_KEY);
    return Promise.resolve();
  },

  checkAuth() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return Promise.reject(new Error("Not authenticated"));
    return Promise.resolve();
  },

  checkError(error: { status?: number }) {
    if (error?.status === 401 || error?.status === 403) {
      localStorage.removeItem(STORAGE_KEY);
      return Promise.reject(new Error("Session expired"));
    }
    return Promise.resolve();
  },

  getIdentity() {
    return Promise.resolve({
      id: "demo",
      fullName: "Demo User",
    });
  },

  getPermissions() {
    return Promise.resolve(null);
  },
};
