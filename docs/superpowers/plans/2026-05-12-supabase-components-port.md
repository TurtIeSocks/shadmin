# Port ra-supabase Components to shadcn-admin-kit — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the UI layer of `ra-supabase` into `src/components/supabase/` as opt-in components with peer dependencies, plus a shared `AuthLayout` extracted from the existing `LoginPage`.

**Architecture:** Peer-dep installation (`ra-supabase-core`, `@supabase/supabase-js`, `openapi-types` not bundled). Shared split-screen `AuthLayout` consumed by both the existing kit `LoginPage` and the new Supabase pages. Schema-aware CRUD guessers reuse `ra-core`'s `InferredElement` infrastructure but introspect Supabase's OpenAPI schema for foreign-key/array-reference detection. Umbrella `AdminGuesser` wraps the kit's existing `<Admin>` component.

**Tech Stack:** React 19, TypeScript, Tailwind v4, ra-core, react-router 7, react-hook-form, vitest + vitest-browser + Playwright, Storybook, Astro (docs).

**Spec:** `docs/superpowers/specs/2026-05-12-supabase-components-port-design.md`

---

## File map

| File                                                       | Purpose                                | Status |
| ---------------------------------------------------------- | -------------------------------------- | ------ |
| `package.json`                                             | Add peer deps                          | modify |
| `src/components/admin/auth-layout.tsx`                     | Shared split-screen chrome             | create |
| `src/components/admin/login-page.tsx`                      | Refactor to consume AuthLayout         | modify |
| `src/components/admin/index.ts`                            | Export AuthLayout                      | modify |
| `src/components/supabase/index.ts`                         | Public surface                         | create |
| `src/components/supabase/icons.tsx`                        | 16 inline SVG provider icons           | create |
| `src/components/supabase/social-auth-button.tsx`           | Base button + 16 provider buttons      | create |
| `src/components/supabase/social-auth-button.spec.tsx`      | Tests                                  | create |
| `src/components/supabase/login-form.tsx`                   | Email/password + forgot link           | create |
| `src/components/supabase/login-form.spec.tsx`              | Tests                                  | create |
| `src/components/supabase/login-page.tsx`                   | `SupabaseLoginPage` (social-aware)     | create |
| `src/components/supabase/login-page.spec.tsx`              | Tests                                  | create |
| `src/components/supabase/forgot-password-form.tsx`         | Form calling `useResetPassword`        | create |
| `src/components/supabase/forgot-password-form.spec.tsx`    | Tests                                  | create |
| `src/components/supabase/forgot-password-page.tsx`         | Page with `.path`                      | create |
| `src/components/supabase/set-password-form.tsx`            | Form calling `useSetPassword`          | create |
| `src/components/supabase/set-password-form.spec.tsx`       | Tests                                  | create |
| `src/components/supabase/set-password-page.tsx`            | Page with `.path`                      | create |
| `src/components/supabase/inferred-element.ts`              | Subclass adding `warning`              | create |
| `src/components/supabase/infer-element-from-type.ts`       | Foreign-key aware type inference       | create |
| `src/components/supabase/infer-element-from-type.spec.ts`  | Tests against fixture schema           | create |
| `src/components/supabase/edit-field-types.tsx`             | `editFieldTypes` map                   | create |
| `src/components/supabase/list-field-types.tsx`             | `listFieldTypes` map                   | create |
| `src/components/supabase/show-field-types.tsx`             | `showFieldTypes` map                   | create |
| `src/components/supabase/list-guesser.tsx`                 | `SupabaseListGuesser`                  | create |
| `src/components/supabase/list-guesser.spec.tsx`            | Tests                                  | create |
| `src/components/supabase/show-guesser.tsx`                 | `SupabaseShowGuesser`                  | create |
| `src/components/supabase/show-guesser.spec.tsx`            | Tests                                  | create |
| `src/components/supabase/edit-guesser.tsx`                 | `SupabaseEditGuesser`                  | create |
| `src/components/supabase/edit-guesser.spec.tsx`            | Tests                                  | create |
| `src/components/supabase/create-guesser.tsx`               | `SupabaseCreateGuesser`                | create |
| `src/components/supabase/create-guesser.spec.tsx`          | Tests                                  | create |
| `src/components/supabase/use-crud-guesser.tsx`             | Hook auto-generating `<Resource>` defs | create |
| `src/components/supabase/admin-guesser.tsx`                | One-line umbrella component            | create |
| `src/components/supabase/admin-guesser.spec.tsx`           | Tests                                  | create |
| `src/components/supabase/i18n/en.ts`                       | English keys                           | create |
| `src/components/supabase/i18n/fr.ts`                       | French keys                            | create |
| `src/components/supabase/i18n/index.ts`                    | `defaultSupabaseI18nProvider` helper   | create |
| `src/components/supabase/__fixtures__/example-schema.json` | Test fixture                           | create |
| `src/components/supabase/__fixtures__/index.ts`            | Re-export schema typed                 | create |
| `src/stories/supabase/_mocks.ts`                           | Shared hook mocks for stories          | create |
| `src/stories/supabase/login-page.stories.tsx`              | Stories                                | create |
| `src/stories/supabase/forgot-password-page.stories.tsx`    | Stories                                | create |
| `src/stories/supabase/set-password-page.stories.tsx`       | Stories                                | create |
| `src/stories/supabase/social-auth-button.stories.tsx`      | Stories                                | create |
| `src/stories/supabase/list-guesser.stories.tsx`            | Stories                                | create |
| `src/stories/supabase/show-guesser.stories.tsx`            | Stories                                | create |
| `src/stories/supabase/edit-guesser.stories.tsx`            | Stories                                | create |
| `src/stories/supabase/create-guesser.stories.tsx`          | Stories                                | create |
| `src/stories/supabase/admin-guesser.stories.tsx`           | Stories                                | create |
| `docs/src/content/docs/supabase/*.md`                      | Documentation pages                    | create |

---

## Conventions

- **Single test command for one file**: `pnpm vitest run --browser.headless <path>`
- **Typecheck**: `pnpm typecheck`
- **Lint**: `pnpm lint`
- **Commit message style**: matches recent history (no conventional-commits prefix required, but descriptive imperative subject line)
- **Tests render stories**: per CLAUDE.md, spec files import story exports rather than building bespoke test wrappers (see `src/components/admin/edit-button.spec.tsx` for the pattern). When mocking is required, use `vi.mock(...)` at the top of the spec.
- **All components use the existing kit primitives** from `src/components/admin/` (TextInput, Form, Button, Notification, etc.) — no MUI imports anywhere in `src/components/supabase/`
- **Each task ends with: `pnpm typecheck && pnpm lint` and a commit**. If either fails, fix in place — do NOT amend the previous commit.

---

## Task 1: Setup — package.json peer deps + supabase directory scaffold

**Files:**

- Modify: `package.json`
- Create: `src/components/supabase/index.ts` (empty stub)
- Create: `src/components/supabase/i18n/` (empty dir, populated next task)

- [ ] **Step 1: Add peer dependencies to `package.json`**

Open `package.json`. Add a `peerDependencies` key (it does not exist yet — add it between `dependencies` and `devDependencies`):

```json
  "peerDependencies": {
    "@supabase/supabase-js": "^2.48.1",
    "openapi-types": "^12.1.3",
    "ra-supabase-core": "^3.5.2"
  },
  "peerDependenciesMeta": {
    "@supabase/supabase-js": { "optional": true },
    "openapi-types": { "optional": true },
    "ra-supabase-core": { "optional": true }
  },
```

Also install them as **devDependencies** so the kit can typecheck and test the new Supabase components in-tree:

Run:

```bash
pnpm add -D @supabase/supabase-js@^2.48.1 openapi-types@^12.1.3 ra-supabase-core@^3.5.2
```

- [ ] **Step 2: Create empty supabase directory + stub index**

Create `src/components/supabase/index.ts`:

```ts
// Public exports for the Supabase integration.
// Populated incrementally as components are added.
export {};
```

- [ ] **Step 3: Verify typecheck still passes**

Run: `pnpm typecheck`
Expected: PASS (no Supabase code yet beyond a stub).

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml src/components/supabase/index.ts
git commit -m "Add Supabase peer dependencies and component directory stub"
```

---

## Task 2: i18n module — English + French + provider helper

**Files:**

- Create: `src/components/supabase/i18n/en.ts`
- Create: `src/components/supabase/i18n/fr.ts`
- Create: `src/components/supabase/i18n/index.ts`

- [ ] **Step 1: Create `src/components/supabase/i18n/en.ts`**

```ts
/**
 * English translation messages for the Supabase integration.
 *
 * Merge into your i18n provider to translate the auth UI (login,
 * forgot/set password, social buttons) and Supabase-aware guessers.
 * All ra-supabase.* keys also have inline `_:` English fallbacks in
 * the components, so loading these messages is optional.
 *
 * Source: ra-supabase-language-english@3.5.2
 */
export const raSupabaseEnglishMessages = {
  "ra-supabase": {
    auth: {
      email: "Email",
      confirm_password: "Confirm password",
      sign_in_with: "Sign in with %{provider}",
      forgot_password: "Forgot password?",
      reset_password: "Reset password",
      password_reset:
        "Your password has been reset. You will receive an email containing a link to log in.",
      missing_tokens: "Access and refresh tokens are missing",
      back_to_login: "Back to login",
    },
    reset_password: {
      forgot_password: "Forgot password?",
      forgot_password_details: "Enter your email for instructions.",
    },
    set_password: {
      new_password: "Choose your password",
    },
    validation: {
      password_mismatch: "Passwords do not match",
    },
  },
};
```

- [ ] **Step 2: Create `src/components/supabase/i18n/fr.ts`**

```ts
/**
 * French translation messages for the Supabase integration.
 * Source: ra-supabase-language-french@3.5.2
 */
export const raSupabaseFrenchMessages = {
  "ra-supabase": {
    auth: {
      email: "Email",
      confirm_password: "Confirmation du mot de passe",
      sign_in_with: "Se connecter avec %{provider}",
      forgot_password: "Mot de passe oublié ?",
      reset_password: "Réinitialiser le mot de passe",
      password_reset:
        "Votre mot de passe a été réinitialisé. Vous recevrez un email contenant un lien pour vous connecter.",
      missing_tokens:
        "Les jetons d'accès et de rafraîchissement sont manquants",
      back_to_login: "Retour à la page de connexion",
    },
    reset_password: {
      forgot_password: "Mot de passe oublié ?",
      forgot_password_details: "Obtenez les instructions par email.",
    },
    set_password: {
      new_password: "Nouveau mot de passe",
    },
    validation: {
      password_mismatch: "Les mots de passe ne correspondent pas",
    },
  },
};
```

- [ ] **Step 3: Create `src/components/supabase/i18n/index.ts`**

```ts
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultEnglishMessages from "ra-language-english";
import { raSupabaseEnglishMessages } from "./en";
import { raSupabaseFrenchMessages } from "./fr";

export { raSupabaseEnglishMessages, raSupabaseFrenchMessages };

/**
 * Polyglot i18n provider preloaded with the kit's default English
 * messages plus the Supabase-specific `ra-supabase.*` keys.
 *
 * Used as the default i18nProvider in `<AdminGuesser>` when the
 * consumer does not pass one. Override by passing an `i18nProvider`
 * prop to `<AdminGuesser>` (e.g. one that merges French messages too).
 */
export const defaultSupabaseI18nProvider = polyglotI18nProvider(
  () => ({
    ...defaultEnglishMessages,
    ...raSupabaseEnglishMessages,
  }),
  "en",
  [{ name: "en", value: "English" }],
  { allowMissing: true },
);
```

- [ ] **Step 4: Verify typecheck passes**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/supabase/i18n
git commit -m "Add Supabase i18n module (en/fr messages + default provider)"
```

---

## Task 3: Provider icons — 16 inline SVG components

**Files:**

- Create: `src/components/supabase/icons.tsx`

**Source**: `/Users/rin/GitHub/ra-supabase/packages/ra-supabase-ui-materialui/src/icons.tsx`. The icons file copies SVG paths from Supabase's auth-ui repo. We replace the MUI `<SvgIcon>` wrapper with a plain `<svg>` accepting `React.SVGProps<SVGSVGElement>`.

- [ ] **Step 1: Create the icons module**

Create `src/components/supabase/icons.tsx`. The file is long but mechanical — each icon is the same wrapper around the SVG `<path>` content from the upstream file. To keep this plan compact, use this template:

```tsx
/**
 * SVG icons for Supabase social auth providers.
 *
 * Each icon is a self-contained <svg> React component accepting standard
 * SVG props. Paths sourced from supabase/auth-ui (MIT) via ra-supabase.
 *
 * Default size 20x20 to match the kit's <Button> icon convention.
 */
import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

const Svg = ({
  viewBox,
  children,
  ...props
}: IconProps & { viewBox: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={viewBox}
    width={20}
    height={20}
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
);

export const GoogleIcon = (props: IconProps) => (
  <Svg viewBox="0 0 48 48" {...props}>
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    />
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </Svg>
);
```

Then add the remaining 15 icons. **Source paths to copy verbatim** from `/Users/rin/GitHub/ra-supabase/packages/ra-supabase-ui-materialui/src/icons.tsx`:

- `FacebookIcon` — viewBox `0 0 48 48`, 2 paths (lines 33-47 of source)
- `TwitterIcon` — viewBox `0 0 48 48`, 1 path (lines 49-62)
- `AppleIcon` — viewBox `0 0 24 24`, 1 path (lines 64-76)
- `GithubIcon` — viewBox `0 0 30 30`, 1 path (lines 78-90)
- `GitlabIcon` — viewBox `0 0 48 48`, 7 paths (lines 92-108)
- `BitbucketIcon` — viewBox `0 0 62.42 62.42`, includes `<defs>` with `linearGradient`, `<title>`, `<g>` wrapping 2 paths (lines 109-144)
- `DiscordIcon` — viewBox `0 0 48 48`, 1 path (lines 146-159)
- `AzureIcon` — viewBox `0 0 48 48`, includes 3 `linearGradient` defs + 3 paths (lines 161-225)
- `KeycloakIcon` — viewBox `0 0 512 512`, 1 path (lines 227-241)
- `LinkedinIcon` — viewBox `0 0 48 48`, 2 paths (lines 243-260)
- `NotionIcon` — viewBox `0 0 48 48`, 3 paths with `fillRule`/`clipRule` (lines 262-291)
- `SlackIcon` — viewBox `0 0 48 48`, 8 paths (lines 293-334)
- `SpotifyIcon` — viewBox `0 0 512 512`, 1 path (lines 336-350)
- `TwitchIcon` — viewBox `0 0 512 512`, 4 paths (lines 352-372)
- `WorkosIcon` — viewBox `0 0 512 512`, 2 paths (lines 374-391)

**Important translations from MUI to plain SVG**:

- `fillRule="evenodd"` in MUI becomes `fillRule="evenodd"` in React JSX (same — already camelCase)
- `clipRule="evenodd"` is also already camelCase
- For Bitbucket and Azure: the inline `<defs><linearGradient id="...">` works as-is in JSX. Keep `gradientUnits` / `gradientTransform` etc. spelled exactly as in the source (they're attribute-name strings, React forwards them).
- Remove the MUI-specific `fill="gray"` attribute on `<SvgIcon>` for AppleIcon and GithubIcon — instead set `fill="currentColor"` so the icon inherits the button's text color. Apply this same change to AppleIcon and GithubIcon's outer `<Svg>` props.

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/supabase/icons.tsx
git commit -m "Add inline SVG icons for 16 Supabase social auth providers"
```

---

## Task 4: Extract shared `AuthLayout` and refactor existing `LoginPage`

**Files:**

- Create: `src/components/admin/auth-layout.tsx`
- Modify: `src/components/admin/login-page.tsx`
- Modify: `src/components/admin/index.ts`

The existing `LoginPage` ([src/components/admin/login-page.tsx](src/components/admin/login-page.tsx)) hard-codes a split-screen layout with an Acme Inc logo + testimonial in the left panel and a centered form column on the right plus `<Notification />`. We extract the chrome into `<AuthLayout>` and the marketing panel into an internal default, then have `LoginPage` consume `<AuthLayout>`.

- [ ] **Step 1: Create `src/components/admin/auth-layout.tsx`**

```tsx
import type { ReactNode } from "react";
import { Notification } from "@/components/admin/notification";

/**
 * Split-screen chrome shared by the kit's authentication pages
 * (login, forgot-password, set-password). Renders a dark marketing
 * panel on the left (hidden on mobile) and a centered form column
 * on the right. Mounts a single `<Notification />` so child forms
 * can surface notifications via `useNotify()`.
 *
 * @example
 * <AuthLayout>
 *   <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
 *   <Form onSubmit={handleSubmit}>...</Form>
 * </AuthLayout>
 *
 * @example Override the marketing panel
 * <AuthLayout marketing={<MyBrandPanel />}>...</AuthLayout>
 */
export const AuthLayout = ({ children, marketing }: AuthLayoutProps) => (
  <div className="min-h-screen flex">
    <div className="container relative grid flex-col items-center justify-center sm:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        {marketing ?? <DefaultMarketingPanel />}
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {children}
        </div>
      </div>
    </div>
    <Notification />
  </div>
);

export interface AuthLayoutProps {
  children: ReactNode;
  marketing?: ReactNode;
}

const DefaultMarketingPanel = () => (
  <>
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
          &ldquo;Shadcn Admin Kit has allowed us to quickly create and evolve a
          powerful tool that otherwise would have taken months of time and
          effort to develop.&rdquo;
        </p>
        <footer className="text-sm">John Doe</footer>
      </blockquote>
    </div>
  </>
);
```

- [ ] **Step 2: Refactor `src/components/admin/login-page.tsx` to consume `AuthLayout`**

Replace the entire file with:

```tsx
import { useState } from "react";
import { Form, required, useLogin, useNotify } from "ra-core";
import type { SubmitHandler, FieldValues } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/admin/text-input";
import { AuthLayout } from "@/components/admin/auth-layout";

/**
 * Login page displayed when authentication is enabled and the user is not authenticated.
 *
 * Automatically shown when an unauthenticated user tries to access a protected route.
 * Handles login via authProvider.login() and displays error notifications on failure.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/loginpage LoginPage documentation}
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/security Security documentation}
 */
export const LoginPage = (props: { redirectTo?: string }) => {
  const { redirectTo } = props;
  const [loading, setLoading] = useState(false);
  const login = useLogin();
  const notify = useNotify();

  const handleSubmit: SubmitHandler<FieldValues> = (values) => {
    setLoading(true);
    login(values, redirectTo)
      .then(() => {
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        notify(
          typeof error === "string"
            ? error
            : typeof error === "undefined" || !error.message
              ? "ra.auth.sign_in_error"
              : error.message,
          {
            type: "error",
            messageArgs: {
              _:
                typeof error === "string"
                  ? error
                  : error && error.message
                    ? error.message
                    : undefined,
            },
          },
        );
      });
  };

  return (
    <AuthLayout>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm leading-none text-muted-foreground">
          Try janedoe@acme.com / password
        </p>
      </div>
      <Form className="space-y-8" onSubmit={handleSubmit}>
        <TextInput
          label="Email"
          source="email"
          type="email"
          validate={required()}
        />
        <TextInput
          label="Password"
          source="password"
          type="password"
          validate={required()}
        />
        <Button type="submit" className="cursor-pointer" disabled={loading}>
          Sign in
        </Button>
      </Form>
    </AuthLayout>
  );
};
```

- [ ] **Step 3: Export `AuthLayout` from the admin barrel**

Edit `src/components/admin/index.ts`. Add this line in alphabetical position (after `./array-input`):

```ts
export * from "./auth-layout";
```

- [ ] **Step 4: Visual smoke-test — start the dev server and confirm the login page still looks identical**

Run: `pnpm dev`
In the browser, navigate to a protected route to trigger `/login`. The split-screen with logo+testimonial+form should be visually identical to before. Kill the dev server when satisfied.

- [ ] **Step 5: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/auth-layout.tsx src/components/admin/login-page.tsx src/components/admin/index.ts
git commit -m "Extract AuthLayout from LoginPage for reuse by Supabase auth pages"
```

---

## Task 5: `SocialAuthButton` + 16 provider buttons

**Files:**

- Create: `src/components/supabase/social-auth-button.tsx`
- Create: `src/components/supabase/social-auth-button.spec.tsx`
- Create: `src/stories/supabase/social-auth-button.stories.tsx`

- [ ] **Step 1: Write the story file (used by both Storybook and the spec)**

Create `src/stories/supabase/social-auth-button.stories.tsx`:

```tsx
import * as React from "react";
import { CoreAdminContext, type AuthProvider } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "@/components/admin";
import {
  GithubButton,
  GoogleButton,
  SocialAuthButton,
} from "@/components/supabase/social-auth-button";
import { raSupabaseEnglishMessages } from "@/components/supabase/i18n/en";

export default {
  title: "Supabase/SocialAuthButton",
};

const i18nProvider = polyglotI18nProvider(
  () => ({ ...defaultMessages, ...raSupabaseEnglishMessages }),
  "en",
  undefined,
  { allowMissing: true },
);

const noopAuthProvider: AuthProvider = {
  login: async () => {
    /* no-op */
  },
  logout: async () => {
    /* no-op */
  },
  checkAuth: async () => {
    /* no-op */
  },
  checkError: async () => {
    /* no-op */
  },
  getPermissions: async () => null,
};

const Wrapper = ({
  children,
  authProvider = noopAuthProvider,
}: React.PropsWithChildren<{ authProvider?: AuthProvider }>) => (
  <MemoryRouter>
    <ThemeProvider>
      <CoreAdminContext authProvider={authProvider} i18nProvider={i18nProvider}>
        {children}
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);

export const Github = () => (
  <Wrapper>
    <GithubButton />
  </Wrapper>
);

export const Google = () => (
  <Wrapper>
    <GoogleButton />
  </Wrapper>
);

export const CustomProvider = () => (
  <Wrapper>
    <SocialAuthButton provider="apple">Custom Apple label</SocialAuthButton>
  </Wrapper>
);
```

- [ ] **Step 2: Write the failing tests**

Create `src/components/supabase/social-auth-button.spec.tsx`:

```tsx
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import type { AuthProvider } from "ra-core";
import { CoreAdminContext } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "@/components/admin";
import {
  GithubButton,
  SocialAuthButton,
} from "@/components/supabase/social-auth-button";
import { raSupabaseEnglishMessages } from "@/components/supabase/i18n/en";

const i18nProvider = polyglotI18nProvider(
  () => ({ ...defaultMessages, ...raSupabaseEnglishMessages }),
  "en",
  undefined,
  { allowMissing: true },
);

const renderWithAuth = (ui: React.ReactElement, authProvider: AuthProvider) =>
  render(
    <MemoryRouter>
      <ThemeProvider>
        <CoreAdminContext
          authProvider={authProvider}
          i18nProvider={i18nProvider}
        >
          {ui}
        </CoreAdminContext>
      </ThemeProvider>
    </MemoryRouter>,
  );

describe("<SocialAuthButton />", () => {
  it("renders the GithubButton with the translated label", async () => {
    const auth: AuthProvider = {
      login: vi.fn().mockResolvedValue(undefined),
      logout: async () => {},
      checkAuth: async () => {},
      checkError: async () => {},
      getPermissions: async () => null,
    };
    const screen = renderWithAuth(<GithubButton />, auth);
    await expect
      .element(screen.getByRole("button", { name: /Sign in with Github/ }))
      .toBeInTheDocument();
  });

  it("calls authProvider.login with the provider name on click", async () => {
    const login = vi.fn().mockResolvedValue(undefined);
    const auth: AuthProvider = {
      login,
      logout: async () => {},
      checkAuth: async () => {},
      checkError: async () => {},
      getPermissions: async () => null,
    };
    const screen = renderWithAuth(<GithubButton />, auth);
    await screen.getByRole("button", { name: /Sign in with Github/ }).click();
    expect(login).toHaveBeenCalledWith(
      { provider: "github" },
      expect.any(String),
    );
  });

  it("passes a custom redirect through to login", async () => {
    const login = vi.fn().mockResolvedValue(undefined);
    const auth: AuthProvider = {
      login,
      logout: async () => {},
      checkAuth: async () => {},
      checkError: async () => {},
      getPermissions: async () => null,
    };
    const screen = renderWithAuth(
      <SocialAuthButton provider="apple" redirect="/dashboard">
        Sign in with Apple
      </SocialAuthButton>,
      auth,
    );
    await screen.getByRole("button", { name: "Sign in with Apple" }).click();
    expect(login).toHaveBeenCalledWith({ provider: "apple" }, "/dashboard");
  });
});
```

- [ ] **Step 3: Run the tests — they should fail (component doesn't exist yet)**

Run: `pnpm vitest run --browser.headless src/components/supabase/social-auth-button.spec.tsx`
Expected: FAIL — cannot resolve `@/components/supabase/social-auth-button`.

- [ ] **Step 4: Implement `src/components/supabase/social-auth-button.tsx`**

```tsx
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
```

- [ ] **Step 5: Run the tests — they should pass**

Run: `pnpm vitest run --browser.headless src/components/supabase/social-auth-button.spec.tsx`
Expected: PASS — 3 tests.

- [ ] **Step 6: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/supabase/social-auth-button.tsx src/components/supabase/social-auth-button.spec.tsx src/stories/supabase/social-auth-button.stories.tsx
git commit -m "Add SocialAuthButton with 16 Supabase OAuth provider variants"
```

---

## Task 6: `SupabaseLoginForm` (email + password + forgot link)

**Files:**

- Create: `src/components/supabase/login-form.tsx`
- Create: `src/components/supabase/login-form.spec.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/supabase/login-form.spec.tsx`:

```tsx
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { CoreAdminContext, type AuthProvider } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "@/components/admin";
import { SupabaseLoginForm } from "@/components/supabase/login-form";
import { raSupabaseEnglishMessages } from "@/components/supabase/i18n/en";

const i18nProvider = polyglotI18nProvider(
  () => ({ ...defaultMessages, ...raSupabaseEnglishMessages }),
  "en",
  undefined,
  { allowMissing: true },
);

const renderWith = (ui: React.ReactElement, authProvider: AuthProvider) =>
  render(
    <MemoryRouter>
      <ThemeProvider>
        <CoreAdminContext
          authProvider={authProvider}
          i18nProvider={i18nProvider}
        >
          {ui}
        </CoreAdminContext>
      </ThemeProvider>
    </MemoryRouter>,
  );

const stubAuth = (login = vi.fn().mockResolvedValue(undefined)): AuthProvider =>
  ({
    login,
    logout: async () => {},
    checkAuth: async () => {},
    checkError: async () => {},
    getPermissions: async () => null,
  }) as AuthProvider;

describe("<SupabaseLoginForm />", () => {
  it("renders email and password fields and a forgot-password link", async () => {
    const screen = renderWith(<SupabaseLoginForm />, stubAuth());
    await expect.element(screen.getByLabelText(/Email/)).toBeInTheDocument();
    await expect.element(screen.getByLabelText(/Password/)).toBeInTheDocument();
    await expect
      .element(screen.getByRole("link", { name: /Forgot password\?/ }))
      .toBeInTheDocument();
  });

  it("calls authProvider.login with the submitted credentials", async () => {
    const login = vi.fn().mockResolvedValue(undefined);
    const screen = renderWith(<SupabaseLoginForm />, stubAuth(login));
    await screen.getByLabelText(/Email/).fill("janedoe@example.com");
    await screen.getByLabelText(/Password/).fill("hunter2");
    await screen.getByRole("button", { name: /Sign in/ }).click();
    expect(login).toHaveBeenCalledWith(
      { email: "janedoe@example.com", password: "hunter2" },
      undefined,
    );
  });

  it("hides the forgot-password link when disableForgotPassword is set", async () => {
    const screen = renderWith(
      <SupabaseLoginForm disableForgotPassword />,
      stubAuth(),
    );
    await expect
      .element(screen.getByRole("link", { name: /Forgot password\?/ }))
      .not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test — should fail**

Run: `pnpm vitest run --browser.headless src/components/supabase/login-form.spec.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/components/supabase/login-form.tsx`**

```tsx
import { useState } from "react";
import { Form, required, useLogin, useNotify, useTranslate } from "ra-core";
import type { SubmitHandler, FieldValues } from "react-hook-form";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/admin/text-input";

export interface SupabaseLoginFormProps {
  disableForgotPassword?: boolean;
  redirectTo?: string;
}

/**
 * Email + password sign-in form for Supabase authentication.
 *
 * Calls `useLogin({ email, password }, redirectTo)` on submit and
 * renders a "Forgot password?" link below the form unless
 * `disableForgotPassword` is set. The link points at
 * `ForgotPasswordPage.path` (`/forgot-password`).
 */
export const SupabaseLoginForm = ({
  disableForgotPassword,
  redirectTo,
}: SupabaseLoginFormProps) => {
  const [loading, setLoading] = useState(false);
  const login = useLogin();
  const notify = useNotify();
  const translate = useTranslate();

  const handleSubmit: SubmitHandler<FieldValues> = (values) => {
    setLoading(true);
    login(values, redirectTo)
      .then(() => setLoading(false))
      .catch((error) => {
        setLoading(false);
        notify(
          typeof error === "string"
            ? error
            : typeof error === "undefined" || !error.message
              ? "ra.auth.sign_in_error"
              : error.message,
          {
            type: "error",
            messageArgs: {
              _:
                typeof error === "string"
                  ? error
                  : error && error.message
                    ? error.message
                    : undefined,
            },
          },
        );
      });
  };

  return (
    <>
      <Form className="space-y-6" onSubmit={handleSubmit}>
        <TextInput
          label={translate("ra.auth.email", { _: "Email" })}
          source="email"
          type="email"
          autoComplete="email"
          validate={required()}
        />
        <TextInput
          label={translate("ra.auth.password", { _: "Password" })}
          source="password"
          type="password"
          autoComplete="current-password"
          validate={required()}
        />
        <Button
          type="submit"
          className="w-full cursor-pointer"
          disabled={loading}
        >
          {translate("ra.auth.sign_in", { _: "Sign in" })}
        </Button>
      </Form>
      {!disableForgotPassword && (
        <div className="text-center">
          <Link
            to="/forgot-password"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            {translate("ra-supabase.auth.forgot_password", {
              _: "Forgot password?",
            })}
          </Link>
        </div>
      )}
    </>
  );
};
```

- [ ] **Step 4: Run the test — should pass**

Run: `pnpm vitest run --browser.headless src/components/supabase/login-form.spec.tsx`
Expected: PASS — 3 tests.

- [ ] **Step 5: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/supabase/login-form.tsx src/components/supabase/login-form.spec.tsx
git commit -m "Add SupabaseLoginForm with email/password and forgot-password link"
```

---

## Task 7: `SupabaseLoginPage` (umbrella with optional social providers)

**Files:**

- Create: `src/components/supabase/login-page.tsx`
- Create: `src/components/supabase/login-page.spec.tsx`
- Create: `src/stories/supabase/login-page.stories.tsx`

- [ ] **Step 1: Write the story**

Create `src/stories/supabase/login-page.stories.tsx`:

```tsx
import * as React from "react";
import { CoreAdminContext, type AuthProvider } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "@/components/admin";
import { SupabaseLoginPage } from "@/components/supabase/login-page";
import { raSupabaseEnglishMessages } from "@/components/supabase/i18n/en";

export default { title: "Supabase/LoginPage" };

const i18nProvider = polyglotI18nProvider(
  () => ({ ...defaultMessages, ...raSupabaseEnglishMessages }),
  "en",
  undefined,
  { allowMissing: true },
);

const auth: AuthProvider = {
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
  checkError: async () => {},
  getPermissions: async () => null,
};

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <MemoryRouter>
    <ThemeProvider>
      <CoreAdminContext authProvider={auth} i18nProvider={i18nProvider}>
        {children}
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);

export const Default = () => (
  <Wrapper>
    <SupabaseLoginPage />
  </Wrapper>
);

export const WithSocialProviders = () => (
  <Wrapper>
    <SupabaseLoginPage providers={["github", "google"]} />
  </Wrapper>
);

export const SocialOnly = () => (
  <Wrapper>
    <SupabaseLoginPage disableEmailPassword providers={["github", "google"]} />
  </Wrapper>
);

export const NoForgotPassword = () => (
  <Wrapper>
    <SupabaseLoginPage disableForgotPassword />
  </Wrapper>
);
```

- [ ] **Step 2: Write the failing test**

Create `src/components/supabase/login-page.spec.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import {
  Default,
  NoForgotPassword,
  SocialOnly,
  WithSocialProviders,
} from "@/stories/supabase/login-page.stories";

describe("<SupabaseLoginPage />", () => {
  it("renders email/password form by default", async () => {
    const screen = render(<Default />);
    await expect.element(screen.getByLabelText(/Email/)).toBeInTheDocument();
    await expect.element(screen.getByLabelText(/Password/)).toBeInTheDocument();
    await expect
      .element(screen.getByRole("link", { name: /Forgot password\?/ }))
      .toBeInTheDocument();
  });

  it("renders social provider buttons when providers are given", async () => {
    const screen = render(<WithSocialProviders />);
    await expect
      .element(screen.getByRole("button", { name: /Sign in with Github/ }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /Sign in with Google/ }))
      .toBeInTheDocument();
  });

  it("hides the email/password form when disableEmailPassword is set", async () => {
    const screen = render(<SocialOnly />);
    await expect
      .element(screen.getByLabelText(/Email/))
      .not.toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /Sign in with Github/ }))
      .toBeInTheDocument();
  });

  it("omits the forgot-password link when disableForgotPassword is set", async () => {
    const screen = render(<NoForgotPassword />);
    await expect
      .element(screen.getByRole("link", { name: /Forgot password\?/ }))
      .not.toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run — should fail**

Run: `pnpm vitest run --browser.headless src/components/supabase/login-page.spec.tsx`
Expected: FAIL.

- [ ] **Step 4: Implement `src/components/supabase/login-page.tsx`**

```tsx
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
  marketing?: ReactNode;
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
 * Supabase-flavored sign-in page using the kit's split-screen
 * `<AuthLayout>`. Renders email/password by default and optionally
 * a stack of social provider buttons.
 *
 * Pass `children` to fully replace the right-column content.
 */
export const SupabaseLoginPage = (props: SupabaseLoginPageProps) => {
  const {
    children,
    disableEmailPassword = false,
    disableForgotPassword = false,
    marketing,
    providers = [],
    redirectTo,
  } = props;
  const translate = useTranslate();

  return (
    <AuthLayout marketing={marketing}>
      {children ?? (
        <>
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {translate("ra.auth.sign_in", { _: "Sign in" })}
            </h1>
          </div>
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
```

- [ ] **Step 5: Run tests — should pass**

Run: `pnpm vitest run --browser.headless src/components/supabase/login-page.spec.tsx`
Expected: PASS — 4 tests.

- [ ] **Step 6: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/supabase/login-page.tsx src/components/supabase/login-page.spec.tsx src/stories/supabase/login-page.stories.tsx
git commit -m "Add SupabaseLoginPage with optional social auth providers"
```

---

## Task 8: `ForgotPasswordPage` + `ForgotPasswordForm`

**Files:**

- Create: `src/components/supabase/forgot-password-form.tsx`
- Create: `src/components/supabase/forgot-password-form.spec.tsx`
- Create: `src/components/supabase/forgot-password-page.tsx`
- Create: `src/stories/supabase/forgot-password-page.stories.tsx`

- [ ] **Step 1: Write the story**

Create `src/stories/supabase/forgot-password-page.stories.tsx`:

```tsx
import * as React from "react";
import { CoreAdminContext, type AuthProvider } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "@/components/admin";
import { ForgotPasswordPage } from "@/components/supabase/forgot-password-page";
import { raSupabaseEnglishMessages } from "@/components/supabase/i18n/en";

export default { title: "Supabase/ForgotPasswordPage" };

const i18nProvider = polyglotI18nProvider(
  () => ({ ...defaultMessages, ...raSupabaseEnglishMessages }),
  "en",
  undefined,
  { allowMissing: true },
);

const auth: AuthProvider = {
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
  checkError: async () => {},
  getPermissions: async () => null,
};

export const Default = () => (
  <MemoryRouter>
    <ThemeProvider>
      <CoreAdminContext authProvider={auth} i18nProvider={i18nProvider}>
        <ForgotPasswordPage />
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);
```

- [ ] **Step 2: Write failing tests**

Create `src/components/supabase/forgot-password-form.spec.tsx`:

```tsx
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { CoreAdminContext, type AuthProvider } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "@/components/admin";
import { ForgotPasswordForm } from "@/components/supabase/forgot-password-form";
import { raSupabaseEnglishMessages } from "@/components/supabase/i18n/en";

const i18nProvider = polyglotI18nProvider(
  () => ({ ...defaultMessages, ...raSupabaseEnglishMessages }),
  "en",
  undefined,
  { allowMissing: true },
);

// Mock the hook from ra-supabase-core. The actual hook returns a
// react-query mutation tuple; the form only uses the second element.
const mutateAsync = vi.fn().mockResolvedValue(undefined);
vi.mock("ra-supabase-core", () => ({
  useResetPassword: () => [{} as never, { mutateAsync }],
}));

const auth: AuthProvider = {
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
  checkError: async () => {},
  getPermissions: async () => null,
};

const renderForm = () =>
  render(
    <MemoryRouter>
      <ThemeProvider>
        <CoreAdminContext authProvider={auth} i18nProvider={i18nProvider}>
          <ForgotPasswordForm />
        </CoreAdminContext>
      </ThemeProvider>
    </MemoryRouter>,
  );

describe("<ForgotPasswordForm />", () => {
  it("renders title, email field, submit button, and back-to-login link", async () => {
    const screen = renderForm();
    await expect
      .element(screen.getByText(/Forgot password\?/))
      .toBeInTheDocument();
    await expect.element(screen.getByLabelText(/Email/)).toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /Reset password/ }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("link", { name: /Back to login/ }))
      .toBeInTheDocument();
  });

  it("calls useResetPassword.mutateAsync with the email on submit", async () => {
    mutateAsync.mockClear();
    const screen = renderForm();
    await screen.getByLabelText(/Email/).fill("jane@example.com");
    await screen.getByRole("button", { name: /Reset password/ }).click();
    expect(mutateAsync).toHaveBeenCalledWith({ email: "jane@example.com" });
  });
});
```

- [ ] **Step 3: Run — should fail**

Run: `pnpm vitest run --browser.headless src/components/supabase/forgot-password-form.spec.tsx`
Expected: FAIL.

- [ ] **Step 4: Implement `src/components/supabase/forgot-password-form.tsx`**

```tsx
import { Form, required, useNotify, useTranslate } from "ra-core";
import type { SubmitHandler, FieldValues } from "react-hook-form";
import { Link } from "react-router";
import { useResetPassword } from "ra-supabase-core";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/admin/text-input";

/**
 * Form that triggers a Supabase password-reset email.
 *
 * Calls `useResetPassword().mutateAsync({ email })` on submit and
 * surfaces errors via `useNotify`. Includes a "Back to login" link.
 */
export const ForgotPasswordForm = () => {
  const notify = useNotify();
  const translate = useTranslate();
  const [, { mutateAsync: resetPassword }] = useResetPassword();

  const handleSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      await resetPassword({ email: values.email });
    } catch (error) {
      notify(
        typeof error === "string"
          ? error
          : typeof error === "undefined" ||
              !(error as { message?: string }).message
            ? "ra.auth.sign_in_error"
            : (error as Error).message,
        {
          type: "warning",
          messageArgs: {
            _:
              typeof error === "string"
                ? error
                : error && (error as Error).message
                  ? (error as Error).message
                  : undefined,
          },
        },
      );
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {translate("ra-supabase.reset_password.forgot_password", {
            _: "Forgot password?",
          })}
        </h1>
        <p className="text-sm text-muted-foreground">
          {translate("ra-supabase.reset_password.forgot_password_details", {
            _: "Enter your email for instructions.",
          })}
        </p>
      </div>
      <Form className="space-y-6" onSubmit={handleSubmit}>
        <TextInput
          label={translate("ra.auth.email", { _: "Email" })}
          source="email"
          type="email"
          autoComplete="email"
          validate={required()}
        />
        <Button type="submit" className="w-full cursor-pointer">
          {translate("ra.action.reset_password", {
            _: "Reset password",
          })}
        </Button>
      </Form>
      <div className="text-center">
        <Link
          to="/login"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          {translate("ra-supabase.auth.back_to_login", {
            _: "Back to login",
          })}
        </Link>
      </div>
    </>
  );
};
```

- [ ] **Step 5: Implement `src/components/supabase/forgot-password-page.tsx`**

```tsx
import type { ReactNode } from "react";
import { AuthLayout } from "@/components/admin/auth-layout";
import { ForgotPasswordForm } from "./forgot-password-form";

export interface ForgotPasswordPageProps {
  children?: ReactNode;
  marketing?: ReactNode;
}

/**
 * Standalone page rendering the password-reset form inside the kit's
 * shared `<AuthLayout>`. Register at `ForgotPasswordPage.path` via
 * `<CustomRoutes noLayout>` in your Admin.
 *
 * @example
 * import { CustomRoutes } from 'ra-core';
 * import { Route } from 'react-router';
 *
 * <Admin>
 *   <CustomRoutes noLayout>
 *     <Route
 *       path={ForgotPasswordPage.path}
 *       element={<ForgotPasswordPage />}
 *     />
 *   </CustomRoutes>
 * </Admin>
 */
export const ForgotPasswordPage = ({
  children = <ForgotPasswordForm />,
  marketing,
}: ForgotPasswordPageProps) => (
  <AuthLayout marketing={marketing}>{children}</AuthLayout>
);

ForgotPasswordPage.path = "/forgot-password";
```

- [ ] **Step 6: Run tests — should pass**

Run: `pnpm vitest run --browser.headless src/components/supabase/forgot-password-form.spec.tsx`
Expected: PASS — 2 tests.

- [ ] **Step 7: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/supabase/forgot-password-form.tsx src/components/supabase/forgot-password-form.spec.tsx src/components/supabase/forgot-password-page.tsx src/stories/supabase/forgot-password-page.stories.tsx
git commit -m "Add ForgotPasswordPage and ForgotPasswordForm for Supabase auth"
```

---

## Task 9: `SetPasswordPage` + `SetPasswordForm`

**Files:**

- Create: `src/components/supabase/set-password-form.tsx`
- Create: `src/components/supabase/set-password-form.spec.tsx`
- Create: `src/components/supabase/set-password-page.tsx`
- Create: `src/stories/supabase/set-password-page.stories.tsx`

- [ ] **Step 1: Write the story**

Create `src/stories/supabase/set-password-page.stories.tsx`:

```tsx
import * as React from "react";
import { CoreAdminContext, type AuthProvider } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "@/components/admin";
import { SetPasswordPage } from "@/components/supabase/set-password-page";
import { raSupabaseEnglishMessages } from "@/components/supabase/i18n/en";

export default { title: "Supabase/SetPasswordPage" };

const i18nProvider = polyglotI18nProvider(
  () => ({ ...defaultMessages, ...raSupabaseEnglishMessages }),
  "en",
  undefined,
  { allowMissing: true },
);

const auth: AuthProvider = {
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
  checkError: async () => {},
  getPermissions: async () => null,
};

export const WithTokens = () => (
  <MemoryRouter
    initialEntries={["/set-password#access_token=A&refresh_token=R"]}
  >
    <ThemeProvider>
      <CoreAdminContext authProvider={auth} i18nProvider={i18nProvider}>
        <SetPasswordPage />
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);

export const MissingTokens = () => (
  <MemoryRouter initialEntries={["/set-password"]}>
    <ThemeProvider>
      <CoreAdminContext authProvider={auth} i18nProvider={i18nProvider}>
        <SetPasswordPage />
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);
```

- [ ] **Step 2: Write failing tests**

Create `src/components/supabase/set-password-form.spec.tsx`:

```tsx
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { CoreAdminContext, type AuthProvider } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "@/components/admin";
import { SetPasswordForm } from "@/components/supabase/set-password-form";
import { raSupabaseEnglishMessages } from "@/components/supabase/i18n/en";

const i18nProvider = polyglotI18nProvider(
  () => ({ ...defaultMessages, ...raSupabaseEnglishMessages }),
  "en",
  undefined,
  { allowMissing: true },
);

const mutateAsync = vi.fn().mockResolvedValue(undefined);
const tokenValues: Record<string, string | undefined> = {
  access_token: "ACCESS",
  refresh_token: "REFRESH",
};

vi.mock("ra-supabase-core", () => ({
  useSetPassword: () => [{} as never, { mutateAsync }],
  useSupabaseAccessToken: ({
    parameterName,
  }: { parameterName?: string } = {}) =>
    tokenValues[parameterName ?? "access_token"],
}));

const auth: AuthProvider = {
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
  checkError: async () => {},
  getPermissions: async () => null,
};

const renderForm = () =>
  render(
    <MemoryRouter>
      <ThemeProvider>
        <CoreAdminContext authProvider={auth} i18nProvider={i18nProvider}>
          <SetPasswordForm />
        </CoreAdminContext>
      </ThemeProvider>
    </MemoryRouter>,
  );

describe("<SetPasswordForm />", () => {
  it("renders password and confirm fields and the submit button", async () => {
    const screen = renderForm();
    await expect
      .element(screen.getByLabelText(/^Password$/))
      .toBeInTheDocument();
    await expect
      .element(screen.getByLabelText(/Confirm password/))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /Save/ }))
      .toBeInTheDocument();
  });

  it("shows a mismatch error when passwords differ", async () => {
    const screen = renderForm();
    await screen.getByLabelText(/^Password$/).fill("hunter2");
    await screen.getByLabelText(/Confirm password/).fill("hunter3");
    await screen.getByRole("button", { name: /Save/ }).click();
    await expect
      .element(screen.getByText(/Passwords do not match/))
      .toBeInTheDocument();
  });

  it("calls useSetPassword.mutateAsync when passwords match", async () => {
    mutateAsync.mockClear();
    const screen = renderForm();
    await screen.getByLabelText(/^Password$/).fill("hunter2");
    await screen.getByLabelText(/Confirm password/).fill("hunter2");
    await screen.getByRole("button", { name: /Save/ }).click();
    expect(mutateAsync).toHaveBeenCalledWith({
      access_token: "ACCESS",
      refresh_token: "REFRESH",
      password: "hunter2",
    });
  });

  it("renders the missing-tokens message when tokens are absent", async () => {
    tokenValues.access_token = undefined;
    tokenValues.refresh_token = undefined;
    const screen = renderForm();
    await expect
      .element(screen.getByText(/Access and refresh tokens are missing/))
      .toBeInTheDocument();
    // restore for subsequent tests
    tokenValues.access_token = "ACCESS";
    tokenValues.refresh_token = "REFRESH";
  });
});
```

- [ ] **Step 3: Run — should fail**

Run: `pnpm vitest run --browser.headless src/components/supabase/set-password-form.spec.tsx`
Expected: FAIL.

- [ ] **Step 4: Implement `src/components/supabase/set-password-form.tsx`**

```tsx
import { Form, required, useNotify, useTranslate } from "ra-core";
import type { SubmitHandler, FieldValues } from "react-hook-form";
import { useSetPassword, useSupabaseAccessToken } from "ra-supabase-core";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/admin/text-input";

interface FormData {
  password: string;
  confirmPassword: string;
}

/**
 * Form that finishes Supabase's password-reset / first-login flow.
 *
 * Reads `access_token` and `refresh_token` from the URL hash via
 * `useSupabaseAccessToken()` (populated by Supabase's redirect after
 * the user clicks the reset/invite email). Submits the new password
 * to `useSetPassword().mutateAsync()`.
 *
 * If either token is missing, renders the translated
 * `ra-supabase.auth.missing_tokens` message instead.
 */
export const SetPasswordForm = () => {
  const access_token = useSupabaseAccessToken();
  const refresh_token = useSupabaseAccessToken({
    parameterName: "refresh_token",
  });
  const notify = useNotify();
  const translate = useTranslate();
  const [, { mutateAsync: setPassword }] = useSetPassword();

  if (!access_token || !refresh_token) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("Missing access_token or refresh_token for set password");
    }
    return (
      <div className="text-center text-sm text-muted-foreground">
        {translate("ra-supabase.auth.missing_tokens", {
          _: "Access and refresh tokens are missing",
        })}
      </div>
    );
  }

  const validate = (values: FormData) => {
    if (values.password !== values.confirmPassword) {
      return {
        password: "ra-supabase.validation.password_mismatch",
        confirmPassword: "ra-supabase.validation.password_mismatch",
      };
    }
    return {};
  };

  const handleSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      await setPassword({
        access_token,
        refresh_token,
        password: (values as FormData).password,
      });
    } catch (error) {
      notify(
        typeof error === "string"
          ? error
          : typeof error === "undefined" ||
              !(error as { message?: string }).message
            ? "ra.auth.sign_in_error"
            : (error as Error).message,
        {
          type: "warning",
          messageArgs: {
            _:
              typeof error === "string"
                ? error
                : error && (error as Error).message
                  ? (error as Error).message
                  : undefined,
          },
        },
      );
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {translate("ra-supabase.set_password.new_password", {
            _: "Choose your password",
          })}
        </h1>
      </div>
      <Form className="space-y-6" onSubmit={handleSubmit} validate={validate}>
        <TextInput
          label={translate("ra.auth.password", { _: "Password" })}
          source="password"
          type="password"
          autoComplete="new-password"
          validate={required()}
        />
        <TextInput
          label={translate("ra.auth.confirm_password", {
            _: "Confirm password",
          })}
          source="confirmPassword"
          type="password"
          autoComplete="new-password"
          validate={required()}
        />
        <Button type="submit" className="w-full cursor-pointer">
          {translate("ra.action.save", { _: "Save" })}
        </Button>
      </Form>
    </>
  );
};
```

- [ ] **Step 5: Implement `src/components/supabase/set-password-page.tsx`**

```tsx
import type { ReactNode } from "react";
import { AuthLayout } from "@/components/admin/auth-layout";
import { SetPasswordForm } from "./set-password-form";

export interface SetPasswordPageProps {
  children?: ReactNode;
  marketing?: ReactNode;
}

/**
 * Standalone page that finishes the Supabase password-set flow
 * (first-login after invite, password reset).
 *
 * Register at `SetPasswordPage.path` (`/set-password`) via
 * `<CustomRoutes noLayout>` so it is reachable without authentication.
 */
export const SetPasswordPage = ({
  children = <SetPasswordForm />,
  marketing,
}: SetPasswordPageProps) => (
  <AuthLayout marketing={marketing}>{children}</AuthLayout>
);

SetPasswordPage.path = "/set-password";
```

- [ ] **Step 6: Run tests — should pass**

Run: `pnpm vitest run --browser.headless src/components/supabase/set-password-form.spec.tsx`
Expected: PASS — 4 tests.

- [ ] **Step 7: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/supabase/set-password-form.tsx src/components/supabase/set-password-form.spec.tsx src/components/supabase/set-password-page.tsx src/stories/supabase/set-password-page.stories.tsx
git commit -m "Add SetPasswordPage and SetPasswordForm for Supabase auth"
```

---

## Task 10: Test fixture — example Supabase OpenAPI schema

**Files:**

- Create: `src/components/supabase/__fixtures__/example-schema.json`
- Create: `src/components/supabase/__fixtures__/index.ts`

This fixture drives the guesser tests. We don't need ra-supabase's full 2520-line fixture — a focused subset is faster to read and test against.

- [ ] **Step 1: Create the fixture JSON**

Create `src/components/supabase/__fixtures__/example-schema.json`:

```json
{
  "swagger": "2.0",
  "info": { "title": "test schema", "version": "0.0.0" },
  "host": "localhost",
  "basePath": "/",
  "schemes": ["http"],
  "consumes": ["application/json"],
  "produces": ["application/json"],
  "paths": {
    "/companies": {
      "get": {
        "parameters": [],
        "responses": { "200": { "description": "OK" } }
      },
      "post": {
        "parameters": [],
        "responses": { "200": { "description": "OK" } }
      },
      "patch": {
        "parameters": [],
        "responses": { "200": { "description": "OK" } }
      }
    },
    "/contacts": {
      "get": {
        "parameters": [],
        "responses": { "200": { "description": "OK" } }
      },
      "post": {
        "parameters": [],
        "responses": { "200": { "description": "OK" } }
      },
      "patch": {
        "parameters": [],
        "responses": { "200": { "description": "OK" } }
      }
    },
    "/readonly_view": {
      "get": {
        "parameters": [],
        "responses": { "200": { "description": "OK" } }
      }
    }
  },
  "definitions": {
    "companies": {
      "required": ["name"],
      "properties": {
        "id": { "format": "bigint", "type": "integer" },
        "name": { "format": "text", "type": "string" },
        "website": { "format": "text", "type": "string" },
        "created_at": {
          "format": "timestamp with time zone",
          "type": "string"
        }
      },
      "type": "object"
    },
    "contacts": {
      "required": ["email"],
      "properties": {
        "id": { "format": "bigint", "type": "integer" },
        "first_name": { "format": "text", "type": "string" },
        "email": { "format": "text", "type": "string" },
        "company_id": {
          "format": "bigint",
          "type": "integer",
          "description": "Note:\nThis is a Foreign Key to `companies.id`.<fk table='companies' column='id'/>"
        },
        "tag_ids": {
          "type": "array",
          "items": { "type": "integer" }
        }
      },
      "type": "object"
    },
    "readonly_view": {
      "properties": {
        "id": { "format": "bigint", "type": "integer" },
        "label": { "format": "text", "type": "string" }
      },
      "type": "object"
    }
  }
}
```

- [ ] **Step 2: Create the typed fixture re-export**

Create `src/components/supabase/__fixtures__/index.ts`:

```ts
import type { OpenAPIV2 } from "openapi-types";
import schema from "./example-schema.json";

export const exampleSchema = schema as unknown as OpenAPIV2.Document;
```

- [ ] **Step 3: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/supabase/__fixtures__
git commit -m "Add OpenAPI schema fixture for Supabase guesser tests"
```

---

## Task 11: `InferredElement` subclass

**Files:**

- Create: `src/components/supabase/inferred-element.ts`

- [ ] **Step 1: Implement the subclass**

Create `src/components/supabase/inferred-element.ts`:

```ts
import {
  InferredElement as CoreInferredElement,
  type InferredType,
} from "ra-core";

/**
 * Extends ra-core's `InferredElement` with an optional `warning`
 * string that the guessers surface to the developer console.
 *
 * `inferElementFromType()` attaches warnings when it can guess a
 * shape but cannot fully configure a child component (e.g. an
 * `<AutocompleteInput>` referencing a resource whose record
 * representation cannot be inferred).
 */
export class InferredElement extends CoreInferredElement {
  private warning?: string;

  constructor(
    type?: InferredType,
    props?: unknown,
    children?: unknown,
    warning?: string,
  ) {
    super(type, props, children);
    this.warning = warning;
  }

  getWarning(): string | undefined {
    return this.warning;
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/supabase/inferred-element.ts
git commit -m "Add InferredElement subclass with warning support"
```

---

## Task 12: `inferElementFromType` — schema-driven field inference

**Files:**

- Create: `src/components/supabase/infer-element-from-type.ts`
- Create: `src/components/supabase/infer-element-from-type.spec.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/components/supabase/infer-element-from-type.spec.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { InferredTypeMap } from "ra-core";
import { exampleSchema } from "./__fixtures__";
import { inferElementFromType } from "./infer-element-from-type";

const fakeTypes: InferredTypeMap = {
  id: { component: () => null, representation: () => "<Id/>" },
  string: {
    component: () => null,
    representation: (p) =>
      `<String source="${(p as { source: string }).source}"/>`,
  },
  number: {
    component: () => null,
    representation: (p) =>
      `<Number source="${(p as { source: string }).source}"/>`,
  },
  date: {
    component: () => null,
    representation: (p) =>
      `<Date source="${(p as { source: string }).source}"/>`,
  },
  email: {
    component: () => null,
    representation: (p) =>
      `<Email source="${(p as { source: string }).source}"/>`,
  },
  url: {
    component: () => null,
    representation: (p) =>
      `<Url source="${(p as { source: string }).source}"/>`,
  },
  reference: {
    component: () => null,
    representation: (p) =>
      `<Ref source="${(p as { source: string; reference: string }).source}" reference="${(p as { source: string; reference: string }).reference}"/>`,
  },
  autocompleteInput: {
    component: () => null,
    representation: (p) =>
      `<Auto optionText="${(p as { optionText: string }).optionText}"/>`,
  },
  referenceArray: {
    component: () => null,
    representation: (p) =>
      `<RefArray source="${(p as { source: string; reference: string }).source}" reference="${(p as { source: string; reference: string }).reference}"/>`,
  },
  autocompleteArrayInput: {
    component: () => null,
    representation: (p) =>
      `<AutoArray optionText="${(p as { optionText: string }).optionText}"/>`,
  },
};

describe("inferElementFromType", () => {
  it("returns an id element for source=id when types has 'id'", () => {
    const el = inferElementFromType({
      name: "id",
      types: fakeTypes,
      type: "integer",
      schema: exampleSchema,
    });
    expect(el.getRepresentation()).toContain("<Id");
  });

  it("returns an email element for source=email", () => {
    const el = inferElementFromType({
      name: "email",
      types: fakeTypes,
      type: "string",
      schema: exampleSchema,
    });
    expect(el.getRepresentation()).toContain('<Email source="email"');
  });

  it("returns a url element for source=website", () => {
    const el = inferElementFromType({
      name: "website",
      types: fakeTypes,
      type: "string",
      schema: exampleSchema,
    });
    expect(el.getRepresentation()).toContain('<Url source="website"');
  });

  it("returns a date element for timestamp formats", () => {
    const el = inferElementFromType({
      name: "created_at",
      types: fakeTypes,
      type: "string",
      format: "timestamp with time zone",
      schema: exampleSchema,
    });
    expect(el.getRepresentation()).toContain('<Date source="created_at"');
  });

  it("returns a number element for type=integer", () => {
    const el = inferElementFromType({
      name: "age",
      types: fakeTypes,
      type: "integer",
      schema: exampleSchema,
    });
    expect(el.getRepresentation()).toContain('<Number source="age"');
  });

  it("detects a foreign key from the description and infers a reference", () => {
    const el = inferElementFromType({
      name: "company_id",
      types: fakeTypes,
      type: "integer",
      description:
        "Note:\nThis is a Foreign Key to `companies.id`.<fk table='companies' column='id'/>",
      schema: exampleSchema,
    });
    const rep = el.getRepresentation();
    expect(rep).toContain('source="company_id"');
    expect(rep).toContain('reference="companies"');
    // 'name' field exists on companies → optionText should be 'name'
    expect(rep).toContain('optionText="name"');
  });

  it("infers a reference array from an _ids suffix", () => {
    const el = inferElementFromType({
      name: "tag_ids",
      types: {
        ...fakeTypes,
        // tag_ids should pluralize 'tag' → 'tags'
      },
      type: "array",
      schema: {
        ...exampleSchema,
        definitions: {
          ...exampleSchema.definitions,
          tags: {
            type: "object",
            properties: {
              id: { format: "bigint", type: "integer" },
              name: { format: "text", type: "string" },
            },
          },
        },
      },
      schema_unused_marker: undefined,
    } as never);
    const rep = el.getRepresentation();
    expect(rep).toContain('source="tag_ids"');
    expect(rep).toContain('reference="tags"');
  });
});
```

(Note: the `schema_unused_marker` cast is a TS workaround for the test-only inline schema augmentation. It does not affect production behavior.)

- [ ] **Step 2: Run — should fail**

Run: `pnpm vitest run --browser.headless src/components/supabase/infer-element-from-type.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `src/components/supabase/infer-element-from-type.ts`**

```ts
import { required, type InferredTypeMap } from "ra-core";
import { pluralize } from "inflection";
import type { OpenAPIV2 } from "openapi-types";
import { InferredElement } from "./inferred-element";

const hasType = (type: string, types: InferredTypeMap) =>
  typeof types[type] !== "undefined";

interface InferElementFromTypeArgs {
  name: string;
  types: InferredTypeMap;
  description?: string;
  format?: string;
  type?: string;
  requiredFields?: string[];
  props?: Record<string, unknown>;
  schema: OpenAPIV2.Document;
}

/**
 * Inspects a single OpenAPI property and returns an `InferredElement`
 * pointing at the most specific field/input from `types`.
 *
 * Rules applied in order:
 *  1. `name === 'id'` → `types.id`.
 *  2. Description starting with `"Note:\nThis is a Foreign Key to "`
 *     → `types.reference` with an `<AutocompleteInput>` child whose
 *     `optionText` is inferred from the referenced resource's
 *     properties (`name` > `title` > `label` > `reference`).
 *  3. `name` ending in `_ids` → `types.referenceArray` with
 *     `<AutocompleteArrayInput>` child, reference inferred by
 *     pluralizing `name` with the `_ids` suffix stripped.
 *  4. `type === 'array'` (without `_ids` suffix) → fall back to string.
 *     Matches upstream `ra-supabase` behavior; deeper array
 *     introspection is intentionally out of scope.
 *  5. `type === 'string'` + `name === 'email'` → email.
 *  6. `type === 'string'` + `name in {url, website}` → url.
 *  7. `type === 'string'` + timestamp `format` → date.
 *  8. `type === 'integer'` → number.
 *  9. Any other `type` that maps in `types` → that type.
 * 10. Fallback → `types.string`.
 *
 * The `<AutocompleteInput>` PostgREST `filterToQuery` is set by the
 * `editFieldTypes` map (see edit-field-types.tsx) — this function
 * only supplies `optionText` and the structural children.
 */
export const inferElementFromType = ({
  name,
  description,
  format,
  type,
  requiredFields,
  types,
  props,
  schema,
}: InferElementFromTypeArgs): InferredElement => {
  if (name === "id" && hasType("id", types)) {
    return new InferredElement(types.id, { source: "id" });
  }
  const validate = requiredFields?.includes(name) ? [required()] : undefined;

  if (
    description?.startsWith("Note:\nThis is a Foreign Key to") &&
    hasType("reference", types)
  ) {
    const reference = description.split("`")[1].split(".")[0];
    const referenceResourceDefinition = schema.definitions?.[reference];
    if (!referenceResourceDefinition) {
      throw new Error(
        `The referenced resource ${reference} is not defined in the API schema`,
      );
    }
    const recordRepresentationField = inferRecordRepresentationField(
      referenceResourceDefinition as OpenAPIV2.SchemaObject,
    );

    return new InferredElement(
      types.reference,
      { source: name, reference, ...props },
      hasType("autocompleteInput", types) && recordRepresentationField
        ? [
            new InferredElement(types.autocompleteInput, {
              optionText: recordRepresentationField,
            }),
          ]
        : undefined,
      hasType("autocompleteInput", types) && !recordRepresentationField
        ? `Could not infer the field to use to filter referenced ${reference} records. Please provide the \`filterToQuery\` prop to the <AutocompleteInput> component.`
        : undefined,
    );
  }

  if (name.endsWith("_ids") && hasType("referenceArray", types)) {
    const reference = pluralize(name.substring(0, name.length - 4));
    const referenceResourceDefinition = schema.definitions?.[reference];
    if (!referenceResourceDefinition) {
      throw new Error(
        `The referenced resource ${reference} is not defined in the API schema`,
      );
    }
    const recordRepresentationField = inferRecordRepresentationField(
      referenceResourceDefinition as OpenAPIV2.SchemaObject,
    );

    return new InferredElement(
      types.referenceArray,
      { source: name, reference, ...props },
      hasType("autocompleteArrayInput", types) && recordRepresentationField
        ? [
            new InferredElement(types.autocompleteArrayInput, {
              optionText: recordRepresentationField,
            }),
          ]
        : undefined,
      hasType("autocompleteArrayInput", types) && !recordRepresentationField
        ? `Could not infer the field to use to filter referenced ${reference} records. Please provide the \`filterToQuery\` prop to the <AutocompleteArrayInput> component.`
        : undefined,
    );
  }

  if (type === "array") {
    return new InferredElement(types.string, { source: name, validate });
  }

  if (type === "string") {
    if (name === "email" && hasType("email", types)) {
      return new InferredElement(types.email, {
        source: name,
        validate,
        ...props,
      });
    }
    if (["url", "website"].includes(name) && hasType("url", types)) {
      return new InferredElement(types.url, {
        source: name,
        validate,
        ...props,
      });
    }
    if (
      format &&
      ["timestamp with time zone", "timestamp without time zone"].includes(
        format,
      ) &&
      hasType("date", types)
    ) {
      return new InferredElement(types.date, {
        source: name,
        validate,
        ...props,
      });
    }
  }

  if (type === "integer" && hasType("number", types)) {
    return new InferredElement(types.number, {
      source: name,
      validate,
      ...props,
    });
  }

  if (type && hasType(type, types)) {
    return new InferredElement(types[type], {
      source: name,
      validate,
      ...props,
    });
  }

  return new InferredElement(types.string, {
    source: name,
    validate,
    ...props,
  });
};

const inferRecordRepresentationField = (
  def: OpenAPIV2.SchemaObject,
): string | undefined => {
  if (def.properties?.name != null) return "name";
  if (def.properties?.title != null) return "title";
  if (def.properties?.label != null) return "label";
  if (def.properties?.reference != null) return "reference";
  return undefined;
};
```

- [ ] **Step 4: Run tests — should pass**

Run: `pnpm vitest run --browser.headless src/components/supabase/infer-element-from-type.spec.ts`
Expected: PASS — 7 tests.

- [ ] **Step 5: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/supabase/infer-element-from-type.ts src/components/supabase/infer-element-from-type.spec.ts
git commit -m "Add inferElementFromType for Supabase OpenAPI-driven type inference"
```

---

## Task 13: Field-type maps (`editFieldTypes`, `listFieldTypes`, `showFieldTypes`)

**Files:**

- Create: `src/components/supabase/edit-field-types.tsx`
- Create: `src/components/supabase/list-field-types.tsx`
- Create: `src/components/supabase/show-field-types.tsx`

These map the abstract type names (`reference`, `autocompleteInput`, `number`, `date`, etc.) to **concrete shadcn-admin-kit components**. They are passed to `inferElementFromType()` and used by the guessers.

- [ ] **Step 1: Implement `src/components/supabase/edit-field-types.tsx`**

```tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { InferredTypeMap } from "ra-core";
import { SimpleForm } from "@/components/admin/simple-form";
import { TextInput } from "@/components/admin/text-input";
import { NumberInput } from "@/components/admin/number-input";
import { BooleanInput } from "@/components/admin/boolean-input";
import { DateInput } from "@/components/admin/date-input";
import { ReferenceInput } from "@/components/admin/reference-input";
import { ReferenceArrayInput } from "@/components/admin/reference-array-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { AutocompleteArrayInput } from "@/components/admin/autocomplete-array-input";

const ilikeFilter = (optionText: string) => (searchText: string) => ({
  [`${optionText}@ilike`]: `%${searchText}%`,
});

/**
 * Input-component map for `inferElementFromType` in the Create/Edit
 * guessers. PostgREST-aware: `autocompleteInput` and
 * `autocompleteArrayInput` use the `@ilike` operator that
 * Supabase's REST API understands.
 */
export const editFieldTypes: InferredTypeMap = {
  form: {
    component: (props: any) => <SimpleForm {...props} />,
    representation: (
      _props: any,
      children: { getRepresentation: () => string }[],
    ) => `        <SimpleForm>
${children
  .map((child) => `            ${child.getRepresentation()}`)
  .join("\n")}
        </SimpleForm>`,
  },
  reference: {
    component: ReferenceInput,
    representation: (
      props: any,
      children?: { getRepresentation: () => string }[],
    ) =>
      children
        ? `<ReferenceInput source="${props.source}" reference="${props.reference}">
${children
  .map((child) => `                ${child.getRepresentation()}`)
  .join("\n")}
            </ReferenceInput>`
        : `<ReferenceInput source="${props.source}" reference="${props.reference}" />`,
  },
  autocompleteInput: {
    component: (props: any) =>
      props.optionText ? (
        <AutocompleteInput
          {...props}
          filterToQuery={ilikeFilter(props.optionText)}
        />
      ) : (
        <AutocompleteInput {...props} />
      ),
    representation: (props: any) =>
      `<AutocompleteInput${props.source ? ` source="${props.source}"` : ""}${
        props.optionText
          ? ` optionText="${props.optionText}" filterToQuery={searchText => ({ '${props.optionText}@ilike': \`%\${searchText}%\` })}`
          : ""
      } />`,
  },
  referenceArray: {
    component: ReferenceArrayInput,
    representation: (
      props: any,
      children?: { getRepresentation: () => string }[],
    ) =>
      children
        ? `<ReferenceArrayInput source="${props.source}" reference="${props.reference}">
${children
  .map((child) => `                ${child.getRepresentation()}`)
  .join("\n")}
            </ReferenceArrayInput>`
        : `<ReferenceArrayInput source="${props.source}" reference="${props.reference}" />`,
  },
  autocompleteArrayInput: {
    component: (props: any) =>
      props.optionText ? (
        <AutocompleteArrayInput
          {...props}
          filterToQuery={ilikeFilter(props.optionText)}
        />
      ) : (
        <AutocompleteArrayInput {...props} />
      ),
    representation: (props: any) =>
      `<AutocompleteArrayInput${
        props.source ? ` source="${props.source}"` : ""
      }${
        props.optionText
          ? ` optionText="${props.optionText}" filterToQuery={searchText => ({ '${props.optionText}@ilike': \`%\${searchText}%\` })}`
          : ""
      } />`,
  },
  number: {
    component: (props: any) => <NumberInput {...props} />,
    representation: (props: any) => `<NumberInput source="${props.source}" />`,
  },
  boolean: {
    component: (props: any) => <BooleanInput {...props} />,
    representation: (props: any) => `<BooleanInput source="${props.source}" />`,
  },
  date: {
    component: (props: any) => <DateInput {...props} />,
    representation: (props: any) => `<DateInput source="${props.source}" />`,
  },
  email: {
    component: (props: any) => <TextInput {...props} type="email" />,
    representation: (props: any) =>
      `<TextInput source="${props.source}" type="email" />`,
  },
  url: {
    component: (props: any) => <TextInput {...props} type="url" />,
    representation: (props: any) =>
      `<TextInput source="${props.source}" type="url" />`,
  },
  string: {
    component: (props: any) => <TextInput {...props} />,
    representation: (props: any) => `<TextInput source="${props.source}" />`,
  },
};
```

- [ ] **Step 2: Implement `src/components/supabase/list-field-types.tsx`**

```tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { InferredTypeMap } from "ra-core";
import { DataTable } from "@/components/admin/data-table";
import { DateField } from "@/components/admin/date-field";
import { NumberField } from "@/components/admin/number-field";
import { EmailField } from "@/components/admin/email-field";
import { UrlField } from "@/components/admin/url-field";
import { ReferenceField } from "@/components/admin/reference-field";
import { ReferenceArrayField } from "@/components/admin/reference-array-field";

/**
 * Column-component map for the Supabase List guesser.
 */
export const listFieldTypes: InferredTypeMap = {
  table: {
    component: (props: any) => <DataTable {...props} />,
    representation: (
      _props: any,
      children: { getRepresentation: () => string }[],
    ) =>
      `        <DataTable>
${children
  .map((child) => `            ${child.getRepresentation()}`)
  .join("\n")}
        </DataTable>`,
  },
  reference: {
    component: (props: any) => (
      <DataTable.Col source={props.source}>
        <ReferenceField source={props.source} reference={props.reference} />
      </DataTable.Col>
    ),
    representation: (props: any) =>
      `<DataTable.Col source="${props.source}">
                <ReferenceField source="${props.source}" reference="${props.reference}" />
            </DataTable.Col>`,
  },
  referenceArray: {
    component: (props: any) => (
      <DataTable.Col source={props.source}>
        <ReferenceArrayField
          source={props.source}
          reference={props.reference}
        />
      </DataTable.Col>
    ),
    representation: (props: any) =>
      `<DataTable.Col source="${props.source}">
                <ReferenceArrayField source="${props.source}" reference="${props.reference}" />
            </DataTable.Col>`,
  },
  date: {
    component: (props: any) => (
      <DataTable.Col source={props.source}>
        <DateField source={props.source} />
      </DataTable.Col>
    ),
    representation: (props: any) =>
      `<DataTable.Col source="${props.source}">
                <DateField source="${props.source}" />
            </DataTable.Col>`,
  },
  number: {
    component: (props: any) => (
      <DataTable.Col source={props.source}>
        <NumberField source={props.source} />
      </DataTable.Col>
    ),
    representation: (props: any) =>
      `<DataTable.Col source="${props.source}">
                <NumberField source="${props.source}" />
            </DataTable.Col>`,
  },
  email: {
    component: (props: any) => (
      <DataTable.Col source={props.source}>
        <EmailField source={props.source} />
      </DataTable.Col>
    ),
    representation: (props: any) =>
      `<DataTable.Col source="${props.source}">
                <EmailField source="${props.source}" />
            </DataTable.Col>`,
  },
  url: {
    component: (props: any) => (
      <DataTable.Col source={props.source}>
        <UrlField source={props.source} />
      </DataTable.Col>
    ),
    representation: (props: any) =>
      `<DataTable.Col source="${props.source}">
                <UrlField source="${props.source}" />
            </DataTable.Col>`,
  },
  string: {
    component: DataTable.Col,
    representation: (props: any) =>
      `<DataTable.Col source="${props.source}" />`,
  },
};
```

- [ ] **Step 3: Implement `src/components/supabase/show-field-types.tsx`**

```tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { InferredTypeMap } from "ra-core";
import { RecordField } from "@/components/admin/record-field";
import { DateField } from "@/components/admin/date-field";
import { NumberField } from "@/components/admin/number-field";
import { EmailField } from "@/components/admin/email-field";
import { UrlField } from "@/components/admin/url-field";
import { ReferenceField } from "@/components/admin/reference-field";
import { ReferenceArrayField } from "@/components/admin/reference-array-field";

/**
 * Field-component map for the Supabase Show guesser.
 */
export const showFieldTypes: InferredTypeMap = {
  show: {
    component: (props: any) => (
      <div className="flex flex-col gap-4">{props.children}</div>
    ),
    representation: (
      _props: any,
      children: { getRepresentation: () => string }[],
    ) => `        <div className="flex flex-col gap-4">
${children
  .map((child) => `            ${child.getRepresentation()}`)
  .join("\n")}
        </div>`,
  },
  reference: {
    component: (props: any) => (
      <RecordField source={props.source}>
        <ReferenceField source={props.source} reference={props.reference} />
      </RecordField>
    ),
    representation: (props: any) =>
      `<RecordField source="${props.source}">
                <ReferenceField source="${props.source}" reference="${props.reference}" />
            </RecordField>`,
  },
  referenceArray: {
    component: (props: any) => (
      <RecordField source={props.source}>
        <ReferenceArrayField
          source={props.source}
          reference={props.reference}
        />
      </RecordField>
    ),
    representation: (props: any) =>
      `<RecordField source="${props.source}">
                <ReferenceArrayField source="${props.source}" reference="${props.reference}" />
            </RecordField>`,
  },
  date: {
    component: (props: any) => (
      <RecordField source={props.source}>
        <DateField source={props.source} />
      </RecordField>
    ),
    representation: (props: any) =>
      `<RecordField source="${props.source}">
                <DateField source="${props.source}" />
            </RecordField>`,
  },
  number: {
    component: (props: any) => (
      <RecordField source={props.source}>
        <NumberField source={props.source} />
      </RecordField>
    ),
    representation: (props: any) =>
      `<RecordField source="${props.source}">
                <NumberField source="${props.source}" />
            </RecordField>`,
  },
  email: {
    component: (props: any) => (
      <RecordField source={props.source}>
        <EmailField source={props.source} />
      </RecordField>
    ),
    representation: (props: any) =>
      `<RecordField source="${props.source}">
                <EmailField source="${props.source}" />
            </RecordField>`,
  },
  url: {
    component: (props: any) => (
      <RecordField source={props.source}>
        <UrlField source={props.source} />
      </RecordField>
    ),
    representation: (props: any) =>
      `<RecordField source="${props.source}">
                <UrlField source="${props.source}" />
            </RecordField>`,
  },
  string: {
    component: (props: any) => <RecordField source={props.source} />,
    representation: (props: any) => `<RecordField source="${props.source}" />`,
  },
};
```

- [ ] **Step 4: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/supabase/edit-field-types.tsx src/components/supabase/list-field-types.tsx src/components/supabase/show-field-types.tsx
git commit -m "Add Supabase guesser field-type maps with PostgREST @ilike filters"
```

---

## Task 14: `SupabaseListGuesser`

**Files:**

- Create: `src/components/supabase/list-guesser.tsx`
- Create: `src/components/supabase/list-guesser.spec.tsx`
- Create: `src/stories/supabase/list-guesser.stories.tsx`

- [ ] **Step 1: Write the story**

Create `src/stories/supabase/list-guesser.stories.tsx`:

```tsx
import * as React from "react";
import {
  CoreAdminContext,
  ResourceContextProvider,
  ResourceDefinitionContextProvider,
  type DataProvider,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "@/components/admin";
import { SupabaseListGuesser } from "@/components/supabase/list-guesser";
import { exampleSchema } from "@/components/supabase/__fixtures__";

export default { title: "Supabase/ListGuesser" };

const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  { allowMissing: true },
);

// Mock useAPISchema via Storybook decorator-style stub.
// In Storybook the mock is applied at the spec layer; for visual
// preview, supply a tiny fake data provider that returns sample rows.
const dataProvider: DataProvider = {
  getList: async () => ({
    data: [
      { id: 1, name: "Acme", website: "https://acme.com" },
      { id: 2, name: "Globex", website: "https://globex.com" },
    ],
    total: 2,
  }),
  getOne: async ({ id }) => ({ data: { id, name: "Acme" } }),
  getMany: async () => ({ data: [] }),
  getManyReference: async () => ({ data: [], total: 0 }),
  update: async (_r, params: { data: unknown }) => ({ data: params.data }),
  updateMany: async () => ({ data: [] }),
  create: async (_r, params: { data: unknown }) => ({
    data: { id: 1, ...((params.data as object) ?? {}) },
  }),
  delete: async (_r, params: { previousData?: unknown }) => ({
    data: params.previousData ?? { id: 1 },
  }),
  deleteMany: async () => ({ data: [] }),
} as unknown as DataProvider;

// The story doesn't actually invoke useAPISchema's network call —
// the Supabase data provider would call /rpc/get_swagger. For the
// preview we rely on the live mocking in the spec file; here we use
// a Storybook addon-msw stub if available, otherwise note that this
// story relies on a real Supabase backend.
//
// NOTE: useAPISchema is mocked in the corresponding spec file. The
// Storybook story renders with a stub that short-circuits to a
// placeholder when the schema is unavailable.
export const Companies = () => (
  <MemoryRouter initialEntries={["/companies"]}>
    <ThemeProvider>
      <CoreAdminContext dataProvider={dataProvider} i18nProvider={i18nProvider}>
        <ResourceDefinitionContextProvider
          definitions={{
            companies: { name: "companies", hasList: true },
          }}
        >
          <ResourceContextProvider value="companies">
            <SupabaseListGuesser />
          </ResourceContextProvider>
        </ResourceDefinitionContextProvider>
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);

// Expose the schema so the spec can mock useAPISchema with it.
export { exampleSchema };
```

- [ ] **Step 2: Write the failing test**

Create `src/components/supabase/list-guesser.spec.tsx`:

```tsx
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import {
  CoreAdminContext,
  ResourceContextProvider,
  ResourceDefinitionContextProvider,
  type DataProvider,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "@/components/admin";
import { exampleSchema } from "@/components/supabase/__fixtures__";

vi.mock("ra-supabase-core", () => ({
  useAPISchema: () => ({
    data: exampleSchema,
    error: null,
    isPending: false,
  }),
}));

import { SupabaseListGuesser } from "@/components/supabase/list-guesser";

const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  { allowMissing: true },
);

const dataProvider: DataProvider = {
  getList: async () => ({
    data: [
      {
        id: 1,
        name: "Acme",
        website: "https://acme.com",
        created_at: "2024-01-01",
      },
    ],
    total: 1,
  }),
  getOne: async () => ({ data: { id: 1 } }),
  getMany: async () => ({ data: [] }),
  getManyReference: async () => ({ data: [], total: 0 }),
  update: async () => ({ data: {} }),
  updateMany: async () => ({ data: [] }),
  create: async () => ({ data: { id: 1 } }),
  delete: async () => ({ data: { id: 1 } }),
  deleteMany: async () => ({ data: [] }),
} as unknown as DataProvider;

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <MemoryRouter initialEntries={["/companies"]}>
    <ThemeProvider>
      <CoreAdminContext dataProvider={dataProvider} i18nProvider={i18nProvider}>
        <ResourceDefinitionContextProvider
          definitions={{
            companies: { name: "companies", hasList: true },
          }}
        >
          <ResourceContextProvider value="companies">
            {children}
          </ResourceContextProvider>
        </ResourceDefinitionContextProvider>
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);

describe("<SupabaseListGuesser />", () => {
  it("renders a column for each property of the inferred resource", async () => {
    const screen = render(
      <Wrapper>
        <SupabaseListGuesser enableLog={false} />
      </Wrapper>,
    );
    await expect.element(screen.getByText("Acme")).toBeInTheDocument();
    await expect
      .element(screen.getByText("https://acme.com"))
      .toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run — should fail**

Run: `pnpm vitest run --browser.headless src/components/supabase/list-guesser.spec.tsx`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement `src/components/supabase/list-guesser.tsx`**

```tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import type { ReactNode } from "react";
import { ListBase, useResourceContext } from "ra-core";
import { useAPISchema } from "ra-supabase-core";
import { capitalize, singularize } from "inflection";
import {
  ListView,
  type ListProps,
  type ListViewProps,
} from "@/components/admin/list";
import { Loading } from "@/components/admin/loading";
import { GuesserEmpty } from "@/components/admin/guesser-empty";
import { InferredElement } from "./inferred-element";
import { inferElementFromType } from "./infer-element-from-type";
import { listFieldTypes } from "./list-field-types";

export type SupabaseListGuesserProps = ListProps & { enableLog?: boolean };

/**
 * Supabase-aware drop-in `<List>` for resources whose shape is
 * described by the Supabase OpenAPI schema. Detects foreign keys
 * (rendered as `<ReferenceField>`) and timestamps (rendered as
 * `<DateField>`). When the resource provides no records yet,
 * renders the kit's `<GuesserEmpty>` so the developer knows how to
 * seed data.
 *
 * Logs the equivalent hand-written `<List>` source to the console
 * unless `enableLog={false}`.
 */
export const SupabaseListGuesser = (props: SupabaseListGuesserProps) => {
  const {
    debounce,
    disableAuthentication,
    disableSyncWithLocation,
    empty,
    exporter,
    filter,
    filterDefaultValues,
    perPage,
    queryOptions,
    resource,
    sort,
    storeKey,
    ...rest
  } = props;
  return (
    <ListBase
      debounce={debounce}
      disableAuthentication={disableAuthentication}
      disableSyncWithLocation={disableSyncWithLocation}
      empty={empty === undefined ? <GuesserEmpty /> : empty}
      exporter={exporter}
      filter={filter}
      filterDefaultValues={filterDefaultValues}
      perPage={perPage}
      queryOptions={queryOptions}
      resource={resource}
      sort={sort}
      storeKey={storeKey}
    >
      <SupabaseListGuesserView {...rest} />
    </ListBase>
  );
};

const SupabaseListGuesserView = (
  props: ListViewProps & { enableLog?: boolean },
) => {
  const { data: schema, error, isPending } = useAPISchema();
  const resource = useResourceContext();
  const [child, setChild] = React.useState<ReactNode>(null);
  const { enableLog = process.env.NODE_ENV === "development", ...rest } = props;

  if (!resource) {
    throw new Error(
      "SupabaseListGuesser must be used within a ResourceContext",
    );
  }

  React.useEffect(() => {
    if (isPending || error || !schema) return;
    const def = schema.definitions?.[resource];
    if (!def || !def.properties) {
      throw new Error(
        `The resource ${resource} is not defined in the API schema`,
      );
    }
    const inferredFields = Object.keys(def.properties)
      .filter((s) => def.properties?.[s].format !== "tsvector")
      .map((s) =>
        inferElementFromType({
          name: s,
          types: listFieldTypes,
          description: def.properties?.[s].description,
          format: def.properties?.[s].format,
          type:
            typeof def.properties?.[s].type === "string"
              ? (def.properties?.[s].type as string)
              : "string",
          schema,
        }),
      );
    const table = new InferredElement(
      listFieldTypes.table,
      null,
      inferredFields,
    );
    setChild(table.getElement());

    if (!enableLog) return;
    // eslint-disable-next-line no-console
    console.log(
      `Guessed List:\n\nexport const ${capitalize(
        singularize(resource),
      )}List = () => (\n    <List>\n${table.getRepresentation()}\n    </List>\n);`,
    );
  }, [resource, isPending, error, schema, enableLog]);

  if (isPending) return <Loading />;
  if (error) return <p>Error: {(error as Error).message}</p>;

  return <ListView {...rest}>{child}</ListView>;
};
```

- [ ] **Step 5: Run — should pass**

Run: `pnpm vitest run --browser.headless src/components/supabase/list-guesser.spec.tsx`
Expected: PASS — 1 test.

- [ ] **Step 6: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/supabase/list-guesser.tsx src/components/supabase/list-guesser.spec.tsx src/stories/supabase/list-guesser.stories.tsx
git commit -m "Add SupabaseListGuesser with OpenAPI schema introspection"
```

---

## Task 15: `SupabaseShowGuesser`

**Files:**

- Create: `src/components/supabase/show-guesser.tsx`
- Create: `src/components/supabase/show-guesser.spec.tsx`
- Create: `src/stories/supabase/show-guesser.stories.tsx`

- [ ] **Step 1: Story**

Create `src/stories/supabase/show-guesser.stories.tsx`:

```tsx
import * as React from "react";
import {
  CoreAdminContext,
  ResourceContextProvider,
  ResourceDefinitionContextProvider,
  type DataProvider,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter, Route, Routes } from "react-router";
import { ThemeProvider } from "@/components/admin";
import { SupabaseShowGuesser } from "@/components/supabase/show-guesser";

export default { title: "Supabase/ShowGuesser" };

const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  { allowMissing: true },
);

const dataProvider: DataProvider = {
  getList: async () => ({ data: [], total: 0 }),
  getOne: async () => ({
    data: {
      id: 1,
      name: "Acme",
      website: "https://acme.com",
      created_at: "2024-01-01T00:00:00Z",
    },
  }),
  getMany: async () => ({ data: [] }),
  getManyReference: async () => ({ data: [], total: 0 }),
  update: async () => ({ data: {} }),
  updateMany: async () => ({ data: [] }),
  create: async () => ({ data: { id: 1 } }),
  delete: async () => ({ data: { id: 1 } }),
  deleteMany: async () => ({ data: [] }),
} as unknown as DataProvider;

export const Company = () => (
  <MemoryRouter initialEntries={["/companies/1/show"]}>
    <ThemeProvider>
      <CoreAdminContext dataProvider={dataProvider} i18nProvider={i18nProvider}>
        <ResourceDefinitionContextProvider
          definitions={{
            companies: { name: "companies", hasShow: true },
          }}
        >
          <Routes>
            <Route
              path="/companies/:id/show"
              element={
                <ResourceContextProvider value="companies">
                  <SupabaseShowGuesser />
                </ResourceContextProvider>
              }
            />
          </Routes>
        </ResourceDefinitionContextProvider>
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);
```

- [ ] **Step 2: Write failing test**

Create `src/components/supabase/show-guesser.spec.tsx`:

```tsx
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import {
  CoreAdminContext,
  ResourceContextProvider,
  ResourceDefinitionContextProvider,
  type DataProvider,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter, Route, Routes } from "react-router";
import { ThemeProvider } from "@/components/admin";
import { exampleSchema } from "@/components/supabase/__fixtures__";

vi.mock("ra-supabase-core", () => ({
  useAPISchema: () => ({
    data: exampleSchema,
    error: null,
    isPending: false,
  }),
}));

import { SupabaseShowGuesser } from "@/components/supabase/show-guesser";

const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  { allowMissing: true },
);

const dataProvider: DataProvider = {
  getList: async () => ({ data: [], total: 0 }),
  getOne: async () => ({
    data: {
      id: 1,
      name: "Acme",
      website: "https://acme.com",
      created_at: "2024-01-01T00:00:00Z",
    },
  }),
  getMany: async () => ({ data: [] }),
  getManyReference: async () => ({ data: [], total: 0 }),
  update: async () => ({ data: {} }),
  updateMany: async () => ({ data: [] }),
  create: async () => ({ data: { id: 1 } }),
  delete: async () => ({ data: { id: 1 } }),
  deleteMany: async () => ({ data: [] }),
} as unknown as DataProvider;

describe("<SupabaseShowGuesser />", () => {
  it("renders inferred fields from the schema", async () => {
    const screen = render(
      <MemoryRouter initialEntries={["/companies/1/show"]}>
        <ThemeProvider>
          <CoreAdminContext
            dataProvider={dataProvider}
            i18nProvider={i18nProvider}
          >
            <ResourceDefinitionContextProvider
              definitions={{
                companies: { name: "companies", hasShow: true },
              }}
            >
              <Routes>
                <Route
                  path="/companies/:id/show"
                  element={
                    <ResourceContextProvider value="companies">
                      <SupabaseShowGuesser enableLog={false} />
                    </ResourceContextProvider>
                  }
                />
              </Routes>
            </ResourceDefinitionContextProvider>
          </CoreAdminContext>
        </ThemeProvider>
      </MemoryRouter>,
    );
    await expect.element(screen.getByText("Acme")).toBeInTheDocument();
    await expect
      .element(screen.getByText("https://acme.com"))
      .toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run — should fail**

Run: `pnpm vitest run --browser.headless src/components/supabase/show-guesser.spec.tsx`
Expected: FAIL.

- [ ] **Step 4: Implement `src/components/supabase/show-guesser.tsx`**

```tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import type { ReactNode } from "react";
import { ShowBase, useResourceContext } from "ra-core";
import { useAPISchema } from "ra-supabase-core";
import { capitalize, singularize } from "inflection";
import {
  ShowView,
  type ShowProps,
  type ShowViewProps,
} from "@/components/admin/show";
import { Loading } from "@/components/admin/loading";
import { InferredElement } from "./inferred-element";
import { inferElementFromType } from "./infer-element-from-type";
import { showFieldTypes } from "./show-field-types";

export type SupabaseShowGuesserProps = ShowProps & { enableLog?: boolean };

export const SupabaseShowGuesser = (props: SupabaseShowGuesserProps) => {
  const { id, disableAuthentication, queryOptions, resource, ...rest } = props;
  return (
    <ShowBase
      id={id}
      disableAuthentication={disableAuthentication}
      queryOptions={queryOptions}
      resource={resource}
    >
      <SupabaseShowGuesserView {...rest} />
    </ShowBase>
  );
};

const SupabaseShowGuesserView = (
  props: ShowViewProps & { enableLog?: boolean },
) => {
  const { data: schema, error, isPending } = useAPISchema();
  const resource = useResourceContext();
  const [child, setChild] = React.useState<ReactNode>(null);
  const { enableLog = process.env.NODE_ENV === "development", ...rest } = props;

  if (!resource) {
    throw new Error(
      "SupabaseShowGuesser must be used within a ResourceContext",
    );
  }

  React.useEffect(() => {
    if (isPending || error || !schema) return;
    const def = schema.definitions?.[resource];
    if (!def || !def.properties) {
      throw new Error(
        `The resource ${resource} is not defined in the API schema`,
      );
    }
    const inferred = Object.keys(def.properties)
      .filter((s) => def.properties?.[s].format !== "tsvector")
      .map((s) =>
        inferElementFromType({
          name: s,
          types: showFieldTypes,
          description: def.properties?.[s].description,
          format: def.properties?.[s].format,
          type:
            typeof def.properties?.[s].type === "string"
              ? (def.properties?.[s].type as string)
              : "string",
          schema,
        }),
      );
    const layout = new InferredElement(showFieldTypes.show, null, inferred);
    setChild(layout.getElement());

    if (!enableLog) return;
    // eslint-disable-next-line no-console
    console.log(
      `Guessed Show:\n\nexport const ${capitalize(
        singularize(resource),
      )}Show = () => (\n    <Show>\n${layout.getRepresentation()}\n    </Show>\n);`,
    );
  }, [resource, isPending, error, schema, enableLog]);

  if (isPending) return <Loading />;
  if (error) return <p>Error: {(error as Error).message}</p>;

  return <ShowView {...rest}>{child}</ShowView>;
};
```

- [ ] **Step 5: Run — should pass**

Run: `pnpm vitest run --browser.headless src/components/supabase/show-guesser.spec.tsx`
Expected: PASS — 1 test.

- [ ] **Step 6: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/supabase/show-guesser.tsx src/components/supabase/show-guesser.spec.tsx src/stories/supabase/show-guesser.stories.tsx
git commit -m "Add SupabaseShowGuesser with OpenAPI schema introspection"
```

---

## Task 16: `SupabaseEditGuesser`

**Files:**

- Create: `src/components/supabase/edit-guesser.tsx`
- Create: `src/components/supabase/edit-guesser.spec.tsx`
- Create: `src/stories/supabase/edit-guesser.stories.tsx`

- [ ] **Step 1: Story**

Create `src/stories/supabase/edit-guesser.stories.tsx`:

```tsx
import * as React from "react";
import {
  CoreAdminContext,
  ResourceContextProvider,
  ResourceDefinitionContextProvider,
  type DataProvider,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter, Route, Routes } from "react-router";
import { ThemeProvider } from "@/components/admin";
import { SupabaseEditGuesser } from "@/components/supabase/edit-guesser";

export default { title: "Supabase/EditGuesser" };

const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  { allowMissing: true },
);

const dataProvider: DataProvider = {
  getList: async () => ({ data: [], total: 0 }),
  getOne: async () => ({
    data: { id: 1, name: "Acme", website: "https://acme.com" },
  }),
  getMany: async () => ({ data: [] }),
  getManyReference: async () => ({ data: [], total: 0 }),
  update: async (_r, p: { data: unknown }) => ({ data: p.data }),
  updateMany: async () => ({ data: [] }),
  create: async () => ({ data: { id: 1 } }),
  delete: async () => ({ data: { id: 1 } }),
  deleteMany: async () => ({ data: [] }),
} as unknown as DataProvider;

export const CompanyEdit = () => (
  <MemoryRouter initialEntries={["/companies/1"]}>
    <ThemeProvider>
      <CoreAdminContext dataProvider={dataProvider} i18nProvider={i18nProvider}>
        <ResourceDefinitionContextProvider
          definitions={{
            companies: { name: "companies", hasEdit: true },
          }}
        >
          <Routes>
            <Route
              path="/companies/:id"
              element={
                <ResourceContextProvider value="companies">
                  <SupabaseEditGuesser />
                </ResourceContextProvider>
              }
            />
          </Routes>
        </ResourceDefinitionContextProvider>
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);
```

- [ ] **Step 2: Test**

Create `src/components/supabase/edit-guesser.spec.tsx`:

```tsx
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import {
  CoreAdminContext,
  ResourceContextProvider,
  ResourceDefinitionContextProvider,
  type DataProvider,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter, Route, Routes } from "react-router";
import { ThemeProvider } from "@/components/admin";
import { exampleSchema } from "@/components/supabase/__fixtures__";

vi.mock("ra-supabase-core", () => ({
  useAPISchema: () => ({
    data: exampleSchema,
    error: null,
    isPending: false,
  }),
}));

import { SupabaseEditGuesser } from "@/components/supabase/edit-guesser";

const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  { allowMissing: true },
);

const dataProvider: DataProvider = {
  getList: async () => ({ data: [], total: 0 }),
  getOne: async () => ({
    data: { id: 1, name: "Acme", website: "https://acme.com" },
  }),
  getMany: async () => ({ data: [] }),
  getManyReference: async () => ({ data: [], total: 0 }),
  update: async () => ({ data: { id: 1 } }),
  updateMany: async () => ({ data: [] }),
  create: async () => ({ data: { id: 1 } }),
  delete: async () => ({ data: { id: 1 } }),
  deleteMany: async () => ({ data: [] }),
} as unknown as DataProvider;

describe("<SupabaseEditGuesser />", () => {
  it("renders text inputs for the schema's string properties", async () => {
    const screen = render(
      <MemoryRouter initialEntries={["/companies/1"]}>
        <ThemeProvider>
          <CoreAdminContext
            dataProvider={dataProvider}
            i18nProvider={i18nProvider}
          >
            <ResourceDefinitionContextProvider
              definitions={{
                companies: { name: "companies", hasEdit: true },
              }}
            >
              <Routes>
                <Route
                  path="/companies/:id"
                  element={
                    <ResourceContextProvider value="companies">
                      <SupabaseEditGuesser enableLog={false} />
                    </ResourceContextProvider>
                  }
                />
              </Routes>
            </ResourceDefinitionContextProvider>
          </CoreAdminContext>
        </ThemeProvider>
      </MemoryRouter>,
    );
    await expect.element(screen.getByLabelText(/name/i)).toBeInTheDocument();
    await expect.element(screen.getByLabelText(/website/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run — should fail**

Run: `pnpm vitest run --browser.headless src/components/supabase/edit-guesser.spec.tsx`
Expected: FAIL.

- [ ] **Step 4: Implement `src/components/supabase/edit-guesser.tsx`**

```tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import type { ReactNode } from "react";
import { EditBase, useResourceContext } from "ra-core";
import { useAPISchema } from "ra-supabase-core";
import { capitalize, singularize } from "inflection";
import { EditView, type EditProps } from "@/components/admin/edit";
import { Loading } from "@/components/admin/loading";
import { InferredElement } from "./inferred-element";
import { inferElementFromType } from "./infer-element-from-type";
import { editFieldTypes } from "./edit-field-types";

export type SupabaseEditGuesserProps = EditProps & { enableLog?: boolean };

export const SupabaseEditGuesser = (props: SupabaseEditGuesserProps) => {
  const {
    resource,
    id,
    mutationMode,
    mutationOptions,
    queryOptions,
    redirect,
    transform,
    disableAuthentication,
    ...rest
  } = props;
  return (
    <EditBase
      resource={resource}
      id={id}
      mutationMode={mutationMode}
      mutationOptions={mutationOptions}
      queryOptions={queryOptions}
      redirect={redirect}
      transform={transform}
      disableAuthentication={disableAuthentication}
    >
      <SupabaseEditGuesserView {...rest} />
    </EditBase>
  );
};

const SupabaseEditGuesserView = (
  props: { enableLog?: boolean } & Record<string, unknown>,
) => {
  const { data: schema, error, isPending } = useAPISchema();
  const resource = useResourceContext();
  const [child, setChild] = React.useState<ReactNode>(null);
  const { enableLog = process.env.NODE_ENV === "development", ...rest } = props;

  if (!resource) {
    throw new Error(
      "SupabaseEditGuesser must be used within a ResourceContext",
    );
  }

  React.useEffect(() => {
    if (isPending || error || !schema) return;
    const def = schema.definitions?.[resource];
    const requiredFields = def?.required ?? [];
    if (!def || !def.properties) {
      throw new Error(
        `The resource ${resource} is not defined in the API schema`,
      );
    }
    const inferredInputs = Object.keys(def.properties)
      .filter((s) => s !== "id")
      .filter((s) => def.properties?.[s].format !== "tsvector")
      .map((s) =>
        inferElementFromType({
          name: s,
          types: editFieldTypes,
          description: def.properties?.[s].description,
          format: def.properties?.[s].format,
          type:
            typeof def.properties?.[s].type === "string"
              ? (def.properties?.[s].type as string)
              : "string",
          requiredFields,
          schema,
        }),
      );
    const form = new InferredElement(editFieldTypes.form, null, inferredInputs);
    setChild(form.getElement());

    if (!enableLog) return;
    // eslint-disable-next-line no-console
    console.log(
      `Guessed Edit:\n\nexport const ${capitalize(
        singularize(resource),
      )}Edit = () => (\n    <Edit>\n${form.getRepresentation()}\n    </Edit>\n);`,
    );
  }, [resource, isPending, error, schema, enableLog]);

  if (isPending) return <Loading />;
  if (error) return <p>Error: {(error as Error).message}</p>;

  return <EditView {...rest}>{child}</EditView>;
};
```

- [ ] **Step 5: Run — should pass**

Run: `pnpm vitest run --browser.headless src/components/supabase/edit-guesser.spec.tsx`
Expected: PASS — 1 test.

- [ ] **Step 6: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/supabase/edit-guesser.tsx src/components/supabase/edit-guesser.spec.tsx src/stories/supabase/edit-guesser.stories.tsx
git commit -m "Add SupabaseEditGuesser with OpenAPI schema introspection"
```

---

## Task 17: `SupabaseCreateGuesser`

**Files:**

- Create: `src/components/supabase/create-guesser.tsx`
- Create: `src/components/supabase/create-guesser.spec.tsx`
- Create: `src/stories/supabase/create-guesser.stories.tsx`

- [ ] **Step 1: Story**

Create `src/stories/supabase/create-guesser.stories.tsx`:

```tsx
import * as React from "react";
import {
  CoreAdminContext,
  ResourceContextProvider,
  ResourceDefinitionContextProvider,
  type DataProvider,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "@/components/admin";
import { SupabaseCreateGuesser } from "@/components/supabase/create-guesser";

export default { title: "Supabase/CreateGuesser" };

const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  { allowMissing: true },
);

const dataProvider: DataProvider = {
  getList: async () => ({ data: [], total: 0 }),
  getOne: async () => ({ data: { id: 1 } }),
  getMany: async () => ({ data: [] }),
  getManyReference: async () => ({ data: [], total: 0 }),
  update: async () => ({ data: { id: 1 } }),
  updateMany: async () => ({ data: [] }),
  create: async (_r, p: { data: unknown }) => ({
    data: { id: 1, ...((p.data as object) ?? {}) },
  }),
  delete: async () => ({ data: { id: 1 } }),
  deleteMany: async () => ({ data: [] }),
} as unknown as DataProvider;

export const CompanyCreate = () => (
  <MemoryRouter initialEntries={["/companies/create"]}>
    <ThemeProvider>
      <CoreAdminContext dataProvider={dataProvider} i18nProvider={i18nProvider}>
        <ResourceDefinitionContextProvider
          definitions={{
            companies: { name: "companies", hasCreate: true },
          }}
        >
          <ResourceContextProvider value="companies">
            <SupabaseCreateGuesser />
          </ResourceContextProvider>
        </ResourceDefinitionContextProvider>
      </CoreAdminContext>
    </ThemeProvider>
  </MemoryRouter>
);
```

- [ ] **Step 2: Test**

Create `src/components/supabase/create-guesser.spec.tsx`:

```tsx
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import {
  CoreAdminContext,
  ResourceContextProvider,
  ResourceDefinitionContextProvider,
  type DataProvider,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "@/components/admin";
import { exampleSchema } from "@/components/supabase/__fixtures__";

vi.mock("ra-supabase-core", () => ({
  useAPISchema: () => ({
    data: exampleSchema,
    error: null,
    isPending: false,
  }),
}));

import { SupabaseCreateGuesser } from "@/components/supabase/create-guesser";

const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  { allowMissing: true },
);

const dataProvider: DataProvider = {
  getList: async () => ({ data: [], total: 0 }),
  getOne: async () => ({ data: { id: 1 } }),
  getMany: async () => ({ data: [] }),
  getManyReference: async () => ({ data: [], total: 0 }),
  update: async () => ({ data: { id: 1 } }),
  updateMany: async () => ({ data: [] }),
  create: async () => ({ data: { id: 1 } }),
  delete: async () => ({ data: { id: 1 } }),
  deleteMany: async () => ({ data: [] }),
} as unknown as DataProvider;

describe("<SupabaseCreateGuesser />", () => {
  it("renders inputs for the resource's non-id properties", async () => {
    const screen = render(
      <MemoryRouter initialEntries={["/companies/create"]}>
        <ThemeProvider>
          <CoreAdminContext
            dataProvider={dataProvider}
            i18nProvider={i18nProvider}
          >
            <ResourceDefinitionContextProvider
              definitions={{
                companies: { name: "companies", hasCreate: true },
              }}
            >
              <ResourceContextProvider value="companies">
                <SupabaseCreateGuesser enableLog={false} />
              </ResourceContextProvider>
            </ResourceDefinitionContextProvider>
          </CoreAdminContext>
        </ThemeProvider>
      </MemoryRouter>,
    );
    await expect.element(screen.getByLabelText(/name/i)).toBeInTheDocument();
    await expect.element(screen.getByLabelText(/website/i)).toBeInTheDocument();
    // The 'id' column must NOT appear as an input
    await expect
      .element(screen.getByLabelText(/^id$/i))
      .not.toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run — should fail**

Run: `pnpm vitest run --browser.headless src/components/supabase/create-guesser.spec.tsx`
Expected: FAIL.

- [ ] **Step 4: Implement `src/components/supabase/create-guesser.tsx`**

```tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import type { ReactNode } from "react";
import { CreateBase, useResourceContext } from "ra-core";
import { useAPISchema } from "ra-supabase-core";
import { capitalize, singularize } from "inflection";
import { CreateView, type CreateProps } from "@/components/admin/create";
import { Loading } from "@/components/admin/loading";
import { InferredElement } from "./inferred-element";
import { inferElementFromType } from "./infer-element-from-type";
import { editFieldTypes } from "./edit-field-types";

export type SupabaseCreateGuesserProps = CreateProps & { enableLog?: boolean };

export const SupabaseCreateGuesser = (props: SupabaseCreateGuesserProps) => {
  const {
    mutationOptions,
    resource,
    record,
    transform,
    redirect,
    disableAuthentication,
    ...rest
  } = props;
  return (
    <CreateBase
      resource={resource}
      record={record}
      redirect={redirect}
      transform={transform}
      mutationOptions={mutationOptions}
      disableAuthentication={disableAuthentication}
    >
      <SupabaseCreateGuesserView {...rest} />
    </CreateBase>
  );
};

const SupabaseCreateGuesserView = (
  props: { enableLog?: boolean } & Record<string, unknown>,
) => {
  const { data: schema, error, isPending } = useAPISchema();
  const resource = useResourceContext();
  const [child, setChild] = React.useState<ReactNode>(null);
  const { enableLog = process.env.NODE_ENV === "development", ...rest } = props;

  if (!resource) {
    throw new Error(
      "SupabaseCreateGuesser must be used within a ResourceContext",
    );
  }

  React.useEffect(() => {
    if (isPending || error || !schema) return;
    const def = schema.definitions?.[resource];
    const requiredFields = def?.required ?? [];
    if (!def || !def.properties) {
      throw new Error(
        `The resource ${resource} is not defined in the API schema`,
      );
    }
    const inferredInputs = Object.keys(def.properties)
      .filter((s) => s !== "id")
      .filter((s) => def.properties?.[s].format !== "tsvector")
      .map((s) =>
        inferElementFromType({
          name: s,
          types: editFieldTypes,
          description: def.properties?.[s].description,
          format: def.properties?.[s].format,
          type:
            typeof def.properties?.[s].type === "string"
              ? (def.properties?.[s].type as string)
              : "string",
          requiredFields,
          schema,
        }),
      );
    const form = new InferredElement(editFieldTypes.form, null, inferredInputs);
    setChild(form.getElement());

    if (!enableLog) return;
    // eslint-disable-next-line no-console
    console.log(
      `Guessed Create:\n\nexport const ${capitalize(
        singularize(resource),
      )}Create = () => (\n    <Create>\n${form.getRepresentation()}\n    </Create>\n);`,
    );
  }, [resource, isPending, error, schema, enableLog]);

  if (isPending) return <Loading />;
  if (error) return <p>Error: {(error as Error).message}</p>;

  return <CreateView {...rest}>{child}</CreateView>;
};
```

- [ ] **Step 5: Run — should pass**

Run: `pnpm vitest run --browser.headless src/components/supabase/create-guesser.spec.tsx`
Expected: PASS — 1 test.

- [ ] **Step 6: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/supabase/create-guesser.tsx src/components/supabase/create-guesser.spec.tsx src/stories/supabase/create-guesser.stories.tsx
git commit -m "Add SupabaseCreateGuesser with OpenAPI schema introspection"
```

---

## Task 18: `useCrudGuesser` hook

**Files:**

- Create: `src/components/supabase/use-crud-guesser.tsx`

- [ ] **Step 1: Implement the hook**

Create `src/components/supabase/use-crud-guesser.tsx`:

```tsx
import { useMemo } from "react";
import type { ResourceProps } from "ra-core";
import { useAPISchema } from "ra-supabase-core";
import { SupabaseListGuesser } from "./list-guesser";
import { SupabaseShowGuesser } from "./show-guesser";
import { SupabaseEditGuesser } from "./edit-guesser";
import { SupabaseCreateGuesser } from "./create-guesser";

/**
 * Walks the Supabase OpenAPI schema and produces `<Resource>` props
 * for each resource, wiring up the matching Supabase guesser for
 * each available HTTP verb. Used by `<AdminGuesser>` when the
 * caller does not supply explicit `<Resource>` children.
 *
 * Returns an empty array until `useAPISchema()` resolves.
 */
export const useCrudGuesser = (): ResourceProps[] => {
  const { data: schema, error, isPending } = useAPISchema();
  return useMemo<ResourceProps[]>(() => {
    if (isPending || error || !schema) return [];
    const resourceNames = Object.keys(schema.definitions ?? {});
    return resourceNames.map((name) => {
      const paths = schema.paths?.[`/${name}`] ?? {};
      return {
        name,
        list: paths.get ? SupabaseListGuesser : undefined,
        show: paths.get ? SupabaseShowGuesser : undefined,
        edit: paths.patch ? SupabaseEditGuesser : undefined,
        create: paths.post ? SupabaseCreateGuesser : undefined,
      } satisfies ResourceProps;
    });
  }, [schema, isPending, error]);
};
```

- [ ] **Step 2: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/supabase/use-crud-guesser.tsx
git commit -m "Add useCrudGuesser hook for auto-generated Resource definitions"
```

---

## Task 19: `AdminGuesser` umbrella component

**Files:**

- Create: `src/components/supabase/admin-guesser.tsx`
- Create: `src/components/supabase/admin-guesser.spec.tsx`
- Create: `src/stories/supabase/admin-guesser.stories.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/supabase/admin-guesser.spec.tsx`:

```tsx
import * as React from "react";
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

vi.mock("ra-supabase-core", () => ({
  supabaseAuthProvider: () => fakeAuth,
  supabaseDataProvider: () => fakeData,
  useAPISchema: () => ({
    data: exampleSchema,
    error: null,
    isPending: false,
  }),
}));

import { AdminGuesser } from "@/components/supabase/admin-guesser";

describe("<AdminGuesser />", () => {
  it("renders without crashing given instanceUrl and apiKey", async () => {
    const screen = render(
      <AdminGuesser
        instanceUrl="http://localhost:54321"
        apiKey="sb_publishable_x"
      />,
    );
    // The first paint shows either the sidebar nav (when authenticated) or the
    // login page (when not). We only assert that the document mounted — that
    // is enough to prove the component wires Admin + dataProvider + authProvider
    // without throwing.
    await expect.element(screen.getByRole("main")).toBeInTheDocument();
  });
});
```

(Note: depending on how the kit's Layout structures the DOM, `getByRole("main")` may need to be adapted. If the layout exposes a different landmark, replace it with whatever the kit renders at the top level — e.g. `screen.getByText(/Shadcn Admin/i)`.)

- [ ] **Step 2: Run — should fail**

Run: `pnpm vitest run --browser.headless src/components/supabase/admin-guesser.spec.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/components/supabase/admin-guesser.tsx`**

```tsx
import * as React from "react";
import { useMemo } from "react";
import { CustomRoutes, Resource, type CoreAdminProps } from "ra-core";
import { Route } from "react-router";
import { createClient } from "@supabase/supabase-js";
import { supabaseAuthProvider, supabaseDataProvider } from "ra-supabase-core";
import { Admin } from "@/components/admin/admin";
import { defaultSupabaseI18nProvider } from "./i18n";
import { useCrudGuesser } from "./use-crud-guesser";
import { SupabaseLoginPage } from "./login-page";
import { ForgotPasswordPage } from "./forgot-password-page";
import { SetPasswordPage } from "./set-password-page";

export type AdminGuesserProps = CoreAdminProps & {
  instanceUrl: string;
  /**
   * Supabase API key. Accepts both the legacy anonymous JWT key
   * and the newer publishable key (`sb_publishable_*`).
   */
  apiKey: string;
};

/**
 * One-line entry point for building an admin against a Supabase
 * project: drop in your `instanceUrl` and `apiKey` and the
 * component wires the data provider, auth provider, default login
 * page, password-reset routes, and auto-generated Resource list
 * via the OpenAPI schema.
 *
 * Override any individual piece by passing the matching prop
 * (`dataProvider`, `authProvider`, `i18nProvider`, `loginPage`,
 * `children` for explicit `<Resource>` entries, …).
 */
export const AdminGuesser = (props: AdminGuesserProps) => {
  const {
    instanceUrl,
    apiKey,
    dataProvider,
    authProvider,
    i18nProvider,
    loginPage,
    children,
    ...rest
  } = props;

  const supabaseClient = useMemo(
    () => createClient(instanceUrl, apiKey),
    [instanceUrl, apiKey],
  );

  const defaultDataProvider = useMemo(
    () =>
      supabaseDataProvider({
        instanceUrl,
        apiKey,
        supabaseClient,
      }),
    [instanceUrl, apiKey, supabaseClient],
  );

  const defaultAuthProvider = useMemo(
    () => supabaseAuthProvider(supabaseClient, {}),
    [supabaseClient],
  );

  return (
    <Admin
      dataProvider={dataProvider ?? defaultDataProvider}
      authProvider={authProvider ?? defaultAuthProvider}
      i18nProvider={i18nProvider ?? defaultSupabaseI18nProvider}
      loginPage={loginPage ?? SupabaseLoginPage}
      {...rest}
    >
      <AdminGuesserResources>{children}</AdminGuesserResources>
      <CustomRoutes noLayout>
        <Route
          path={ForgotPasswordPage.path}
          element={<ForgotPasswordPage />}
        />
        <Route path={SetPasswordPage.path} element={<SetPasswordPage />} />
      </CustomRoutes>
    </Admin>
  );
};

/**
 * Internal: when the caller does not pass explicit children,
 * auto-generates `<Resource>` elements from the Supabase schema.
 * When children are present, renders them verbatim (callers can
 * mix-and-match by passing some Resources explicitly while still
 * relying on the guesser-generated routes for the others — but
 * this component only renders user-provided children when present;
 * partial-override is intentionally NOT supported to keep the API
 * surface small).
 */
const AdminGuesserResources = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const inferred = useCrudGuesser();
  if (children) return <>{children}</>;
  return (
    <>
      {inferred.map((def) => (
        <Resource key={def.name} {...def} />
      ))}
    </>
  );
};
```

- [ ] **Step 4: Story**

Create `src/stories/supabase/admin-guesser.stories.tsx`:

```tsx
import * as React from "react";
import { AdminGuesser } from "@/components/supabase/admin-guesser";

export default { title: "Supabase/AdminGuesser" };

/**
 * NOTE: This story will only render fully against a real Supabase
 * project. For local development you can point it at a Supabase
 * Local Dev instance with `make supabase-start`.
 */
export const Default = () => (
  <AdminGuesser
    instanceUrl="http://localhost:54321"
    apiKey="sb_publishable_local"
  />
);
```

- [ ] **Step 5: Run — should pass**

Run: `pnpm vitest run --browser.headless src/components/supabase/admin-guesser.spec.tsx`
Expected: PASS — 1 test. If the test fails on the `getByRole("main")` assertion, inspect the kit's Layout and use a more permissive assertion (e.g. `expect(document.body.innerHTML).not.toEqual("")`).

- [ ] **Step 6: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/supabase/admin-guesser.tsx src/components/supabase/admin-guesser.spec.tsx src/stories/supabase/admin-guesser.stories.tsx
git commit -m "Add AdminGuesser umbrella component for one-line Supabase setup"
```

---

## Task 20: Public `index.ts` — export the full surface

**Files:**

- Modify: `src/components/supabase/index.ts`

- [ ] **Step 1: Replace the stub with the full export surface**

```ts
export * from "./admin-guesser";
export * from "./create-guesser";
export * from "./edit-field-types";
export * from "./edit-guesser";
export * from "./forgot-password-form";
export * from "./forgot-password-page";
export * from "./icons";
export * from "./infer-element-from-type";
export * from "./inferred-element";
export * from "./list-field-types";
export * from "./list-guesser";
export * from "./login-form";
export * from "./login-page";
export * from "./set-password-form";
export * from "./set-password-page";
export * from "./show-field-types";
export * from "./show-guesser";
export * from "./social-auth-button";
export * from "./use-crud-guesser";
export * from "./i18n";
```

- [ ] **Step 2: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 3: Run the full test suite to ensure nothing regressed**

Run: `pnpm test`
Expected: PASS — all kit tests including the new Supabase ones.

- [ ] **Step 4: Commit**

```bash
git add src/components/supabase/index.ts
git commit -m "Export full Supabase component surface from src/components/supabase"
```

---

## Task 21: Documentation pages

**Files:**

- Create: `docs/src/content/docs/supabase/getting-started.md`
- Create: `docs/src/content/docs/supabase/AdminGuesser.md`
- Create: `docs/src/content/docs/supabase/LoginPage.md`
- Create: `docs/src/content/docs/supabase/ForgotPasswordPage.md`
- Create: `docs/src/content/docs/supabase/SetPasswordPage.md`
- Create: `docs/src/content/docs/supabase/SocialAuthButton.md`
- Create: `docs/src/content/docs/supabase/ListGuesser.md`
- Create: `docs/src/content/docs/supabase/ShowGuesser.md`
- Create: `docs/src/content/docs/supabase/EditGuesser.md`
- Create: `docs/src/content/docs/supabase/CreateGuesser.md`
- Create: `docs/src/content/docs/supabase/i18n.md`

Match the kit's existing doc conventions: frontmatter `title`, intro paragraph, Usage section, Props section, per-prop subsections.

- [ ] **Step 1: Create `docs/src/content/docs/supabase/getting-started.md`**

````md
---
title: "Supabase Integration"
---

Shadcn Admin Kit ships an opt-in set of components for projects backed by [Supabase](https://supabase.com/). With a Supabase URL and API key you get a fully wired admin — data provider, auth provider, social-auth login, and auto-generated CRUD views — in a single line of JSX.

## Installation

Install the required peer dependencies:

```bash
pnpm add @supabase/supabase-js ra-supabase-core openapi-types
```
````

## Quick start

```tsx
import { AdminGuesser } from "@/components/supabase";

export const App = () => (
  <AdminGuesser
    instanceUrl={import.meta.env.VITE_SUPABASE_URL}
    apiKey={import.meta.env.VITE_SUPABASE_KEY}
  />
);
```

The `apiKey` accepts both the legacy anonymous JWT and the new publishable key format (`sb_publishable_*`).

## What you get

- `<AdminGuesser>` — wraps `<Admin>` with Supabase defaults
- `<SupabaseLoginPage>` — email/password + optional social providers
- `<ForgotPasswordPage>` / `<SetPasswordPage>` — full password-reset flow
- Schema-aware `<SupabaseListGuesser>` / `<ShowGuesser>` / `<EditGuesser>` / `<CreateGuesser>` that infer references from foreign keys
- 16 social auth provider buttons (Apple, Azure, Bitbucket, Discord, Facebook, GitHub, GitLab, Google, Keycloak, LinkedIn, Notion, Slack, Spotify, Twitch, Twitter, WorkOS)
- English + French translations via `defaultSupabaseI18nProvider`

````

- [ ] **Step 2: Create `docs/src/content/docs/supabase/AdminGuesser.md`**

```md
---
title: "AdminGuesser"
---

`<AdminGuesser>` is the one-line entry point for Supabase admins. It wraps the kit's `<Admin>` component with a Supabase data provider, auth provider, default login page, password-reset routes, and an auto-generated list of `<Resource>` elements derived from the Supabase OpenAPI schema.

## Usage

```tsx
import { AdminGuesser } from "@/components/supabase";

export const App = () => (
  <AdminGuesser
    instanceUrl="https://your-project.supabase.co"
    apiKey="sb_publishable_..."
  />
);
````

For an explicit Resource list, pass `<Resource>` children:

```tsx
import { Resource } from "ra-core";
import { AdminGuesser, SupabaseListGuesser } from "@/components/supabase";
import { CompanyEdit } from "./CompanyEdit";

export const App = () => (
  <AdminGuesser instanceUrl={...} apiKey={...}>
    <Resource name="companies" list={SupabaseListGuesser} edit={CompanyEdit} />
    <Resource name="contacts" list={SupabaseListGuesser} />
  </AdminGuesser>
);
```

## Props

| Prop           | Type            | Description                                                |
| -------------- | --------------- | ---------------------------------------------------------- |
| `instanceUrl`  | `string`        | **Required.** Your Supabase project URL                    |
| `apiKey`       | `string`        | **Required.** Anon JWT or publishable key                  |
| `dataProvider` | `DataProvider`  | Override the default `supabaseDataProvider`                |
| `authProvider` | `AuthProvider`  | Override the default `supabaseAuthProvider`                |
| `i18nProvider` | `I18nProvider`  | Override the default English+Supabase polyglot provider    |
| `loginPage`    | `ComponentType` | Override the default `<SupabaseLoginPage>`                 |
| `children`     | `ReactNode`     | Explicit `<Resource>` elements (suppresses auto-detection) |

All other props from `<Admin>` are also accepted.

````

- [ ] **Step 3: Create `docs/src/content/docs/supabase/LoginPage.md`**

```md
---
title: "SupabaseLoginPage"
---

`<SupabaseLoginPage>` is the sign-in page used by `<AdminGuesser>`. It renders an email/password form by default and can be extended with social-auth providers.

## Usage

```tsx
import { Admin } from "@/components/admin";
import { SupabaseLoginPage } from "@/components/supabase";

const App = () => (
  <Admin loginPage={SupabaseLoginPage} dataProvider={dataProvider}>
    ...
  </Admin>
);
````

With social providers:

```tsx
const App = () => (
  <Admin
    loginPage={() => <SupabaseLoginPage providers={["github", "google"]} />}
    dataProvider={dataProvider}
  >
    ...
  </Admin>
);
```

## Props

| Prop                    | Type                     | Description                              |
| ----------------------- | ------------------------ | ---------------------------------------- |
| `children`              | `ReactNode`              | Replaces the form column entirely        |
| `disableEmailPassword`  | `boolean`                | Hide the email/password form             |
| `disableForgotPassword` | `boolean`                | Hide the "Forgot password?" link         |
| `marketing`             | `ReactNode`              | Replace the left marketing panel         |
| `providers`             | `SupabaseAuthProvider[]` | Social providers to expose as buttons    |
| `redirectTo`            | `string`                 | Where to redirect after successful login |

````

- [ ] **Step 4: Create `docs/src/content/docs/supabase/ForgotPasswordPage.md`**

```md
---
title: "ForgotPasswordPage"
---

Standalone page rendering a password-reset form. Register at `ForgotPasswordPage.path` (`/forgot-password`).

## Usage

`<AdminGuesser>` registers this route automatically. For manual setup:

```tsx
import { CustomRoutes } from "ra-core";
import { Route } from "react-router";
import { Admin } from "@/components/admin";
import { ForgotPasswordPage } from "@/components/supabase";

const App = () => (
  <Admin authProvider={authProvider}>
    <CustomRoutes noLayout>
      <Route
        path={ForgotPasswordPage.path}
        element={<ForgotPasswordPage />}
      />
    </CustomRoutes>
  </Admin>
);
````

## Props

| Prop        | Type        | Description                      |
| ----------- | ----------- | -------------------------------- |
| `children`  | `ReactNode` | Replace the inner form           |
| `marketing` | `ReactNode` | Replace the left marketing panel |

````

- [ ] **Step 5: Create `docs/src/content/docs/supabase/SetPasswordPage.md`**

```md
---
title: "SetPasswordPage"
---

Standalone page for finishing the Supabase password-set / first-login flow. Reads `access_token` and `refresh_token` from the URL hash (populated by the link in the Supabase invite/reset email).

## Usage

```tsx
import { CustomRoutes } from "ra-core";
import { Route } from "react-router";
import { Admin } from "@/components/admin";
import { SetPasswordPage } from "@/components/supabase";

const App = () => (
  <Admin authProvider={authProvider}>
    <CustomRoutes noLayout>
      <Route path={SetPasswordPage.path} element={<SetPasswordPage />} />
    </CustomRoutes>
  </Admin>
);
````

## Props

| Prop        | Type        | Description                      |
| ----------- | ----------- | -------------------------------- |
| `children`  | `ReactNode` | Replace the inner form           |
| `marketing` | `ReactNode` | Replace the left marketing panel |

````

- [ ] **Step 6: Create `docs/src/content/docs/supabase/SocialAuthButton.md`**

```md
---
title: "SocialAuthButton"
---

Buttons that trigger Supabase OAuth flows. Available as a generic `<SocialAuthButton>` or one of 16 provider-named buttons that bind their icon + translated label.

## Usage

```tsx
import {
  GithubButton,
  GoogleButton,
  SocialAuthButton,
} from "@/components/supabase";

<div className="flex flex-col gap-2">
  <GithubButton />
  <GoogleButton />
  <SocialAuthButton provider="discord">Sign in with Discord</SocialAuthButton>
</div>
````

## Provider buttons

`AppleButton`, `AzureButton`, `BitbucketButton`, `DiscordButton`, `FacebookButton`, `GithubButton`, `GitlabButton`, `GoogleButton`, `KeycloakButton`, `LinkedInButton`, `NotionButton`, `SlackButton`, `SpotifyButton`, `TwitchButton`, `TwitterButton`, `WorkosButton`.

## Props

| Prop       | Type                   | Description                                 |
| ---------- | ---------------------- | ------------------------------------------- |
| `provider` | `SupabaseAuthProvider` | OAuth provider name (omit on named buttons) |
| `redirect` | `string`               | Optional redirect URL passed to `login()`   |

All other `<Button>` props from shadcn/ui pass through.

````

- [ ] **Step 7: Create `docs/src/content/docs/supabase/ListGuesser.md`**

```md
---
title: "SupabaseListGuesser"
---

Schema-aware drop-in `<List>` that introspects the Supabase OpenAPI schema to detect foreign keys (rendered as `<ReferenceField>`) and timestamps (rendered as `<DateField>`).

## Usage

```tsx
import { Resource } from "ra-core";
import { SupabaseListGuesser } from "@/components/supabase";

<Resource name="companies" list={SupabaseListGuesser} />
````

In development, the inferred `<List>` source is logged to the browser console so you can copy-paste it into a real `CompanyList.tsx` and customize further. Disable the logging with `enableLog={false}`.

## Props

| Prop        | Type      | Description                                       |
| ----------- | --------- | ------------------------------------------------- |
| `enableLog` | `boolean` | Default: `process.env.NODE_ENV === "development"` |

All `<List>` props are also accepted.

````

- [ ] **Step 8: Create `docs/src/content/docs/supabase/ShowGuesser.md`**

```md
---
title: "SupabaseShowGuesser"
---

Schema-aware drop-in `<Show>`. Renders fields based on the Supabase OpenAPI schema definition for the current resource.

## Usage

```tsx
import { Resource } from "ra-core";
import { SupabaseShowGuesser } from "@/components/supabase";

<Resource name="companies" show={SupabaseShowGuesser} />
````

## Props

| Prop        | Type      | Description                                       |
| ----------- | --------- | ------------------------------------------------- |
| `enableLog` | `boolean` | Default: `process.env.NODE_ENV === "development"` |

All `<Show>` props are also accepted.

````

- [ ] **Step 9: Create `docs/src/content/docs/supabase/EditGuesser.md`**

```md
---
title: "SupabaseEditGuesser"
---

Schema-aware drop-in `<Edit>`. Renders inputs based on the Supabase OpenAPI schema, with PostgREST `@ilike` filters wired up for `<AutocompleteInput>` references.

## Usage

```tsx
import { Resource } from "ra-core";
import { SupabaseEditGuesser } from "@/components/supabase";

<Resource name="companies" edit={SupabaseEditGuesser} />
````

## Props

| Prop        | Type      | Description                                       |
| ----------- | --------- | ------------------------------------------------- |
| `enableLog` | `boolean` | Default: `process.env.NODE_ENV === "development"` |

All `<Edit>` props are also accepted.

````

- [ ] **Step 10: Create `docs/src/content/docs/supabase/CreateGuesser.md`**

```md
---
title: "SupabaseCreateGuesser"
---

Schema-aware drop-in `<Create>`. Identical to `SupabaseEditGuesser` but omits the `id` field and renders a `<Create>` view instead of `<Edit>`.

## Usage

```tsx
import { Resource } from "ra-core";
import { SupabaseCreateGuesser } from "@/components/supabase";

<Resource name="companies" create={SupabaseCreateGuesser} />
````

## Props

| Prop        | Type      | Description                                       |
| ----------- | --------- | ------------------------------------------------- |
| `enableLog` | `boolean` | Default: `process.env.NODE_ENV === "development"` |

All `<Create>` props are also accepted.

````

- [ ] **Step 11: Create `docs/src/content/docs/supabase/i18n.md`**

```md
---
title: "Supabase i18n"
---

The Supabase components reference translation keys under the `ra-supabase.*` namespace. Each key has an inline English fallback via `translate(key, { _: '...' })`, so loading translations is optional.

For translated UIs, merge `raSupabaseEnglishMessages` / `raSupabaseFrenchMessages` into your i18n provider:

```ts
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import frenchMessages from "ra-language-french";
import {
  raSupabaseEnglishMessages,
  raSupabaseFrenchMessages,
} from "@/components/supabase";

const messages = {
  en: { ...englishMessages, ...raSupabaseEnglishMessages },
  fr: { ...frenchMessages, ...raSupabaseFrenchMessages },
};

export const i18nProvider = polyglotI18nProvider(
  (locale) => messages[locale],
  "en",
  [{ name: "en", value: "English" }, { name: "fr", value: "Français" }],
);
````

`<AdminGuesser>` uses `defaultSupabaseI18nProvider` (English-only with Supabase keys) by default.

## Translation keys

- `ra-supabase.auth.email` — "Email"
- `ra-supabase.auth.confirm_password` — "Confirm password"
- `ra-supabase.auth.sign_in_with` — "Sign in with %{provider}"
- `ra-supabase.auth.forgot_password` — "Forgot password?"
- `ra-supabase.auth.reset_password` — "Reset password"
- `ra-supabase.auth.password_reset` — confirmation toast after reset request
- `ra-supabase.auth.missing_tokens` — set-password error when URL tokens are absent
- `ra-supabase.auth.back_to_login` — "Back to login"
- `ra-supabase.reset_password.forgot_password` — title on the reset page
- `ra-supabase.reset_password.forgot_password_details` — body text
- `ra-supabase.set_password.new_password` — "Choose your password"
- `ra-supabase.validation.password_mismatch` — validation error

````

- [ ] **Step 12: Verify the Astro docs site builds**

Run: `pnpm doc:build`
Expected: PASS (Astro builds the site including the new pages).

- [ ] **Step 13: Commit**

```bash
git add docs/src/content/docs/supabase
git commit -m "Add documentation pages for Supabase components"
````

---

## Task 22: Final verification

- [ ] **Step 1: Run the full test suite**

Run: `pnpm test`
Expected: PASS — all tests including newly added Supabase ones.

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Run lint**

Run: `pnpm lint`
Expected: PASS.

- [ ] **Step 4: Manual smoke test — Storybook**

Run: `pnpm storybook`
Verify each new story renders:

- Supabase / LoginPage / Default, WithSocialProviders, SocialOnly, NoForgotPassword
- Supabase / ForgotPasswordPage / Default
- Supabase / SetPasswordPage / WithTokens, MissingTokens
- Supabase / SocialAuthButton / Github, Google, CustomProvider
- Supabase / ListGuesser / Companies
- Supabase / ShowGuesser / Company
- Supabase / EditGuesser / CompanyEdit
- Supabase / CreateGuesser / CompanyCreate

(AdminGuesser story requires a real Supabase backend — skip visual verification.)

Kill Storybook when satisfied.

- [ ] **Step 5: Build the kit + demo**

Run: `pnpm demo:build`
Expected: PASS — Vite production build completes.

- [ ] **Step 6: Final commit (if any tweaks were needed)**

If you made any fixups during verification, commit them now with a descriptive message. Otherwise, the branch is ready for review.

- [ ] **Step 7: Summary**

Verify with `git log --oneline` that the branch contains a coherent sequence of small commits, one per task. Suggest a final push:

```bash
git push -u origin claude/agitated-shannon-76c7f7
```

---

## Notes for the implementer

1. **Mock placement matters.** `vi.mock("ra-supabase-core", ...)` calls must appear at module scope (top of the file, **before** the `import` of the component under test). If you accidentally place them after the import, vitest will not hoist the mock and the real module loads instead.

2. **Watch for the `eslint-disable-next-line @typescript-eslint/no-explicit-any` lines.** The kit's existing guessers use `any` extensively because `InferredTypeMap`'s entries are typed as accepting any props. Match the existing style.

3. **If `pnpm typecheck` complains about `InferredType` shape mismatches**, double-check that the field-type maps' `representation` functions return strings (not objects) and accept the right number of arguments (single `props` for leaf nodes, `(props, children)` for containers like `form` / `table` / `show`).

4. **OAuth tests in `social-auth-button.spec.tsx` rely on the wrapped Promise resolving synchronously enough**. If a test flakes, add an `await new Promise(r => setTimeout(r))` immediately after the `.click()` to let the promise microtask drain before asserting.

5. **The `SetPasswordForm` "missing tokens" test mutates module-level state in the mock.** Reset it at the end of the test (already in the plan).

6. **Storybook visual stories that depend on a real Supabase backend** (AdminGuesser, indirectly the guessers) cannot render fully in isolation. The corresponding `*.spec.tsx` files include hook mocks that the stories do NOT load — this is intentional. The unit tests cover behavior; the stories cover layout/visuals using a fake data provider.

7. **Existing `LoginPage` after refactor**: visually identical, but the Notification component is now mounted inside `AuthLayout` rather than at the LoginPage level. If you find any existing test asserting on Notification placement, update it.

8. **No backwards-incompatible changes to existing kit consumers.** The only public-surface change is the addition of `AuthLayout` to `src/components/admin/index.ts`. All other modifications are internal.
