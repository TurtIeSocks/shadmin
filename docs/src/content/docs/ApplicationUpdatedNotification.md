---
title: "ApplicationUpdatedNotification"
---

A floating banner that informs the user a new version of the application is available, with a button to reload the page.

This is the default notification rendered by [`<CheckForApplicationUpdate>`](./CheckForApplicationUpdate.md), but it can also be used standalone.

## Usage

```tsx
import { ApplicationUpdatedNotification } from "@/components/admin/application-updated-notification";

const Notice = () => <ApplicationUpdatedNotification />;
```

The banner is `position: fixed` near the bottom of the viewport, horizontally centered, and rendered above other content with `z-50`.

## Props

| Prop | Required | Type | Default | Description |
|------|----------|------|---------|-------------|
| `className` | Optional | `string` | - | Extra CSS class applied to the card. |
| `message` | Optional | `string` | `ra.notification.application_update_available` | i18n key (or raw text) shown in the banner. |
| `buttonLabel` | Optional | `string` | `ra.action.reload` | i18n key (or raw text) for the reload button. |
| `onReload` | Optional | `() => void` | `window.location.reload()` | Click handler for the button. |

## `message`

The text shown next to the icon. Translated through `useTranslate()` with a fallback so raw strings are displayed as-is.

```tsx
<ApplicationUpdatedNotification message="A new version is available." />
```

## `buttonLabel`

The label of the reload button. Translated through `useTranslate()` with a fallback so raw strings are displayed as-is.

```tsx
<ApplicationUpdatedNotification buttonLabel="Refresh now" />
```

## `onReload`

Custom click handler for the reload button. The default calls `window.location.reload()`. Override it to perform extra work (analytics, soft reload through a router, etc.) before — or instead of — reloading.

```tsx
<ApplicationUpdatedNotification
  onReload={() => {
    track("app_update_reload");
    window.location.reload();
  }}
/>
```

## `className`

Extra CSS classes merged with the default styles via `cn()`.

```tsx
<ApplicationUpdatedNotification className="border-primary" />
```
