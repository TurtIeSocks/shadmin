import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Notification } from "@/components/admin/notification";

export interface AuthLayoutProps {
  /**
   * Content rendered in the right pane — typically a login, signup or
   * password-reset form.
   */
  children: ReactNode;
  /**
   * Optional heading shown above the right-pane content.
   */
  title?: ReactNode;
  /**
   * Optional subtitle shown below the heading.
   */
  subtitle?: ReactNode;
  /**
   * Extra class names applied to the root wrapper.
   */
  className?: string;
}

/**
 * Page shell for custom authentication flows (login, signup, password reset).
 *
 * Provides a two-column layout with a dark gradient testimonial sidebar on
 * the left and a flexible form area on the right. The right-pane content is
 * passed through `children` so consumers can plug in their own form.
 *
 * Also mounts the `<Notification>` component at the root so error and info
 * messages triggered with `useNotify()` are displayed.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/authlayout/ AuthLayout documentation}
 *
 * @example
 * import { AuthLayout } from "@/components/admin/auth-layout";
 * import { LoginForm } from "@/components/admin/login-form";
 *
 * const CustomLoginPage = () => (
 *   <AuthLayout
 *     title="Sign in"
 *     subtitle="Welcome back to Acme Inc."
 *   >
 *     <LoginForm />
 *   </AuthLayout>
 * );
 */
export const AuthLayout = (props: AuthLayoutProps) => {
  const { children, title, subtitle, className } = props;
  return (
    <div className={cn("min-h-screen flex", className)}>
      <div className="container relative grid flex-col items-center justify-center sm:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            Acme Inc
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;Shadcn Admin Kit has allowed us to quickly create and
                evolve a powerful tool that otherwise would have taken months
                of time and effort to develop.&rdquo;
              </p>
              <footer className="text-sm">John Doe</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            {(title || subtitle) && (
              <div className="flex flex-col space-y-2 text-center">
                {title && (
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-sm leading-none text-muted-foreground">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
      <Notification />
    </div>
  );
};
