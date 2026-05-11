import { AuthLayout } from "@/components/admin/auth-layout";
import { LoginForm } from "@/components/admin/login-form";

/**
 * Login page displayed when authentication is enabled and the user is not
 * authenticated.
 *
 * Automatically shown when an unauthenticated user tries to access a
 * protected route. Composes `<AuthLayout>` (two-column gradient shell with a
 * notification toaster) and `<LoginForm>` (email + password form wired to
 * `authProvider.login()`).
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/loginpage LoginPage documentation}
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/security Security documentation}
 */
export const LoginPage = (props: { redirectTo?: string }) => {
  const { redirectTo } = props;
  return (
    <AuthLayout title="Sign in" subtitle="Try janedoe@acme.com / password">
      <LoginForm redirectTo={redirectTo} />
    </AuthLayout>
  );
};
