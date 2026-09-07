# GenUI Design Tokens

A compact, readable design foundation for generated interfaces.

This folder is intentionally named `tokens/` because the GenUI Source scanner discovers token sources by path segment. `tokens.json` is the scanner-compatible source of truth, while `tokens.js` and `tokens.scss` expose the same design system to runtime and styling code.

The organization follows the same broad idea used by mature systems such as Carbon: foundations and semantic roles are separated from component behavior, and components consume stable tokens instead of embedding visual values.

## Files

- `tokens.json` — canonical JSON token source read by the GenUI Source scanner
- `Design.md` — human-readable design rules and token guidance
- `tokens.js` — JavaScript token API and runtime helpers
- `tokens.scss` — SCSS maps, mixins and CSS custom properties
- `../Components/Components.md` — component selection and API rules
- `../Components/components.js` — component behavior
- `../Components/components.scss` — component styles

## Token hierarchy

Use tokens in this order:

1. **Foundation tokens** — raw scales such as spacing, type size, radius and motion duration.
2. **Semantic tokens** — role-based values such as primary action, surface, text and status.
3. **Component tokens** — component-local aliases derived from semantic tokens when a component needs a stable contract.

Generated component markup should not contain arbitrary visual literals. Component styles should prefer semantic tokens; foundation values are mainly for constructing or extending the system.

## 1. Color

Use color by meaning, not decoration.

| Role | Token intent | Default |
|---|---|---|
| Brand / primary action | `colorPrimary` | `#6C43C6` |
| Secondary action | `colorSecondary` | `#3571FE` |
| Primary text | `colorOnSurface` | `#161C27` |
| Secondary text | `colorOnSurfaceVariant` | `#5F5E60` |
| Base surface | `colorSurface` | `#FFFFFF` |
| Subtle surface | `colorSurfaceContainer` | `#F5F3F1` |
| Strong border | `colorOutline` | `#757775` |
| Subtle border | `colorOutlineVariant` | `#C6C4C0` |
| Success | `colorSuccess` | `#1C8843` |
| Warning | `colorWarning` | `#8C6D00` |
| Danger | `colorError` | `#CC1730` |

Rules:

- Never use success, warning or error colors as decoration.
- Text on semantic status/action colors must use the matching `colorOn*` token.
- Focus indication must remain visible and must not rely on color change alone.
- Prefer neutral surfaces; reserve strong color for action, state, hierarchy or meaningful data emphasis.

## 2. Typography

Default family:

```text
Rookery New, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif
```

Fallbacks are required so generated UI remains robust when the preferred font is unavailable.

| Style | Size / line | Weight | Use |
|---|---|---|---|
| Display | 40–52 / 48–60 | 700 | Hero value or major title |
| Headline L | 32 / 40 | 700 | Page heading |
| Headline M | 28 / 36 | 700 | Major section |
| Headline S | 22 / 28 | 700 | Local section |
| Title | 18–24 / 24–32 | 500 | Card/dialog title |
| Body L | 16 / 24 | 400 | Long-form content |
| Body M | 14 / 20 | 400 | Default UI text |
| Body S | 12 / 16 | 400 | Supporting metadata |
| Label | 12–16 / 16–24 | 500 | Controls and compact emphasis |

Rules:

- Use no more than three text hierarchy levels in one local surface.
- Body M is the default UI size.
- Do not shrink important content to fit; change layout instead.
- Numeric KPI values may use tabular numerals where available.

## 3. Spacing

Use the shared scale:

`0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 56px`

Preferred usage:

- `4–8px`: icon/text and compact internal gaps
- `12–16px`: normal control and card internals
- `20–24px`: section spacing
- `32–56px`: major layout separation

Avoid arbitrary values such as `13px`, `17px` or `27px` unless a platform constraint requires them.

## 4. Layout

Use a responsive 4 / 8 / 12 column model:

| Viewport | Columns | Outer gutter | Typical gap |
|---|---:|---:|---:|
| `< 672px` | 4 | 16px | 16px |
| `672–1055px` | 8 | 24px | 16–24px |
| `>= 1056px` | 12 | 32px | 24px |

Rules:

- Prefer fluid containers with a max readable width over fixed page widths.
- Do not create empty columns just to preserve a template shape.
- Cards in the same row should align to a shared grid.
- Prioritize useful information density without reducing click/touch targets below usable size.
- When content becomes narrow, stack rather than compress.

## 5. Radius

- `radiusSm`: 8px — compact controls
- `radiusMd`: 12px — inputs and standard containers
- `radiusLg`: 16px — cards
- `radiusXl`: 24px — large floating surfaces
- `radiusPill`: 9999px — tags and pill controls

Do not mix multiple radius families in one surface without semantic reason.

## 6. Elevation and blur

Elevation indicates hierarchy, not decoration.

- `elevation1`: subtle separation
- `elevation2`: raised card/menu
- `elevation3`: dialog/floating panel
- `elevation4–5`: exceptional high-level overlays only
- `shadowFocus`: interaction focus only

Blur is allowed only for surfaces that visually sit above content. Keep text contrast valid on translucent backgrounds.

## 7. Motion

Durations:

- Fast: `120ms`
- Base: `200ms`
- Slow: `320ms`

Rules:

- Motion should explain change, hierarchy or continuity.
- Avoid animation that delays completion feedback.
- Respect `prefers-reduced-motion`.
- Spring easing is for small delight moments, not core task completion.

## 8. Interaction size

- Preferred pointer target: 40px or larger for common controls.
- Dense desktop surfaces may use 32px controls where context is clear.
- Icon-only controls require an accessible text alternative.

## 9. States

Every interactive component must distinguish as applicable:

- default
- hover
- active / pressed
- focus-visible
- disabled
- selected / checked
- error
- loading

Do not express a meaningful state through opacity alone.

## GenUI generation order

When generating an interface:

1. Identify the dominant user task.
2. Choose the smallest viable pattern: form, list, detail, table, dashboard or confirmation.
3. Establish content priority before visual styling.
4. Choose existing components from `Components/`.
5. Apply tokens from `tokens.json` / `tokens.scss`.
6. Validate overflow, empty, loading and error states.
7. Validate responsive behavior.
8. Remove decoration that does not improve comprehension or action.

### Dashboard rules

- Put the most decision-relevant KPI or status first.
- Group related KPIs; do not default to one card per number.
- Charts need a question to answer, not data merely to fill space.
- Avoid more than four strong visual accents in one viewport.
- Tables are for comparison and lookup; cards are for summary and hierarchy.

### Form rules

- Prefer one column for data-entry tasks.
- Use two columns only for short, tightly related fields on wide screens.
- Keep labels visible; placeholders are examples, not labels.
- Put validation close to the field.
- Destructive actions must not be visually equal to the main positive action.

## Governance

Add a token only when at least one condition is true:

- it expresses a reusable semantic role;
- it resolves repeated inconsistency;
- it is required by an approved component or platform need.

Avoid aliases that differ only by name. Keep the token system small enough that both designers and models can reliably choose the correct value.
