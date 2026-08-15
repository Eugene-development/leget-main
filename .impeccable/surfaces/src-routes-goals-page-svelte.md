---
version: 1
slug: "src-routes-goals-page-svelte"
primary_target: "src/routes/goals/+page.svelte"
related_targets: []
---

# Goals route

## Scope and mode

- **Surface:** `/goals` (`src/routes/goals/+page.svelte`), a route-specific owner tool.
- **Mode:** Operate. The surface favors scanning, filtering, verification, and copying over promotion or visual spectacle.

## Audience and job

The site owner or marketer reviews the planned Yandex Direct conversion map before publication. They must be able to find goals by page, distinguish click goals from compound behavioral goals, inspect draft readiness and priority, and copy the exact event name without leaving the registry.

The registry exposes the route or sitewide scope, trigger condition, event name, optional button label or selector, dependencies, priority, and draft status. These technical details are primary working data, not secondary decoration.

## Direction

Treat the route as a light LEGET instrument laid over the tenant site: strict horizontal rows, thin separators, quiet surfaces, compact labels, and one restrained status signal. The page is organized as a **page → goal matrix**, not as an undifferentiated analytics dashboard or a card gallery.

On desktop, a sticky left rail holds search, goal-type filters, and the route list while the right side remains a dense, expandable registry. On mobile, the route list collapses into a disclosure while search, type selection, result count, and goal rows remain immediately usable.

## Memorable moment

Opening a goal row turns a plain registry entry into an implementation handoff: route chips, trigger logic, dependencies, the copyable event name, and readiness data align in one technical strip without losing the page-oriented context.

## Constraints

- Keep click and compound goals visibly distinct while both remain draft records.
- Preserve direct route links and exact technical event data; never paraphrase identifiers.
- Keep the return-to-site action visible in the header.
- Maintain keyboard-visible focus, live copy feedback, and a useful zero-results recovery.
- Inherit the global LEGET token system and tool-surface language from `DESIGN.md`; this route does not establish new global tokens or components.

## Direction record

- **Form:** page → goal matrix, candidate 5.
- **Seed:** `bccb761c`.

## Unresolved decisions

- Publication, event dispatch, and readiness transitions are outside this surface's current contract; the registry must continue to label the data as draft until those capabilities exist.
