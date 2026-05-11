---
title: "CheckForApplicationUpdate"
---

`<CheckForApplicationUpdate>` polls a URL at a regular interval, hashes the response body, and renders a notification when the hash changes — useful for detecting that a new version of the application has been deployed while the user has the page open.

## Usage

Mount it once near the root of your layout (or anywhere it stays mounted while the app is in use):

```tsx
import { Admin, CheckForApplicationUpdate, Layout, Resource } from "@/components/admin";

const MyLayout = ({ children }) => (
  <Layout>
    {children}
    <CheckForApplicationUpdate />
  </Layout>
);

const App = () => (
  <Admin layout={MyLayout}>
    <Resource name="posts" />
  </Admin>
);
```

By default the component polls `${window.location.origin}/index.html` once per minute and shows the [`<ApplicationUpdatedNotification>`](./ApplicationUpdatedNotification.md) banner when a change is detected. Users can click "Reload" to load the new version.

## Props

| Prop | Required | Type | Default | Description |
|------|----------|------|---------|-------------|
| `interval` | Optional | `number` | `60000` | Polling interval in milliseconds. |
| `url` | Optional | `string` | `${origin}/index.html` | URL to poll. |
| `notification` | Optional | `ReactNode` | `<ApplicationUpdatedNotification />` | Element rendered when a change is detected. |
| `disabled` | Optional | `boolean` | `false` | Skip polling entirely. |

## `interval`

Poll interval in milliseconds. The default (1 minute) is a reasonable balance between responsiveness and politeness. Increase it to reduce HTTP requests.

```tsx
<CheckForApplicationUpdate interval={5 * 60 * 1000} />
```

## `url`

URL to fetch on each poll. Defaults to the application root's `index.html`. Provide a custom path if your build outputs a different entry file.

```tsx
<CheckForApplicationUpdate url="/build/index.html" />
```

## `notification`

The React node rendered when a new version is detected. Defaults to [`<ApplicationUpdatedNotification>`](./ApplicationUpdatedNotification.md).

```tsx
<CheckForApplicationUpdate
  notification={<MyCustomBanner />}
/>
```

## `disabled`

Skip the periodic check — typically used to disable updates in development or under tests.

```tsx
<CheckForApplicationUpdate disabled={process.env.NODE_ENV !== "production"} />
```
