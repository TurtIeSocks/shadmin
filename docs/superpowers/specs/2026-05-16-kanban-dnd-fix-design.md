# Kanban DnD spring-back fix

**Date:** 2026-05-16
**Status:** Draft
**Related todos:** Fix kanban-board DnD spring-back visual glitch.

---

## Goal

Eliminate the visual "spring back" when dragging a kanban card from column A to column B. Current behaviour: card briefly snaps back to column A before re-rendering in column B. Desired: card disappears from A on drop and appears in B in the same frame.

---

## Diagnosis

`src/components/extras/kanban-board.tsx`:

| Line | Code | Issue |
|---|---|---|
| 117-146 | `DraggableCard` uses `useDraggable` | No `transform` applied to DOM node; card stays in source slot during drag |
| 306-331 | `handleDragEnd` | Calls ra-core `update()` with `mutationMode: "optimistic"` — fire-and-forget |
| 382-397 | `<DragOverlay>` | Default `dropAnimation` animates clone back to source slot on drop |

**Root cause:** `<DragOverlay>` default drop animation tweens the clone from cursor position back to source card's origin before the optimistic update places the real card in the destination column. Visible as "spring back".

---

## Fix

### Primary change

`src/components/extras/kanban-board.tsx` — `<DragOverlay>` (line ~382):

```tsx
import { DragOverlay, defaultDropAnimationSideEffects } from "@dnd-kit/core";

<DragOverlay dropAnimation={null}>
  {activeCard ? <DraggableCardContent card={activeCard} /> : null}
</DragOverlay>
```

Setting `dropAnimation={null}` disables the back-snap tween. On drop:
1. Clone disappears instantly.
2. Same React render cycle: `setActiveId(null)` + optimistic `update()` mutation cascades through `useGetList` cache.
3. Card reappears in destination column.

### Defensive change

Verify ra-core's `mutationMode: "optimistic"` updates the TanStack Query cache synchronously inside `update()` (so the next render shows new column membership). If not, add a transient local state mirror keyed by card ID that overrides the cache during the gap. Pattern:

```tsx
const [pendingMoves, setPendingMoves] = React.useState<Record<string, string>>({});

const handleDragEnd = (event: DragEndEvent) => {
  // ... existing logic ...
  setPendingMoves((prev) => ({ ...prev, [draggedId]: newColumnId }));
  update("cards", { id: draggedId, data: { column: newColumnId } }, {
    mutationMode: "optimistic",
    onSettled: () => setPendingMoves((prev) => {
      const next = { ...prev };
      delete next[draggedId];
      return next;
    }),
  });
};

const cardsByColumn = React.useMemo(
  () => groupCardsApplyingPending(cards, pendingMoves),
  [cards, pendingMoves],
);
```

Only apply the defensive change if `dropAnimation={null}` alone leaves a perceptible flicker (manual visual check in browser).

---

## Files

- `src/components/extras/kanban-board.tsx` — `<DragOverlay dropAnimation={null}>`; conditionally add pendingMoves mirror.
- `src/components/extras/kanban-board.spec.tsx` — add test asserting card lands in target column on drop (existing tests stay green).
- `src/stories/extras/kanban-board.stories.tsx` — no change expected.

---

## Acceptance criteria

- [ ] Dragging card from column A to column B: no spring-back animation, card lands in B cleanly.
- [ ] Existing kanban spec passes.
- [ ] New spec: simulate drag from column A to B, assert resulting DOM has card under B's column container.
- [ ] No regression to reorder-within-column behaviour (if any was already supported).

---

## Assumptions

- `mutationMode: "optimistic"` updates the TanStack Query cache synchronously enough that the next render shows the card in its destination column. Defensive `pendingMoves` mirror added only if needed.
- No reorder-within-column behaviour is intended (current kanban is column-membership only). If reorder is desired later, refactor to `useSortable` pattern as in `layout-builder.tsx:124-126`.
- Dropping drop-animation entirely is preferable to a back-snap; UX consensus is that an instant disappear feels more responsive than a corrective tween.
- `@dnd-kit/core` exports `defaultDropAnimationSideEffects` only if needed for partial customization — the `dropAnimation={null}` shortcut is the targeted disable.
