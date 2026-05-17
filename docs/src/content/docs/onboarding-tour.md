---
title: "OnboardingTour"
---

`<OnboardingTour>` displays a sequence of coachmark tooltips that highlight specific DOM elements, guiding first-time users through a feature. Completion state is persisted in ra-core's store (localStorage by default), so the tour only runs once per user.

## Usage

```tsx
import { OnboardingTour } from "@/components/admin";

const DashboardTour = () => (
  <OnboardingTour
    id="dashboard-first-run"
    steps={[
      {
        target: '[data-tour="sidebar"]',
        title: "Resources",
        content: "Click any item to navigate.",
      },
      {
        target: '[data-tour="search"]',
        title: "Quick search",
        content: "Press cmd+K to open the palette.",
      },
      {
        target: '[data-tour="theme"]',
        title: "Theme",
        content: "Switch between light and dark.",
      },
    ]}
  />
);
```

Add `data-tour` attributes to the elements you want to highlight:

```tsx
<button data-tour="search">Search</button>
```

Place `<OnboardingTour>` anywhere in the tree that has access to the ra-core context (inside `<Admin>` or wrapped in `<CoreAdminContext>`).

## Props

| Prop         | Required | Type                                               | Default  | Description                                                                   |
| ------------ | -------- | -------------------------------------------------- | -------- | ----------------------------------------------------------------------------- |
| `id`         | Required | `string`                                           | —        | Store key suffix. Tours with the same `id` share completion state.            |
| `steps`      | Required | `TourStep[]`                                       | —        | Ordered list of coachmark steps.                                              |
| `autoStart`  | Optional | `boolean`                                          | `true`   | Start automatically on mount if not yet completed.                            |
| `onComplete` | Optional | `() => void`                                       | —        | Called when the user finishes or skips the tour.                              |
| `placement`  | Optional | `"auto" \| "top" \| "bottom" \| "left" \| "right"` | `"auto"` | Default tooltip placement for all steps. Step-level placement overrides this. |

## `TourStep`

```ts
interface TourStep {
  target: string; // CSS selector for the element to highlight
  title?: ReactNode; // Optional heading shown above the content
  content: ReactNode; // Main body text or JSX
  placement?: "top" | "bottom" | "left" | "right"; // Overrides component-level placement
}
```

## `id`

The `id` prop is used to construct the store key `tour.<id>.completed`. Completing the tour (via Finish or Skip) stores `true` at that key, preventing the tour from re-appearing on future page loads.

To reset the tour for testing, clear the store entry:

```tsx
import { useStore } from "ra-core";

const ResetButton = () => {
  const [, setCompleted] = useStore(
    "tour.dashboard-first-run.completed",
    false,
  );
  return <button onClick={() => setCompleted(false)}>Reset tour</button>;
};
```

## `placement`

When `placement` is `"auto"` (the default), individual steps without a `placement` property default to `"bottom"`. Set a component-level `placement` to change the default for all steps, then override per-step as needed:

```tsx
<OnboardingTour
  id="my-tour"
  placement="top"
  steps={[
    { target: ".foo", content: "Appears above .foo" },
    {
      target: ".bar",
      content: "Appears to the right of .bar",
      placement: "right",
    },
  ]}
/>
```

## Behaviour

- **Spotlight**: A semi-transparent overlay covers the page with a cutout around the target element. Clicking the overlay dismisses the tour (same as Skip).
- **Highlight ring**: A primary-color ring is rendered around the target's bounding box.
- **Navigation**: Back / Next buttons move between steps. The last step shows Finish instead of Next.
- **Missing target**: If the CSS selector matches no element, the tooltip is hidden but the overlay stays visible. The tour can still be skipped.
- **Resize/scroll**: Target position updates every 250 ms and on resize/scroll events.
