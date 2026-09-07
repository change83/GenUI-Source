# GenUI Design

A compact design foundation for generated interfaces.

`Design.md` is the readable rule set. `tokens.js` is the machine-readable token source for JavaScript. `tokens.scss` exposes the same system to SCSS/CSS. Components must consume semantic tokens instead of embedding visual values.

The organization follows the same broad idea used by mature design systems such as Carbon: foundations and theme tokens are separated from component behavior, while generated UI consumes a stable semantic layer.

## Token hierarchy

Use tokens in this order:

1. **Foundation tokens** — raw scale values such as spacing steps and type sizes.
2. **Semantic tokens** — role-based values such as `text-primary`, `surface`, `border-subtle`, `action-primary`.
3. **Component tokens** — local aliases used by components, derived from semantic tokens.

Generated component markup should normally reference no visual value directly. Component SCSS should prefer semantic tokens. Raw foundation values are acceptable only for building or extending the system itself.

## Core design rules

### 1. Color

Use color by meaning, not by decoration.

| Role | Token | Default |
|---|---|---|
| Brand/action | `color.action.primary` | `#6C43C6` |
| Secondary action | `color.action.secondary` | `#3571FE` |
| Primary text | `color.text.primary` | `#161C27` |
| Secondary text | `color.text.secondary` | `#5F5E60` |
| Base surface | `color.surface.base` | `#FFFFFF` |
| Subtle surface | `color.surface.subtle` | `#F5F3F1` |
| Strong border | `color.border.strong` | `#757775` |
| Subtle border | `color.border.subtle` | `#C6C4C0` |
| Success | `color.status.success` | `#1C8843` |
| Warning | `color.status.warning` | `#8C6D00` |
| Danger | `color.status.danger` | `#CC1730` |
| Focus | `color.focus` | `#6C43C6` |

Rules:

- Never use status colors as decorative accents.
- Text placed on semantic status/action colors must use the matching `on-*` token.
- Focus indication must remain visible and must not rely on color change alone.
- Prefer neutral surfaces. Use stronger color for action, state, or hierarchy.

### 2. Typography

Default family:

```text
Rookery New, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif
```

Fallbacks are required so generated UI remains robust when the preferred font is unavailable.

| Style | Size / line | Weight | Use |
|---|---|---|---|
| Display | 40 / 48 | 700 | Hero-level value or title |
| Heading L | 32 / 40 | 700 | Page heading |
| Heading M | 28 / 36 | 700 | Major section |
| Heading S | 22 / 28 | 700 | Local section |
| Title | 18 / 24 | 500 | Card/dialog title |
| Body L | 16 / 24 | 400 | Long-form content |
| Body M | 14 / 20 | 400 | Default UI text |
| Body S | 12 / 16 | 400 | Supporting metadata |
| Label | 14 / 20 | 500 | Controls and compact emphasis |

Rules:

- Use no more than 3 text hierarchy levels in one local surface.
- Body M is the default UI size.
- Do not shrink important content to fit; change layout instead.
- Numeric KPI values may use tabular numerals where available.

### 3. Spacing

Use the shared spacing scale:

`0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 56px`

Preferred usage:

- `4–8`: icon/text and compact internal gaps
- `12–16`: normal control and card internals
- `20–24`: section spacing
- `32–56`: major layout separation

Generated UI should use the smallest spacing step that still preserves scanability. Avoid arbitrary values such as `13px`, `17px`, or `27px`.

### 4. Layout

Use a responsive 4 / 8 / 12 column model:

| Viewport | Columns | Outer gutter | Typical gap |
|---|---:|---:|---:|
| `< 672px` | 4 | 16px | 16px |
| `672–1055px` | 8 | 24px | 16–24px |
| `>= 1056px` | 12 | 32px | 24px |

Rules:

- Prefer fluid containers with a max readable width over fixed page widths.
- Do not create empty columns just to preserve a template shape.
- Cards in the same row should align to a shared grid and baseline.
- In generated dashboards, prioritize information density without reducing touch/click target size.
- When content becomes narrow, stack rather than compress controls below usable size.

### 5. Radius

Use a small semantic set:

- `sm`: 8px — controls, compact chips
- `md`: 12px — inputs and standard containers
- `lg`: 16px — cards
- `xl`: 24px — large floating surfaces
- `pill`: 9999px — tags and pill controls

Do not mix multiple radius families in one surface without semantic reason.

### 6. Elevation and blur

Elevation should indicate hierarchy, not decoration.

- `elevation-1`: subtle separation
- `elevation-2`: raised card/menu
- `elevation-3`: dialog/floating panel
- `focus-ring`: interaction focus only

Blur is allowed only for surfaces that visually sit above content. Keep text contrast valid on translucent backgrounds.

### 7. Motion

Durations:

- Fast: `120ms`
- Base: `200ms`
- Slow: `320ms`

Easing:

- Standard: state transitions
- Ease-out: entering/revealing
- Spring: small delight moments only

Rules:

- Motion must explain change, hierarchy, or continuity.
- Avoid motion that delays completion feedback.
- Respect `prefers-reduced-motion`.

### 8. Interaction size

- Minimum pointer target: 40px preferred for common controls.
- Dense desktop surfaces may use 32px controls when spacing and context remain clear.
- Icon-only controls require a text alternative.

### 9. States

Every interactive component must be able to distinguish:

- default
- hover
- active/pressed
- focus-visible
- disabled
- selected/checked when applicable
- error when applicable
- loading when applicable

Do not create state differences through opacity alone when meaning would become ambiguous.

## GenUI layout decisions

For model-generated interfaces, follow this order:

1. Identify the dominant user task.
2. Choose the smallest viable pattern: form, list, detail, table, dashboard, or confirmation.
3. Establish content priority before visual styling.
4. Choose existing components.
5. Apply semantic tokens.
6. Validate overflow, empty states, error states, and loading states.
7. Validate responsive behavior.
8. Remove decorative elements that do not improve comprehension or action.

### Dashboard rules

- Put the most decision-relevant KPI or status first.
- Group related KPIs; do not create one card per number by default.
- Charts need a question to answer, not just data to fill space.
- Avoid more than 4 strong visual accents in one viewport.
- Tables are for comparison and lookup; cards are for summary and hierarchy.

### Form rules

- Prefer one column for data-entry tasks.
- Use two columns only for short, tightly related fields on wide screens.
- Keep labels visible; placeholders are examples, not labels.
- Put validation close to the field.
- Destructive actions must not be visually equal to the main positive action.

## Theme support

The SCSS exposes CSS custom properties in `:root` and a dark theme under:

```html
<html data-theme="dark">
```

JavaScript consumers can read `designTokens` or use `applyTheme()` for runtime overrides.

## Files

- `Design.md` — readable design rules and token guidance
- `tokens.js` — machine-readable tokens + runtime helpers
- `tokens.scss` — SCSS variables, maps, mixins, CSS custom properties
- `../Components/Components.md` — component selection and API rules
- `../Components/components.js` — behavior
- `../Components/components.scss` — component styles

## Governance

A token should be added only when at least one of these is true:

- it expresses a reusable semantic role;
- it resolves repeated inconsistency;
- it is required by an approved component or platform need.

Avoid token aliases that differ only by name. The semantic layer should stay small enough that both designers and models can reliably choose the right value.
