import * as React from "react";
import { useLogin, useNotify, useTranslate } from "ra-core";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AppleIcon,
  AzureIcon,
  BitbucketIcon,
  DiscordIcon,
  FacebookIcon,
  GithubIcon,
  GitlabIcon,
  GoogleIcon,
  KeycloakIcon,
  LinkedinIcon,
  NotionIcon,
  SlackIcon,
  SpotifyIcon,
  TwitchIcon,
  TwitterIcon,
  WorkosIcon,
} from "./icons";

/**
 * String union of OAuth providers supported by Supabase auth.
 *
 * Mirrors `Provider` from `@supabase/supabase-js` without forcing
 * consumers to install supabase-js to typecheck this kit. If you
 * already depend on `@supabase/supabase-js`, you can pass that
 * package's `Provider` here — it is structurally identical.
 */
export type SupabaseAuthProvider =
  | "apple"
  | "azure"
  | "bitbucket"
  | "discord"
  | "facebook"
  | "github"
  | "gitlab"
  | "google"
  | "keycloak"
  | "linkedin"
  | "notion"
  | "slack"
  | "spotify"
  | "twitch"
  | "twitter"
  | "workos";

export type SocialAuthButtonProps = {
  provider: SupabaseAuthProvider;
  redirect?: string;
} & Omit<React.ComponentProps<typeof Button>, "onClick">;

/**
 * Base button that triggers a Supabase OAuth flow on click.
 *
 * Calls `useLogin({ provider }, redirect ?? window.location.href)`.
 * Suppresses the always-rejecting OAuth promise from ra-supabase's
 * authProvider (which rejects on every OAuth start to prevent
 * premature redirects) — only notifies when an actual `Error.message`
 * is present.
 */
export const SocialAuthButton = ({
  provider,
  redirect,
  className,
  children,
  ...rest
}: SocialAuthButtonProps) => {
  const login = useLogin();
  const notify = useNotify();

  const handleClick = () => {
    login({ provider }, redirect ?? window.location.toString()).catch(
      (error) => {
        // ra-supabase's authProvider rejects with undefined on the
        // initial OAuth call by design. Only notify on real errors.
        if (error) {
          notify((error as Error).message, { type: "error" });
        }
      },
    );
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={cn("w-full justify-start gap-2", className)}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </Button>
  );
};

type ProviderButtonProps = Omit<SocialAuthButtonProps, "provider">;

const providerButton =
  (provider: SupabaseAuthProvider, label: string, Icon: React.ComponentType) =>
  (props: ProviderButtonProps) => {
    const translate = useTranslate();
    const text = translate("ra-supabase.auth.sign_in_with", {
      provider: label,
      _: `Sign in with ${label}`,
    });
    return (
      <SocialAuthButton provider={provider} {...props}>
        <Icon />
        {props.children ?? text}
      </SocialAuthButton>
    );
  };

export const AppleButton = providerButton("apple", "Apple", AppleIcon);
export const AzureButton = providerButton("azure", "Azure", AzureIcon);
export const BitbucketButton = providerButton(
  "bitbucket",
  "Bitbucket",
  BitbucketIcon,
);
export const DiscordButton = providerButton("discord", "Discord", DiscordIcon);
export const FacebookButton = providerButton(
  "facebook",
  "Facebook",
  FacebookIcon,
);
export const GithubButton = providerButton("github", "Github", GithubIcon);
export const GitlabButton = providerButton("gitlab", "Gitlab", GitlabIcon);
export const GoogleButton = providerButton("google", "Google", GoogleIcon);
export const KeycloakButton = providerButton(
  "keycloak",
  "Keycloak",
  KeycloakIcon,
);
export const LinkedInButton = providerButton(
  "linkedin",
  "LinkedIn",
  LinkedinIcon,
);
export const NotionButton = providerButton("notion", "Notion", NotionIcon);
export const SlackButton = providerButton("slack", "Slack", SlackIcon);
export const SpotifyButton = providerButton("spotify", "Spotify", SpotifyIcon);
export const TwitchButton = providerButton("twitch", "Twitch", TwitchIcon);
export const TwitterButton = providerButton("twitter", "Twitter", TwitterIcon);
export const WorkosButton = providerButton("workos", "WorkOS", WorkosIcon);
