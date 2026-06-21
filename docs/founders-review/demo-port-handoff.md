# Demo Port — Handoff / Next Steps

**Status:** NOT STARTED — blocked on a pre-existing `apps/demo` build breakage. Scoped + de-risked below so it's a fast execute.

## TL;DR
The landing page is done (ported + founders-reviewed + robust). The demo port is gated on fixing `apps/demo`, which **does not build standalone today** — independent of the www-v2 work.

## Blocker: `apps/demo` doesn't build
`pnpm --filter shadmin-demo build` fails at `tsc -b`:
```
Cannot find module 'shadmin/components/extras/webhook-endpoint-field' …
Cannot find module 'shadmin/components/extras' …
src/workspace/workspace-show.tsx(64,30): Parameter 'messages' implicitly has an 'any' type.
```
- **`shadmin/components/extras/*` does not exist.** 45 files in `apps/demo/src` import it (35 distinct components via deep paths + a 6-use barrel `shadmin/components/extras`).
- Those components actually live under `packages/shadmin/src/components/admin/{widgets,fields,inputs,buttons,form,list,collaboration}/`. **34 of 35 map 1:1** to a real `admin/<subdir>/<name>.tsx`. (`extras` is the same grab-bag we dispersed in the docs taxonomy — these demo imports are stale.)
- The build only ever "worked" via a stale turbo dist cache; a clean build fails (the vite alias `shadmin/X → packages/shadmin/src/X` resolves to a non-existent `src/components/extras/`).

## Architectural fork (decide first)
- **Option A (recommended — consistent with the docs dispersal):** rewrite `apps/demo`'s `shadmin/components/extras/X` imports to the real `shadmin/components/admin/<subdir>/X` paths. ~45 files; mapping is mechanical (34 are 1:1; the barrel's 6 named imports — `InPlaceEditor` etc. — map to real files too). No new public API. Also fix the `workspace-show.tsx` implicit-any.
- **Option B:** add an `extras` re-export layer to the package (`packages/shadmin/src/components/extras/<name>.ts` shims + `index.ts` barrel). Unblocks without touching the demo, but makes `extras` a real public namespace — contradicts the docs "extras dispersed" decision. Not recommended.

## Then: embed architecture (after the demo builds)
Two ways to put the demo at `/demo` of www-v2:
- **Option B-embed (recommended — matches v1):** build `apps/demo` standalone (it's a self-contained SPA: `ra-data-fakerest` in-memory data, localStorage auth, `base: "./"`), copy its `dist/` into `apps/www-v2/public/demo/`, and serve it as static assets at `/demo`. Requires: remove the `/demo` SPA route + prerender entry from www-v2 (`src/routes.ts`, `react-router.config.ts`), point the nav "Demo" link at `/demo` (full-page nav), and add a www-v2 build step that builds+copies the demo (gitignore `public/demo/`). Keeps the demo's heavy deps (ra-core, fakerest, i18n) and source-alias OUT of www-v2. The demo's main `app.crm.tsx` runs 100% client-side (no backend).
- **Option A-embed:** import the demo source into www-v2 directly (add ra-core/fakerest/i18n deps + the `shadmin/X → packages/shadmin/src/X` alias to www-v2's vite config). Heavier; couples www-v2 to the admin source + reopens the dep surface. Not recommended.

## Demo facts (from exploration)
- Entry `apps/demo/src/app.tsx` switches 5 sub-apps via `?demo=`: default (CRM, the main one), guessers, realtime, rich-text, supabase (needs env — exclude).
- Main CRM: 15 resources (orders, products, categories, customers, reviews, places(map), tasks, reports, documents, onboardings, subscriptions, api_keys, webhooks, scheduled_jobs, approvals) + a component-gallery. Custom `InspectorLayout` + `DemoSidebar`.
- Data: `ra-data-fakerest` + `data-generator-retail` + static seed files — fully in-memory, no backend, resets on reload.
- Build: `pnpm --filter shadmin-demo build` (`tsc -b && vite build`), port 5173 dev.

## Recommended execution order
1. Option A: fix `apps/demo` imports (extras→admin) + the implicit-any → `pnpm --filter shadmin-demo build` green.
2. Verify the demo runs (`make run` / vite dev, the CRM app).
3. Option B-embed: build demo → `public/demo/`, drop the www-v2 `/demo` SPA route + prerender entry, wire the nav link, gitignore `public/demo`, add a build script.
4. Verify `/demo` serves the live admin from www-v2 (dev + build-preview).
