---
version: 1
slug: 'src-routes-site-settings-page-svelte'
primary_target: 'src/routes/site-settings/+page.svelte'
related_targets:
  - 'src/routes/site-settings/+page.server.ts'
  - 'src/lib/site-settings/appearance.ts'
  - 'src/lib/site-settings/analytics.ts'
  - 'src/lib/components/SiteSettingsButton.svelte'
  - 'src/lib/components/SiteAnalytics.svelte'
  - 'src/lib/components/PageRenderer.svelte'
---

# Site settings route

## Scope and mode

- **Surface:** `/site-settings`, a protected owner tool rendered as a separate full-page surface outside the tenant site's public composition and floating service-order chrome.
- **Mode:** Operate. The page optimizes for verification, safe data entry, and one deliberate site-wide save rather than promotion or visual spectacle.
- **Boundary:** This brief owns the settings page, its editable-site entry button, analytics installation, and the small site-level appearance override. It does not redefine the tenant design systems documented in `DESIGN.md`.

## Audience and job

The site owner or marketer needs one dependable place to verify the site's identity and domain, publish or remove its favicon, connect traffic counters, and set a restrained visual baseline without editing code or visiting several tools.

Success is a complete, reviewable pass through the site's shared settings: the owner can see what is currently configured, understand that changes affect every public page, preview appearance changes before saving, and leave with explicit success or field-level recovery feedback.

## Information architecture

Treat the route as a **site passport**, not a dashboard of independent cards.

1. The header establishes the return path, page purpose, domain, and analytics completeness at a glance.
2. A sticky desktop rail identifies the site and template, then provides an ordered table of contents: favicon, counters, base style, and summary.
3. The document body follows the same sequence. Favicon publishing is its own immediate action; analytics and appearance share the final save action.
4. The appearance section pairs controls with a live sample. The sample reacts to unsaved form state and remains supporting evidence, not a second editor.
5. The summary restates site-wide scope and pending analytics/style outcomes before the final action.

The editable-site footer exposes `SiteSettingsButton` alongside page SEO and Yandex Direct goals. It opens the unlock bridge in a new tab so the public site remains available as reference while settings are changed.

## Direction

The route is a light-gray LEGET instrument laid over the tenant site: a quiet page field, white working sheets, thin dividers, compact labels, and restrained depth. Content reads as one long administrative document. The visual system favors rows, fieldsets, and summaries over a card grid; a near-black final action anchors the document, while the scarlet brand signal is reserved for status, validation, destructive intent, and exceptional feedback.

The first viewport shows the return link and title, the site's domain and counter status, then immediately exposes the left-hand passport rail and the favicon section. On large screens, both the table of contents and appearance preview remain sticky so orientation and cause-and-effect stay visible during a long edit.

## Responsive behavior

- The page uses one column by default and becomes a `240px + fluid content` layout at the large breakpoint.
- The table of contents becomes a horizontally scrollable, single-line control on narrow screens; it becomes a vertical sticky rail on desktop.
- Favicon upload and its current-state panel stack until medium width. Labels and controls likewise collapse from aligned rows to readable vertical groups.
- Font and radius selectors form two columns from the small breakpoint.
- The live preview remains in document flow through laptop widths, then becomes a sticky `360px` companion at the extra-large breakpoint.
- Controls preserve a minimum `44px` target. Horizontal scrolling is limited to the table of contents and must not create page-level overflow.

## Accessibility

- Preserve semantic headings, landmark navigation, anchored sections, fieldsets, legends, labels, and description/error associations.
- Keep visible keyboard focus on links, inputs, file controls, selects, and both button variants. Navigation and form controls must remain usable without pointer input.
- Success feedback uses a status announcement; validation and service failures use alerts. Invalid fields expose `aria-invalid` and reference their specific error copy while retaining submitted values.
- The color picker and hex field are two controls for the same value and both require accessible names. The live preview and palette strip are supplemental; meaning and validity must never be communicated by color alone.
- Text and surface colors must pass the enforced `4.5:1` contrast check. Focus indication remains independently visible on the light-gray and white working surfaces.
- Favicon removal remains an explicitly confirmed destructive action. The unlock/loading state announces progress and presents a recoverable error path.

## Security, privacy, and states

- The entry button is rendered only in authenticated edit mode. The unlock bridge exchanges the existing bearer token for a one-hour, path-scoped, HTTP-only, SameSite Strict cookie; production cookies are Secure.
- Every page load and mutation revalidates the session and verifies that the current hostname belongs to one of the authenticated user's licenses. Missing sessions redirect away; ownership, upstream, and expired-session failures remain distinct.
- The route is `noindex, nofollow`. It must never render tenant settings into the public-site chrome or expose the settings cookie outside `/site-settings`.
- Favicon uploads are limited to 1 MB and accepted only when file signatures identify PNG, ICO, or WEBP. Uploads use the existing pre-signed object-storage flow; deletion clears the published URL after confirmation.
- Empty analytics fields intentionally disable their counter. Yandex IDs accept digits only; Google IDs accept the supported `G-`, `GT-`, `AW-`, and `DC-` forms. Public analytics scripts install only for normalized IDs and avoid duplicate initialization across client navigation.
- Preserve loading, success, validation, authorization, ownership, upload, deletion, and upstream-failure states. A failed save must not discard the user's entered values.

## Site-level appearance boundary

`siteAppearance` is a short owner-facing layer **over** the selected design system, not a replacement for it. It exposes exactly four colors (primary, accent, surface, text), one coordinated font-pair preset, and one radius preset. The live sample and published site use the same `siteAppearanceStyle()` mapping.

The layer may remap the existing `--ds-*` role contract and derive compatible scales, foregrounds, borders, dark/light surfaces, fonts, and radius steps. It applies once around the rendered site so all public pages receive the same override. Text/surface contrast is validated before persistence.

It must not choose or version a design system, change template structure, alter component composition or tenant block data, create per-page palettes, override section theme selection, or expose arbitrary token editing. Component versions continue to consume the full design-system contract; the owner-facing layer changes only the roles explicitly represented by these six controls.

Analytics IDs and appearance are persisted in the license's shared header data. This storage location is an implementation bridge, not permission to turn unrelated header fields into global appearance controls.

## Memorable moment

As the owner adjusts four colors, the font pair, or the corner character, the sticky sample changes immediately while the summary keeps the pending whole-site effect explicit. The page makes a global visual decision feel inspectable and bounded rather than magical.

## Direction record

- **Form:** site passport with live sample, candidate 7.
- **Seed:** `46fbd18f`.
- **Contract:** light-gray protected instrument; sticky table of contents; favicon → analytics → appearance → summary; one whole-site save.

## Unresolved decisions

- Selection and application of a full design system remain outside this surface; the current appearance layer must not be presented as that missing capability.
- Consent management, regional analytics disclosure, and Google Consent Mode are product/legal decisions not represented by the current controls.
- Unsaved-change protection and active-section tracking are not part of the current implementation; do not imply them in copy or behavior until they exist.
