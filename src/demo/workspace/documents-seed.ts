/**
 * Seed data for the Workspace "documents" demo resource.
 *
 * Six markdown-bodied documents with 2-3 collaborators and a
 * userId/read/write/share permission grid each. Exercises PresenceBar
 * (collaborators), PermissionMatrix (permissions), and Assistant
 * (markdown body to summarize).
 */
export interface DocumentCollaborator {
  id: string;
  name: string;
  /** Tailwind-compatible color token used as the avatar tint. */
  color: string;
}

export interface DocumentPermission {
  userId: string;
  read: boolean;
  write: boolean;
  share: boolean;
}

export interface WorkspaceDocument {
  id: number;
  title: string;
  body: string;
  collaborators: DocumentCollaborator[];
  permissions: DocumentPermission[];
}

const alice: DocumentCollaborator = { id: "alice", name: "Alice Nguyen", color: "#f97316" };
const bob: DocumentCollaborator = { id: "bob", name: "Bob Rivera", color: "#3b82f6" };
const carol: DocumentCollaborator = { id: "carol", name: "Carol Diaz", color: "#a855f7" };
const dan: DocumentCollaborator = { id: "dan", name: "Dan Park", color: "#10b981" };
const eve: DocumentCollaborator = { id: "eve", name: "Eve Martin", color: "#ef4444" };

export const documentsSeed: WorkspaceDocument[] = [
  {
    id: 1,
    title: "Q2 Roadmap",
    body: `# Q2 Roadmap

## Goals
- Ship the new dashboard
- Migrate billing to Stripe
- Hire two senior engineers

## Risks
- Capacity is tight through April
- Stripe migration depends on legal sign-off
`,
    collaborators: [alice, bob, carol],
    permissions: [
      { userId: alice.id, read: true, write: true, share: true },
      { userId: bob.id, read: true, write: true, share: false },
      { userId: carol.id, read: true, write: false, share: false },
    ],
  },
  {
    id: 2,
    title: "Design System v2",
    body: `# Design System v2

A second pass at our component primitives, focused on accessibility
and theming via CSS custom properties.

## Open questions
- Adopt \`oklch()\` for tokens?
- Drop legacy gray scale?
`,
    collaborators: [bob, dan],
    permissions: [
      { userId: bob.id, read: true, write: true, share: true },
      { userId: dan.id, read: true, write: true, share: true },
    ],
  },
  {
    id: 3,
    title: "API Migration Plan",
    body: `# API Migration Plan

Move all v1 endpoints to v2 behind a feature flag, then sunset v1
ninety days after the cutover.

## Phases
1. Mirror writes
2. Mirror reads
3. Flip primary
4. Decommission v1
`,
    collaborators: [alice, dan, eve],
    permissions: [
      { userId: alice.id, read: true, write: true, share: true },
      { userId: dan.id, read: true, write: true, share: false },
      { userId: eve.id, read: true, write: false, share: false },
    ],
  },
  {
    id: 4,
    title: "Onboarding Playbook",
    body: `# Onboarding Playbook

How to ramp a new hire to first commit within ten business days.

- Day 1: Accounts + dev setup
- Day 3: Pair on a starter bug
- Day 7: Ship a small change
- Day 10: First on-call shadow
`,
    collaborators: [carol, eve],
    permissions: [
      { userId: carol.id, read: true, write: true, share: true },
      { userId: eve.id, read: true, write: true, share: false },
    ],
  },
  {
    id: 5,
    title: "Incident Retro: 2026-04-12",
    body: `# Incident Retro: 2026-04-12

Outage in the payments service lasting 38 minutes. Root cause was an
exhausted connection pool after a deploy doubled query volume.

## Action items
- Add pool saturation alert
- Cap per-request query count in lint
- Re-run capacity test before deploys touching the hot path
`,
    collaborators: [alice, bob, eve],
    permissions: [
      { userId: alice.id, read: true, write: true, share: true },
      { userId: bob.id, read: true, write: true, share: true },
      { userId: eve.id, read: true, write: false, share: false },
    ],
  },
  {
    id: 6,
    title: "Hiring Loop Rubric",
    body: `# Hiring Loop Rubric

Calibrated scoring for the five-interview senior engineer loop.

| Round | Signal | Weight |
| --- | --- | --- |
| Phone screen | Communication | 1x |
| System design | Tradeoffs | 3x |
| Coding | Correctness + style | 2x |
| Behavioral | Collaboration | 2x |
| Bar raiser | Overall | 2x |
`,
    collaborators: [carol, dan, eve],
    permissions: [
      { userId: carol.id, read: true, write: true, share: true },
      { userId: dan.id, read: true, write: false, share: false },
      { userId: eve.id, read: true, write: true, share: true },
    ],
  },
];
