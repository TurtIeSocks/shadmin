// Backwards-compatible re-exports. `AuthCallback` and `AuthError` now live
// in their own files (one component per file) — see `./auth-callback` and
// `./auth-error`. Consumers importing from `@/components/admin/authentication`
// continue to work.
export { AuthCallback } from "@/components/admin/auth-callback";
export { AuthError } from "@/components/admin/auth-error";
export type { AuthErrorProps } from "@/components/admin/auth-error";
