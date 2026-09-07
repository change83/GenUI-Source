# GenUI Components

A compact component library for generated interfaces.

This folder is intentionally small and explicit: one readable component contract (`Components.md`), one browser implementation (`components.js`), and one SCSS source (`components.scss`). The structure is inspired by Carbon's separation of component documentation, behavior, and styles, but the implementation here is purpose-built for GenUI.

## Why this shape

GenUI needs component definitions that are:

- **Human-readable** — a designer can understand what a component is for without reading source.
- **Agent-readable** — names, props, states, and selection rules are explicit and stable.
- **Executable** — the JS registers real custom elements.
- **Token-driven** — SCSS consumes only design tokens from `../Design/tokens.scss`.
- **Small by default** — use common components first; add new components only when repeated product needs justify them.

## Usage

```js
import { registerGenUIComponents } from './Components/components.js';

registerGenUIComponents();
```

Compile `Components/components.scss` together with `Design/tokens.scss`, then load the resulting CSS globally.

```html
<ui-button variant="primary">Continue</ui-button>

<ui-text-input
  label="Project name"
  placeholder="Untitled project">
</ui-text-input>
```

## Generation rules

1. **Reuse before creating.** Choose an existing component when it can express the interaction without custom structure.
2. **Do not invent props.** Only use attributes documented in the catalog below.
3. **Prefer semantic variants.** Use `primary`, `secondary`, `danger`, `success`, `warning`, `info`, and `neutral` instead of raw colors.
4. **One primary action per local task.** Additional actions should normally be secondary or ghost.
5. **State must be explicit.** Disabled, error, selected, loading, and open states must come from component attributes rather than visual imitation.
6. **Use native meaning.** Buttons trigger actions, links navigate, checkboxes allow independent selections, radios choose one option, toggles change an immediate binary setting.
7. **Keep generated UI concise.** Prefer fewer components with clearer grouping over deeply nested surfaces.
8. **Accessibility is part of the contract.** Interactive controls require visible labels or an `aria-label`; focus must never be removed.
9. **No raw visual values in component markup.** Color, spacing, radius, typography, motion, and elevation come from Design tokens.
10. **Escalate only when necessary.** A bespoke component is justified when the same new interaction pattern appears repeatedly and cannot be composed safely from the catalog.

## Common component catalog

| Component | Element | Use for | Key attributes |
|---|---|---|---|
| Button | `ui-button` | Primary and secondary actions | `variant`, `size`, `disabled`, `full`, `type` |
| Icon button | `ui-icon-button` | Compact icon-only action | `label`, `variant`, `size`, `disabled` |
| Card | `ui-card` | Grouping related content | `heading`, `subheading`, `elevated`, `interactive` |
| Text input | `ui-text-input` | Single-line text entry | `label`, `value`, `placeholder`, `type`, `helper`, `error`, `disabled`, `name` |
| Textarea | `ui-textarea` | Multi-line text entry | `label`, `value`, `placeholder`, `rows`, `helper`, `error`, `disabled`, `name` |
| Select | `ui-select` | Choosing one item from a compact list | `label`, `options`, `value`, `placeholder`, `error`, `disabled`, `name` |
| Checkbox | `ui-checkbox` | Independent on/off selection | `label`, `checked`, `disabled`, `name`, `value` |
| Radio | `ui-radio` | One choice in a named group | `label`, `checked`, `disabled`, `name`, `value` |
| Toggle | `ui-toggle` | Immediate binary setting | `label`, `checked`, `disabled`, `name` |
| Search | `ui-search` | Search/filter input | `label`, `value`, `placeholder`, `disabled` |
| Tag | `ui-tag` | Compact category/status label | `kind`, `size`, `dismissible` |
| Alert | `ui-alert` | Contextual inline feedback | `kind`, `title`, `dismissible` |
| Tabs | `ui-tabs` | Switching peer views | `items`, `active` |
| Accordion | `ui-accordion` | Progressive disclosure | `items`, `multiple` |
| Modal | `ui-modal` | Blocking confirmation or focused task | `heading`, `open`, `size`, `dismissible` |
| Tooltip | `ui-tooltip` | Short supplementary explanation | `label`, `position` |
| Pagination | `ui-pagination` | Paging a known result set | `page`, `page-size`, `total` |
| Progress | `ui-progress` | Known completion progress | `value`, `label` |
| Skeleton | `ui-skeleton` | Loading placeholder | `type`, `lines` |
| Toast | `ui-toast` | Brief non-blocking outcome | `kind`, `message`, `duration` |

## Component contracts

### Button

Use for explicit actions such as save, continue, submit, retry, or delete.

```html
<ui-button variant="primary" size="md">Save changes</ui-button>
<ui-button variant="danger">Delete</ui-button>
```

- Variants: `primary`, `secondary`, `ghost`, `danger`
- Sizes: `sm`, `md`, `lg`
- Use `full` only when the container is narrow or a single dominant action needs full width.
- Do not use a button to navigate to a new URL.

### Icon button

Use when the icon meaning is standard and space is constrained.

```html
<ui-icon-button label="Close">×</ui-icon-button>
```

- `label` is required and becomes the accessible name.
- Do not use an unlabeled icon-only action.

### Card

Use to group related content into one surface. Keep hierarchy shallow.

```html
<ui-card heading="Revenue" subheading="Last 30 days" elevated>
  <strong>$128K</strong>
</ui-card>
```

- `elevated` adds separation from the background.
- `interactive` is for a card that behaves as one click target; do not place nested interactive controls inside it.

### Text input / Textarea

Use a visible label whenever possible. Use helper text for guidance and `error` for validation.

```html
<ui-text-input label="Email" type="email" error="Enter a valid email"></ui-text-input>
```

Events: `input`, `change`.

### Select

`options` is a JSON array. Use a select for a short, known list.

```html
<ui-select
  label="Status"
  value="active"
  options='[{"label":"Active","value":"active"},{"label":"Paused","value":"paused"}]'>
</ui-select>
```

Event: `change`.

### Checkbox / Radio / Toggle

- Checkbox: independent choices.
- Radio: exactly one choice within the same `name`.
- Toggle: immediate setting change; avoid using it for a multi-step submit flow.

Events: `change`.

### Search

Use for find/filter behavior, not for arbitrary single-line data entry.

```html
<ui-search placeholder="Search projects"></ui-search>
```

Event: `input`.

### Tag

Use for compact metadata, status, or applied filter chips.

- Kinds: `neutral`, `info`, `success`, `warning`, `danger`
- A dismissible tag emits `dismiss`.

### Alert

Use for information that should remain visible in context.

- Kinds: `info`, `success`, `warning`, `danger`
- A dismissible alert emits `dismiss`.
- Critical destructive confirmation belongs in a modal, not an alert.

### Tabs

`items` is JSON:

```html
<ui-tabs
  active="0"
  items='[{"label":"Overview","value":"overview"},{"label":"Activity","value":"activity"}]'>
</ui-tabs>
```

Event: `change` with `detail: { index, value }`.

Use tabs only for peer views. Do not use them to represent sequential steps.

### Accordion

`items` is JSON:

```html
<ui-accordion
  items='[
    {"title":"Details","content":"Project details"},
    {"title":"Permissions","content":"Access settings"}
  ]'>
</ui-accordion>
```

Event: `toggle` with `detail: { index, open }`.

### Modal

Use for blocking decisions or short focused tasks.

```html
<ui-modal heading="Delete project" open>
  This cannot be undone.
</ui-modal>
```

Event: `close`.

- Sizes: `sm`, `md`, `lg`
- Escape and backdrop click close a dismissible modal.
- Avoid long documents or complex navigation inside a modal.

### Tooltip

Use for short supplemental help. The main meaning of a control must remain understandable without it.

### Pagination

Event: `change` with `detail: { page, pageSize }`.

Prefer progressive loading when the total is unknown; use pagination when users need stable page boundaries.

### Progress / Skeleton

- `ui-progress`: known numeric progress from `0` to `100`.
- `ui-skeleton`: unknown loading duration.

Do not show a fake percentage when the system cannot estimate completion.

### Toast

Use for transient success/info/warning/error outcomes that do not require blocking action.

Event: `dismiss`.

## GenUI selection hints

| Intent | Preferred component |
|---|---|
| Do something | Button |
| Choose one from several visible options | Radio |
| Choose zero or more | Checkbox |
| Change a binary setting immediately | Toggle |
| Choose one from a compact list | Select |
| Enter short text | Text input |
| Enter long text | Textarea |
| Filter/find | Search |
| Group related content | Card |
| Switch peer views | Tabs |
| Reveal optional detail | Accordion |
| Persistent contextual feedback | Alert |
| Blocking confirmation | Modal |
| Short transient outcome | Toast |
| Loading, duration unknown | Skeleton |
| Loading, completion known | Progress |

## Stable API rule

Attributes, events, and element names in this document are the public GenUI contract. A breaking rename should be treated as a versioned design-system change, not an incidental refactor.

## Carbon reference

Carbon is used as an architectural reference for separation of documentation, implementation, tokens, accessibility, and componentized SCSS. This repository does **not** vendor Carbon source code and intentionally keeps only a common GenUI subset.
