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
DESKTOP
┌─────────────────────────────────────────────────────────────────┐
│ [pixel PRAJVALA mark]  Beranda  Anggaran  Proyek  Informasi  Akun │
└─────────────────────────────────────────────────────────────────┘
│                         Page content                             │

MOBILE
┌───────────────────────────────┐
│          Page content         │
│                               │
├───────────────────────────────┤
│ Beranda Anggaran Proyek       │
│ Laporan  Lainnya              │
└───────────────────────────────┘
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

Do not finalize tokens from memory. Inspect the live reference and the current PRAJVALA CSS/Tailwind configuration. Record actual choices and source/uncertainty here.

| Token family | Decision | Status/source |
|---|---|---|
| Pixel/display font | Extract from reference; use only for short display/UI accents | Pending live inspection |
| Body font | Choose for Indonesian UI and dense data readability | Pending |
| Brand palette | Extract actual reference palette; add civic semantic states carefully | Pending |
| Pixel grid scale | Derive a consistent sprite/icon/border grid from reference | Pending |
| Border treatment | Reproduce the reference's hard-edged/pixel framing | Pending |
| Shadow treatment | Match its block/offset shadow character where verified | Pending |
| Surface/background | Extract reference contrast and adapt to data readability | Pending |
| Radius/shape | Prefer observed square/stepped geometry where reference uses it | Pending |
| Desktop breakpoint | Inspect current project breakpoints and navigation fit | Pending |
| Bottom-nav height | Measure after implementation, include safe area | Pending |

When token values are measured or chosen, update this document and actual CSS variables/Tailwind tokens together. Do not allow documentation and implementation to drift.

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
