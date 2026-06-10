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
type SupabaseAuthProvider =
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

interface SocialAuthButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "onClick"
> {
  provider: SupabaseAuthProvider;
  redirect?: string;
}

/**
 * Base button that triggers a Supabase OAuth flow on click.
 *
 * Calls `useLogin({ provider }, redirect ?? window.location.href)`.
 * Suppresses the always-rejecting OAuth promise from ra-supabase's
 * authProvider (which rejects on every OAuth start to prevent
 * premature redirects) — only notifies when an actual `Error.message`
 * is present.
 */
const SocialAuthButton = ({
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

const AppleButton = providerButton("apple", "Apple", AppleIcon);
const AzureButton = providerButton("azure", "Azure", AzureIcon);
const BitbucketButton = providerButton(
  "bitbucket",
  "Bitbucket",
  BitbucketIcon,
);
const DiscordButton = providerButton("discord", "Discord", DiscordIcon);
const FacebookButton = providerButton(
  "facebook",
  "Facebook",
  FacebookIcon,
);
const GithubButton = providerButton("github", "Github", GithubIcon);
const GitlabButton = providerButton("gitlab", "Gitlab", GitlabIcon);
const GoogleButton = providerButton("google", "Google", GoogleIcon);
const KeycloakButton = providerButton(
  "keycloak",
  "Keycloak",
  KeycloakIcon,
);
const LinkedInButton = providerButton(
  "linkedin",
  "LinkedIn",
  LinkedinIcon,
);
const NotionButton = providerButton("notion", "Notion", NotionIcon);
const SlackButton = providerButton("slack", "Slack", SlackIcon);
const SpotifyButton = providerButton("spotify", "Spotify", SpotifyIcon);
const TwitchButton = providerButton("twitch", "Twitch", TwitchIcon);
const TwitterButton = providerButton("twitter", "Twitter", TwitterIcon);
const WorkosButton = providerButton("workos", "WorkOS", WorkosIcon);

export { type SupabaseAuthProvider, type SocialAuthButtonProps, SocialAuthButton, AppleButton, AzureButton, BitbucketButton, DiscordButton, FacebookButton, GithubButton, GitlabButton, GoogleButton, KeycloakButton, LinkedInButton, NotionButton, SlackButton, SpotifyButton, TwitchButton, TwitterButton, WorkosButton };
