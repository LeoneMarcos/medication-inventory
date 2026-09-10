# DESIGN.md

> Design specification and implementation contract for Medication Inventory.

**Status:** Active
**Version:** 2.1
**Last updated:** 2026-09-10
**Project type:** Client-side inventory dashboard
**Visual theme:** Approved Teal-Green (`#17685b`) with Light & Dark mode support

---

## 0. Contract

This document is the authoritative source of truth for the visual design, UI behavior, UX conventions, and accessibility expectations for Medication Inventory. Code implementation and this contract must remain synchronized.

---

## 1. Product Context & Objectives

Medication Inventory is a focused browser workspace for clinic staff, pharmacy supervisors, and small healthcare teams to monitor medication stock, batch identifiers, manufacturers, expiration dates, minimum stock thresholds, and unit movements.

All operational data remains local to the browser. The UI makes this boundary clear through clean footer notices and explicit storage feedback if local storage restrictions are encountered.

---

## 2. Visual Direction & Principles

- **Palette & Atmosphere:** Warm clinical teal-green palette (`#17685b`), crisp typography, soft background surfaces, and semantic indicators for stock health.
- **Duality:** Fully integrated Light and Dark themes via CSS design tokens (`:root` and `:root[data-theme='dark']`).
- **Hierarchy:** Spacing, clear surface separation, tabular numbers for stock, and semantic status indicators communicate urgency without visual clutter.
- **Depth without decoration:** Light mode uses restrained borders, layered shadows, and subtle surface gradients to preserve perceived depth without adding ornamental content.
- **No duplicate status messaging:** The five overview cards are the primary summary of inventory health. Do not add banners or calls to action that merely repeat the same status counts without adding a distinct workflow.
- **Purposeful copy:** Decorative eyebrow copy or labels that do not add meaning should be omitted from the main workflow.
- **Accessibility:** High-contrast focus rings (`outline: 3px solid var(--focus)`), touch targets >= 44px on mobile, full modal keyboard trapping, and `prefers-reduced-motion` compliance.

---

## 3. Foundations

### Layout & Container

- **App Shell:** Full height (`min-height: 100dvh`) with subtle radial ambient glow.
- **Page Width:** Max-width `1440px`, centered with fluid horizontal padding (`clamp(20px, 4vw, 64px`).
- **Header:** Sticky-capable top bar (`min-height: 84px` desktop, `76px` mobile) displaying the `inventory-symbol.svg` brand symbol, app title, subtitle, and accessible theme switcher.

### Color Tokens

| Token | Light Theme | Dark Theme | Purpose |
| --- | --- | --- | --- |
| `--canvas` | `#f3f7f4` | `#101a17` | Base background |
| `--surface` | `#ffffff` | `#18251f` | Card and panel backgrounds |
| `--surface-soft` | `#f0f5f2` | `#1d2d25` | Table header, subtle tiles |
| `--surface-hover` | `#e8f0eb` | `#263b30` | Hover states |
| `--ink` | `#233b32` | `#e5efe8` | Primary text |
| `--muted` | `#62736a` | `#a1b5a8` | Supporting / secondary text |
| `--line` | `#cfdcd4` | `#30463a` | Dividers and border strokes |
| `--accent` / `--primary` | `#17685b` | `#89d5b5` / `#9cddbe` | Brand primary, action highlights |
| `--healthy-bg` / `ink` | `#e8f4ed` / `#2c7150` | `#243e30` / `#a1dfb9` | Healthy stock status badge |
| `--low-bg` / `ink` | `#fff4dc` / `#886015` | `#403521` / `#e8c67b` | Low stock warning badge |
| `--expiring-bg` / `ink` | `#fff0e5` / `#96562f` | `#403025` / `#efb58f` | Expiring soon status badge |
| `--expired-bg` / `ink` | `#fcebed` / `#a53d4b` | `#40292f` / `#f0a6b2` | Expired alert badge |
| `--danger` | `#b64040` | `#b73f4d` | Destructive actions |
| `--focus` | `#349781` | `#91d9bb` | Focus ring outline |

### Light-mode surface treatment

Light mode must preserve clear layering between the page background, cards, controls, and the inventory panel. Use stronger but restrained border contrast, low-opacity multi-layer shadows, and subtle gradients. The goal is perceived quality and depth, not glassmorphism, heavy elevation, or decorative noise.

---

## 4. Components & States

### Brand Symbol
- Located at `/inventory-symbol.svg` (teal rounded container with stylized medical capsule in dynamic rotation).

### Buttons (`.ui-button`)
- Variants: `primary`, `secondary`, `ghost`, `danger`.
- Sizes: `sm` (36px min-height), `md` (44px min-height), `lg` (50px min-height).
- Interactive states: hover elevation, active transform (`translateY(1px)`), disabled opacity (0.4).

### Stat Cards (`.stat-card`)
- 5 overview cards: Total Medications, Healthy, Low Stock, Expiring Soon, Expired.
- Interactive filter toggling with `aria-pressed="true"`, accent line indicator, and localized numbers.
- These cards are the canonical high-level status summary. Aggregate warning banners must not duplicate information already visible here.
- The `Needs attention` filter in the stock table remains useful because it performs a distinct aggregation/filtering action rather than repeating the summary visually.

### Inventory Table (`.inventory-table`)
- Semantic desktop table (`th`, `td`, `caption`).
- Mobile breakpoint (`<= 560px`): automatically reshapes rows into card elements using CSS pseudo-elements (`td[data-label]::before`), optimizing touch ergonomics.

### Forms & Modals
- Focus trap and Escape key listener on open.
- Expiration date input with dual manual typing (`YYYY-MM-DD` or `MM/DD/YYYY`) and native calendar picker trigger.
- Invalid date inputs immediately clear internal ISO state to prevent accidental preservation of outdated dates.
- Stock adjustment modal provides live real-time preview of resulting units before confirmation.

---

## 5. Responsive & Accessibility Rules

- Touch targets meet or exceed 44x44px.
- Focus visible rings on all interactive elements.
- Semantic HTML tags (`<header>`, `<main>`, `<footer>`, `<section>`, `<caption>`).
- `aria-invalid` and `aria-describedby` dynamically coupled to form field error texts.
- Live toast region (`role="status"`, `aria-live="polite"`).
- Complete disablement of decorative animations when `prefers-reduced-motion: reduce` is detected.
