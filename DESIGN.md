# PRAJVALA — Pixel Adventure Design System

> **Design source of truth for the PRAJVALA UI redesign.** The primary reference is the owner's website, [riskimivan.id](https://www.riskimivan.id/). Keep the same strong pixel-world / retro-game visual identity as the reference. Do not dilute it into a conventional SaaS dashboard with a few pixel icons added as decoration.

## 1. Product identity

**Product:** PRAJVALA — a civic transparency platform for exploring public budgets, monitoring development projects, reviewing public evidence and documents, and submitting citizen reports.

**Creative direction:** `Pixel-Art Adventure World × Civic Transparency`.

The pixel-art visual language is a **core identity**, not an optional accent. PRAJVALA should immediately feel like it belongs to the same pixel universe as riskimivan.id, while its information architecture, copy, data, and interactions remain specific to civic transparency.

### Non-negotiable design intent

- Preserve the strong pixel-art / retro-game atmosphere of the reference throughout the experience.
- Use pixel-style visual framing, sprites/illustrations, icons, decorative scenes, badges, section dividers, buttons, borders, and visual transitions as a coherent system.
- Keep the retro-game spirit visible on every major route, not only the homepage.
- Do not redesign it as a generic corporate, minimalist, editorial, or SaaS dashboard.
- Do not reduce pixel art to one tiny decorative icon or a subtle background texture.
- Do not turn the product into a childish game. The world can be playful; public-money information must remain serious, legible, accurate, and trustworthy.

## 2. Reference inspection requirements

Reference: `https://www.riskimivan.id/`.

Inspect the live reference before making visual decisions. Its public content explicitly uses a “dunia pixel-ku” welcome, describes achievements as collected backpack items, frames experience as quests, certificates as a trophy case, and contact as a message board. Carry this coherent metaphor and visual language into PRAJVALA.

Inspect and document:

- Desktop and mobile screenshots.
- Header/navigation, active/hover/focus states, and section transitions.
- Hero composition, pixel-world/sprite artwork, backgrounds, borders, shadows, and decorative geometry.
- Typography: display type, pixel/monospace accents, body text, weights, and hierarchy.
- Color palette and contrast relationships.
- Buttons, chips, stat blocks, cards, galleries, section separators, and form styling.
- The visual treatment of About, Achievements, Experience/Quest, Certificates/Trophy Case, Write Up, and Contact/Message Board.
- Motion, hover behavior, scrolling behavior, breakpoints, and fixed/sticky elements.

Separate findings into **Verified**, **Estimated**, and **PRAJVALA adaptation**. Do not invent exact CSS values. Extract real values with browser devtools/computed styles where possible. If browser inspection is unavailable, ask for screenshots or state which details remain unverified. Never claim a pixel-perfect match without visual comparison.

## 3. Pixel-art visual language — primary, not optional

### Pixel construction

- Use crisp, hard-edged geometry and deliberate pixel stepping. Avoid soft, blurry, anti-aliased decorative effects where a pixel treatment is intended.
- Prefer square or deliberately stepped corners, chunky outlines, layered hard shadows, block-based highlights, tile patterns, pixel borders, and sprite-like illustrations.
- Use a consistent pixel grid for decorative graphics and icons. Keep pixel sizes consistent within an illustration system; do not mix random pixel scales.
- Where image assets are pixel art, preserve crisp rendering with `image-rendering: pixelated` or the appropriate rendering strategy. Do not apply blur, soft gradients, or smoothing filters to pixel assets.
- Use sprite sheets or authored pixel assets when appropriate. Check licensing and project ownership before adding third-party assets.
- Pixel patterns should support depth, environment, wayfinding, or narrative—not become noisy wallpaper behind dense data.

### Surface and component treatment

Use the reference's recognizable treatment as the source of truth, then adapt it consistently:

- Pixel-framed panels and section containers.
- Chunky, stepped or hard-edged borders.
- Offset block shadows rather than soft floating shadows when matching the reference.
- Retro-game buttons with clear idle, hover, pressed, disabled, and focus states.
- Pixel-style status badges, quest markers, achievement stamps, and archive labels.
- Sprites or pixel illustrations for meaningful empty states, onboarding, section intros, and project milestones.
- Distinct section headers and visual separators that make scrolling feel like moving through a designed world.

Do not give every component the exact same border or frame. Build a small family of related treatments based on hierarchy and context.

### Typography

- Reproduce the display/pixel typography character of the reference where it appears.
- Pixel fonts are for short labels, section markers, status chips, counters, button labels, or decorative headings only when legible.
- Use a highly readable non-pixel body font for Indonesian paragraphs, financial figures, tables, legal/source notes, forms, and long-form articles.
- Maintain consistent type scale, line height, and hierarchy. Avoid using pixel fonts for dense data or long paragraphs.
- Do not select or embed a font until the current reference font is inspected. Check licensing and local fallback behavior.

### Color

- Extract the reference's actual palette from the live site or screenshots before finalizing tokens.
- Preserve its recognizable overall color character and contrast relationships; do not replace it with an unrelated trendy palette.
- Add civic semantic colors for verified, pending, delayed, disputed, and completed states only where needed. Semantic colors must remain compatible with the reference palette and distinguishable without color alone.
- Never invent exact hex values and claim they came from the reference.

## 4. Translation from portfolio metaphors to civic transparency

| Reference concept | PRAJVALA translation | Visual/interaction treatment |
|---|---|---|
| Pixel world / welcome | Explore public information | Pixel-world hero, clear civic call to action |
| Backpack / collected items | Budget and public-data overview | Inventory-inspired stat blocks and resource indicators |
| Achievements | Verified milestones and accountability metrics | Pixel achievement markers with provenance labels |
| Experience / quests | Development projects | Quest board, status, timeline, location, milestones, evidence |
| Trophy case / certificates | Public documents and evidence archive | Pixel-framed archive/gallery with document metadata and previews |
| Write Up / journal | Public explainers and transparency articles | Readable journal page with pixel-styled framing and navigation |
| Message board / contact | Citizen reports and feedback | Pixel-styled notice board and accessible report form |
| Personal profile | Citizen account and contribution history | Profile/record screen; never copy personal details from reference |

Do not copy personal biography, identity details, portfolio text, photos, personal certificates, email addresses, or unrelated claims from the reference. Reuse the visual language and interaction patterns only. Use PRAJVALA's own content and data.

## 5. Experience principles

- **Explore:** users should feel guided through an identifiable pixel world, not dropped into a generic admin panel.
- **Evidence:** source, timestamp, geography, status, and verification level remain explicit.
- **Clarity:** explain government/accounting language in plain Bahasa Indonesia.
- **Playful shell, serious information:** pixel art gives personality; data remains precise and sober.
- **Consistency:** every route belongs to one visual universe, even when its layout differs.
- **Accessibility:** pixel aesthetics must never compromise legibility, contrast, keyboard use, touch targets, or reduced-motion preferences.

## 6. Responsive navigation — mandatory

**Mobile must use a fixed bottom navigation bar. No hamburger menu on mobile.**

### Desktop

- Use a horizontal header navigation, taking the reference website's navigation character as the visual guide.
- Keep primary destinations visible when they fit.
- Use the same pixel-world visual language in the logo, header frame, active link, separators, and interaction states where appropriate.
- Hide the mobile bottom navigation on desktop.

### Mobile

- Hide the desktop horizontal link row when it no longer fits.
- Show a fixed bottom navigation with five visible destinations:
  1. **Beranda** — home/overview.
  2. **Anggaran** — budget explorer.
  3. **Proyek** — project list/map.
  4. **Laporan** — citizen participation/report flow.
  5. **Lainnya** — opens a bottom sheet or a dedicated More page.
- Every destination must show both an icon and a visible text label. Never make the primary nav icon-only.
- Style the bar as part of the pixel universe: crisp border, clear block/stepped active state, and matching palette. Maintain touch comfort; do not sacrifice usability to pixel decoration.
- `Lainnya` exposes existing secondary routes such as Dokumen, Informasi, Write Up, Akun, and settings. Confirm actual routes before linking.
- Never use a hamburger icon or hamburger dropdown at mobile breakpoints. A visible `Lainnya` bottom-nav item opening a bottom sheet is allowed and is not a hamburger menu.
- Use `aria-current="page"` or equivalent, keyboard focus, touch targets around 44×44 CSS px or larger, and clear active states.
- Respect `env(safe-area-inset-bottom)` on iOS. Reserve bottom padding so the bar never covers page content, form actions, tables, map controls, or the last row.
- Test report/account forms with the on-screen keyboard. Ensure fixed navigation does not hide fields or critical actions.
- The More sheet must have a close control, sensible focus behavior, Escape/backdrop dismissal, and scrollable content where necessary.

### Navigation wireframe

```text
DESKTOP (>= 1024px)
┌──────────────────────────────────────────────────────────────────────────┐
│ [pixel PRAJVALA mark]  Beranda  Anggaran  Proyek  Laporan  Informasi  ⌄Akun │
└──────────────────────────────────────────────────────────────────────────┘
│                            Page content                                  │
│                                                                          │
│                           Pixel footer                                   │
└──────────────────────────────────────────────────────────────────────────┘

MOBILE (< 1024px) — single row, five items, icon + label, no hamburger
┌───────────────────────────────┐
│          Page content         │
│                               │
│         Pixel footer          │
├───────────────────────────────┤  <- fixed, 68px, z-40
│  ⌂      ▤       ⚑      ✉      ⋯  │
│Beranda Anggaran Proyek Laporan Lainnya│
└───────────────────────────────┘
     Lainnya -> pixel bottom sheet: Dokumen, Informasi, Write Up, Akun

Each item measures 78x64 CSS px at 390px width (>= 44px tap target).
```

## 7. Information architecture and route patterns

Inspect existing routes first; preserve them and map them to these patterns. Do not invent routes or remove existing features.

| PRAJVALA area | Pattern |
|---|---|
| Home | Pixel-world welcome, story-led hero, entry points into budgets/projects/reports |
| Budget | Inventory/resource explorer with clear allocations, realization, period, source, categories |
| Projects | Pixel quest board/list plus map; status/location obvious |
| Project detail | Quest detail: overview, budget, milestones, evidence, map, citizen validation |
| Documents/public information | Trophy/archive collection with search, filters, metadata, and preview |
| Write Up/explainers | Journal layout optimized for long-form readability, pixel-framed headings/wayfinding |
| Citizen reports | Message-board-inspired report flow with privacy, validation, upload, and feedback states |
| Account | Citizen profile and contribution history, adapted to actual authentication |

### Implemented route map

| Route | Pattern implemented |
|---|---|
| `/` | Sky hero with clouds and stepped terrain, inventory KPI grid, quest-step plaques, featured quest cards, message board on dirt, wood CTA |
| `/anggaran` | Paper hero, inventory KPI grid, wood-framed cashflow board, sector board, notes, RAB anchor and table |
| `/proyek` | Paper hero with region picker, status chips, filter board, wood-bezel map, quest card grid |
| `/proyek/[id]` | Sky header band, photo frame before/after, mission-path timeline, RAB table, citizen validation, wood ledger aside |
| `/informasi` | Pocket page: document trophy case (`#dokumen`), pixel FAQ accordion (`#faq`), dark glossary board (`#glosarium`) |
| `/laporan` | Citizen report board built only from `CITIZEN_REPORTS`, with region scoping, search, suitability filters, and per-project links |
| `/write-up` | Journal page built only from `FAQS` (chapters) and `GLOSSARY` (appendix), with a sticky table of contents |
| `/masuk`, `/daftar` | Wood-chassis auth gate; desktop ledger aside hidden below `lg`; all Firebase flows unchanged |
| `/akun` | Sky account header, inventory stat slots, report history, distribution board, quick actions, account detail and deletion |
| `not-found` | Signpost empty state on the sky band with three waymarked routes back |

`/laporan` and `/write-up` are derived exclusively from existing seed data (`CITIZEN_REPORTS`, `FAQS`, `GLOSSARY`). No editorial copy or aggregate figures are invented; all counters are computed at render time.

Avoid forcing every page into the same card grid. Use distinct compositions that still share the same pixel design language.

## 8. Data, charts, maps, and evidence

- Financial values must show currency, period, unit, and source.
- Align numeric values and use tabular numerals where appropriate.
- Distinguish planned budget, revised allocation, realization, and remaining balance.
- Never turn an unverified report into a confirmed fact.
- Mark mock/demo data visibly and never imply it is official.
- Pixel-style charts may use deliberate pixel-like markers or gridlines, but must retain accurate scales, labels, units, legends, and accessible summaries.
- Preserve map controls, attribution, coordinate accuracy, legend, and keyboard/mobile access. Pixel-art map markers may be used only if they remain clear and usable.
- Evidence images require descriptive metadata and meaningful alt text.

## 9. Component families and interaction states

Audit and reuse existing components before creating equivalents. Establish a shared component family for:

- Desktop pixel header and mobile pixel bottom navigation.
- More bottom sheet.
- Pixel-framed buttons, links, chips, tabs, and active states.
- Search, filters, select controls, and accessible forms.
- Inventory/stat blocks and budget summaries.
- Quest/project cards, status markers, and timelines.
- Trophy/document archive and evidence gallery.
- Tables and charts with readable data surfaces.
- Maps, markers, legends, and project detail panels.
- Pixel-art empty states and loading/feedback illustrations.
- Loading, empty, error, success, disabled, and permission states.

Every visible control must perform its advertised action. Do not add decorative controls that do nothing.

## 10. Anti-AI-slop and anti-dilution rules

Never:

- Turn the design into a generic SaaS dashboard.
- Reduce pixel art to a few tiny icons while making the rest of the UI generic.
- Replace the reference's visual character with unrelated minimalism, glassmorphism, neon gradients, soft floating cards, or trendy 3D blobs.
- Use random pixel decorations without a consistent grid or role.
- Use pixel fonts for long paragraphs, dense tables, or small legal/source text.
- Put every piece of content into the same rounded card.
- Make it look like a children's game or obscure financial information with decoration.
- Use emoji as the main icon system; use a consistent pixel/icon asset family.
- Copy personal portfolio content or assets that do not belong in a civic platform.
- Invent budgets, procurement records, project progress, official sources, verification states, or citizen reports.

## 11. Token extraction and implementation

Tokens are implemented in `tailwind.config.ts` (design tokens) and `app/globals.css` (component classes and CSS variables). Values below are the measured/chosen values currently in code.

### Reference measurement

The reference was measured in Firefox at 1440×1000 and 390×844, and its `style.css` (23,420 B) and `script.js` (10,338 B) were downloaded and read.

**Verified from the reference:** palette hex values, `border-radius: 0` everywhere, `max-width: 1100px` content column, 68 px navigation bar, plaque-style headings, layered `inset` box shadows, two-column layouts with 26 px gaps, certificate “gem” frames, and `IntersectionObserver` reveal animations.

**Adapted (not copied):** three reference colour pairings fail WCAG AA, so PRAJVALA uses hue-preserving, darkened variants instead. The adaptations are not presented as reference values.

| Reference pairing | Measured contrast | PRAJVALA token | Measured contrast |
|---|---|---|---|
| `#4CAF50` on white | 2.78:1 (fails) | `pixel.grass-deep` `#2E6B33` | 6.43:1 |
| `#4A90D9` on white | 3.34:1 (fails) | `pixel.blue` `#1D5FA8` | 6.45:1 |
| `#B98249` with cream text | 3.07:1 (fails) | `pixel.wood-cta` `#8A5A2B` | 5.45:1 |

### Token table

| Token family | Implemented decision | Source / status |
|---|---|---|
| Pixel/display font | `Press Start 2P` (`font-pixel`), for labels, chips, buttons, counters, short headings only | Measured — loaded and verified via `document.fonts.check` |
| Retro accent font | `VT323` (`font-retro`), for short intros and quotes, max ~3 lines | Measured |
| Body font | `Inter Variable`, with Plus Jakarta Sans retained for `font-display` | Chosen for Indonesian body-copy and dense data readability |
| Brand palette | `ink`, `navy`, `amber`, `emerald`, `rose`, `sky` scales plus `pixel.*` world surfaces | Measured from reference, adapted where contrast failed |
| World surfaces | `line #2B2B2B`, `sky #87CEEB`, `grass #4CAF50`, `grass-deep #2E6B33`, `dirt #8B4513`, `sun #FFD700`, `wood #B98249`, `wood-cta #8A5A2B`, `wood-dark #7A4E28`, `wood-darker #4E342E`, `panel #D6D9DD`, `cream #FFF6E0`, `cream-deep #F4EFE3`, `ink #3E2723`, `blue #1D5FA8` | Measured (`--outline`, `--sky`, `--grass`, `--dirt`, `--sun`, `--wood`, `--panel`, `--cream`, `--ink`) |
| Pixel grid scale | Icons are inline SVG on a 16×16 grid with `shape-rendering="crispEdges"`; decorative tile pattern at 40 px; fine grid at 8 px | Chosen to match the reference's block-icon character |
| Border treatment | Global `border-radius: 0`; frames at 2–4 px; table section rules at 3 px | Measured reference `border-radius: 0` |
| Shadow treatment | Three non-blurred levels: `shadow-chip` (2 px), `shadow-card`/`shadow-plaque` (5 px), `shadow-panel` (6 px + layered inset) | Measured layered inset shadow character |
| Surface/background | Flat world bands (`sky`, `cream`, `panel`, `dirt`, `wood-darker`) + `surface-tiles` / `surface-grid` overlays | Adapted for data readability; no blur or gradient mesh |
| Radius/shape | `rounded-*` removed from chrome; `rounded-full` retained only for map markers | Measured reference `border-radius: 0` |
| Content width | `container-page` = `max-width: 1180px`, padding 16/24/32 px | Adapted from reference `max-width: 1100px` for denser tables |
| Desktop breakpoint | Horizontal nav shown from `lg` (1024 px); bottom bar below | Measured: nav fits at 1024 px, does not fit at 768 px |
| Bottom-nav height | **68 px** fixed bar, `z-40`, plus `env(safe-area-inset-bottom)`; content offset with `.pb-mobile-nav` | Measured in Firefox at 390 px |
| More sheet | `z-60` pixel bottom sheet with scroll lock, Escape, focus trap, focus moved into sheet | Implemented, key-tested |
| Focus ring | 3 px `pixel.sun` outline, offset 2 px | Chosen for visibility on both cream and wood surfaces |
| Motion | `fade-in`, `step-up`, `sheet-up`, `pop-in`, all `steps()`-based; global `prefers-reduced-motion` guard | Chosen; perpetual `idle-bob`/`drift` from the reference rejected |

### Deliberate divergences from the reference

| Reference trait | Decision | Reason |
|---|---|---|
| Emoji used as icons | Rejected — replaced by `components/ui/pixel-sprites.tsx` (17 inline sprites) | Emoji rendering varies by OS/font and lacks a consistent grid |
| Hamburger menu on mobile | Rejected — five-item labelled bottom nav | Mandated by §6 |
| WebAudio sound effects | Not implemented | No audio requirement; unexpected sound harms usability |
| Perpetual `idle-bob` / `drift` / auto-advancing photo carousel | Rejected | Continuous motion conflicts with `prefers-reduced-motion` and distracts from data |
| `conic-gradient` score ring | Replaced by a 10-step square bar meter plus a framed numeric plate | Keeps the circle-free pixel language while preserving the same numeric value |

### Data-visualisation specifics

- `sector-donut.tsx`: Recharts `Pie` uses `strokeLinejoin`/line caps set to butt, a `pixel.panel` track, and an inset cream centre plate; the legend uses block bars, not coloured dots.
- `cashflow-chart.tsx`: square bars, dotted grid lines, pixel-plaque tooltip, dark axis line; all axis labels, units, and legends retained.
- `progress-bar.tsx`: stepped striped meter; no rounded track or gradient fill.
- `validation-section.tsx`: the score meter is 10 discrete blocks, filled `round(score / 10)`, with the numeric score repeated in a bordered plate and `aria-label` on the meter container.

When token values change, update this document and the actual CSS variables/Tailwind tokens together. Do not allow documentation and implementation to drift.

## 12. Accessibility and responsive quality

- Use semantic landmarks and headings in logical order.
- Maintain strong text contrast on every pixel surface.
- Do not rely on color alone for status.
- Keep visible labels for navigation items and form controls.
- Ensure focus indicators remain visible with pixel-style treatment.
- Respect `prefers-reduced-motion`.
- Test mobile widths 320, 360, 390, and 430 px; tablet 768 px; desktop 1280 and 1440 px.
- Check horizontal overflow, text clipping, nav overlap, safe area, keyboard, map/chart usability, and form interactions.

## 13. Required full-redesign workflow

### Phase 1 — Audit only

Do not edit code yet. Inspect the reference and PRAJVALA codebase; record verified pixel-art characteristics, routes, features, data contracts, current components, tokens, and risks. Propose desktop header and mobile bottom navigation mappings. Present a phased plan and wait for approval.

### Phase 2 — Pixel design system

Implement the shared pixel visual language first: typography, palette, sprite/icon treatment, pixel borders, shadows, buttons, surfaces, navigation, and states. Build the desktop header and mobile bottom bar before page-specific redesign. Validate their appearance at real viewport sizes.

### Phase 3 — Page redesign

Redesign existing routes incrementally. Keep the same pixel world across every page but adapt information layout to each task. Coordinate with team ownership and avoid unrelated files.

### Phase 4 — Visual QA

Inspect actual rendered UI at mobile 320/360/390/430 px, tablet 768 px, desktop 1280/1440 px. Verify pixel sharpness, consistent grid, desktop navigation, five-item mobile bottom navigation (no hamburger), More sheet, safe area, no content overlap, no horizontal overflow, readable tables, charts, maps and forms, keyboard focus, contrast, and reduced motion. If browser/screenshot tools are unavailable, clearly state what remains unverified and provide manual checks.

### Phase 5 — Engineering verification

Inspect `package.json` and run only scripts that exist. Run applicable typecheck, lint, tests, and production build. Report actual outcomes; never claim a test passed if it did not run.

## 14. Definition of done

A redesign is complete only when:

- The pixel-art identity is strong and immediately recognizable across the whole product, not limited to small accents.
- The visual language is faithful to the reference's observed pixel/retro spirit, while all copy and civic content belong to PRAJVALA.
- Existing routes, data, and functionality are preserved.
- Desktop uses the horizontal header.
- Mobile uses five labeled bottom-navigation destinations and no hamburger menu.
- More destinations are reachable from the More bottom sheet/page.
- Content is not covered by the fixed mobile nav or safe area.
- UI was inspected at required viewports or the lack of visual verification is documented.
- Applicable tests/build checks were run and honestly reported.
