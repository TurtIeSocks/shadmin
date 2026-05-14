import * as React from "react";
import type { ReactNode } from "react";
import { useTranslate } from "ra-core";
import { Separator } from "@/components/ui/separator";
import { AuthLayout } from "@/components/admin/auth-layout";
import { SupabaseLoginForm } from "./login-form";
import {
  AppleButton,
  AzureButton,
  BitbucketButton,
  DiscordButton,
  FacebookButton,
  GithubButton,
  GitlabButton,
  GoogleButton,
  KeycloakButton,
  LinkedInButton,
  NotionButton,
  SlackButton,
  SpotifyButton,
  type SupabaseAuthProvider,
  TwitchButton,
  TwitterButton,
  WorkosButton,
} from "./social-auth-button";

export interface SupabaseLoginPageProps {
  children?: ReactNode;
  disableEmailPassword?: boolean;
  disableForgotPassword?: boolean;
  /**
   * Optional content for `<AuthLayout>`'s left pane. Pass any ReactNode
   * to opt into a two-column split-screen; omit for centered single-column.
   */
  aside?: ReactNode;
  providers?: SupabaseAuthProvider[];
  redirectTo?: string;
}

const providerButtons: Record<
  SupabaseAuthProvider,
  React.ComponentType<{ children?: ReactNode }>
> = {
  apple: AppleButton,
  azure: AzureButton,
  bitbucket: BitbucketButton,
  discord: DiscordButton,
  facebook: FacebookButton,
  github: GithubButton,
  gitlab: GitlabButton,
  google: GoogleButton,
  keycloak: KeycloakButton,
  linkedin: LinkedInButton,
  notion: NotionButton,
  slack: SlackButton,
  spotify: SpotifyButton,
  twitch: TwitchButton,
  twitter: TwitterButton,
  workos: WorkosButton,
};

/**
 * Supabase-flavored sign-in page composed with the kit's `<AuthLayout>`.
 * Renders email/password by default and optionally a stack of social
 * provider buttons.
 *
 * Pass `children` to fully replace the form-pane content. Pass `aside`
 * for a split-screen layout with custom marketing content.
 */
export const SupabaseLoginPage = (props: SupabaseLoginPageProps) => {
  const {
    children,
    disableEmailPassword = false,
    disableForgotPassword = false,
    aside,
    providers = [],
    redirectTo,
  } = props;
  const translate = useTranslate();

  return (
    <AuthLayout
      title={translate("ra.auth.sign_in", { _: "Sign in" })}
      aside={aside}
    >
      {children ?? (
        <>
          {!disableEmailPassword && (
            <SupabaseLoginForm
              disableForgotPassword={disableForgotPassword}
              redirectTo={redirectTo}
            />
          )}
          {!disableEmailPassword && providers.length > 0 && (
            <div className="flex items-center gap-2">
              <Separator className="flex-1" />
              <span className="text-xs uppercase text-muted-foreground">
                {translate("ra.auth.or", { _: "or" })}
              </span>
              <Separator className="flex-1" />
            </div>
          )}
          {providers.length > 0 && (
            <div className="flex flex-col gap-2">
              {providers.map((provider) => {
                const Button = providerButtons[provider];
                return Button ? <Button key={provider} /> : null;
              })}
            </div>
          )}
        </>
      )}
    </AuthLayout>
  );
};

SupabaseLoginPage.path = "/login";
