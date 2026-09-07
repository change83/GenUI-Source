# Components.md — ustwo/basic-web

> **This file is an excerpt.** The published original is 28 components and ~35,000
> characters — every component in `js/components` in the same shape as the six below.
> It is included so you can see the format the tool produces; it is not loaded into the
> app, and the app generates its own from whatever repo you point it at.

Generated 2026-08-28 by reading js/components in ustwo/basic-web on branch develop.
Every file in that folder is a component by construction — the repo's own structure is the filter,
so nothing was excluded here. Props are extracted from raw source, not from a manifest or a package.
The three descriptive fields are drafted from source and reviewed by hand. Design tokens live in Design.md.

- Components: 28
- Props read from source: 107
- Mount: each component is the default or named export of its own source file, compiled from that file

## js/components

### UIButton

- Source: `js/components/ui-button.js` (line 6)
- Kind: web-component `<ui-button>` · export `UIButton`
- Summary: A customizable button web component that supports multiple visual variants, sizes, and states with native click event propagation.
- Use when: You need a button for user interactions with configurable appearance through variants (primary, secondary, success, warning, danger, ghost, light) and sizes (sm, md, lg). Use when you need full-width layout control via the full attribute or disabled state management.
- Don't use when: Do not use for toggle buttons or checkbox/radio-like behaviors; use a dedicated toggle component instead. Do not use when you need a link that navigates; use a link component instead.
- Description source: AI draft from source — check it reads true
- Props:
  - `variant`: string — optional — default `primary` — read from observedAttributes
  - `size`: string — optional — default `md` — read from observedAttributes
  - `disabled`: boolean — optional — read from observedAttributes
  - `full`: string — optional — read from observedAttributes
  - `type`: string — optional — default `button` — read from observedAttributes
- Doc comment in source: <ui-button variant="primary" size="md">Save changes</ui-button> Variants: primary, secondary, success, warning, danger, ghost, light. Sizes: sm, md, lg. Add the bare attribute "disabled" or "full" as needed. Fires a native "click" event (composed, so it bubbles out of the shadow root).

### UICard

- Source: `js/components/ui-card.js` (line 5)
- Kind: web-component `<ui-card>` · export `UICard`
- Summary: A container component that displays content in a card with optional header and footer slots, supporting raised or flat elevation styles.
- Use when: You need to group related content in a self-contained surface with clear visual hierarchy. Use it with the raised attribute for emphasis or flat for a minimal border-only appearance.
- Don't use when: Do not use this component for full-page layouts or modal dialogs—use a dedicated layout or modal component instead. Do not use it when you need custom shadow or elevation states beyond raised and flat variants.
- Description source: AI draft from source — check it reads true
- Props:
  - `raised`: string — optional — read from observedAttributes
  - `flat`: string — optional — read from observedAttributes
- Doc comment in source: <ui-card><span slot="header">Project status</span> Three tasks remain. <span slot="footer">Updated today</span></ui-card> Slots: default (body), header, footer. Add "raised" for a stronger shadow, or "flat" for a border-only card with no elevation.

### UIAlert

- Source: `js/components/ui-alert.js` (line 4)
- Kind: web-component `<ui-alert>` · export `UIAlert`
- Summary: A dismissible alert component that displays contextual messages in info, success, warning, or danger variants with an icon and optional title.
- Use when: You need to show users time-sensitive feedback or important information that they can acknowledge and close, such as form submission results, validation errors, or system status updates.
- Don't use when: For persistent notifications that should not be closeable, use a notification component instead. For inline field-level validation messages, use a form validation component.
- Description source: AI draft from source — check it reads true
- Props:
  - `variant`: string — optional — default `info` — read from observedAttributes
  - `title`: string — optional — read from observedAttributes
  - `dismissible`: boolean — optional — read from observedAttributes
- Doc comment in source: <ui-alert variant="success" title="Saved" dismissible>Your changes are live.</ui-alert> Variants: info, success, warning, danger. Fires "dismiss" when closed.

### UIModal

- Source: `js/components/ui-modal.js` (line 5)
- Kind: web-component `<ui-modal>` · export `UIModal`
- Summary: A modal dialog component that displays a heading, body content, and optional footer actions, dismissible via close button, scrim click, or Escape key.
- Use when: You need to present important information or request confirmation that requires user attention before proceeding. Use when the interaction should block access to the rest of the page until resolved.
- Don't use when: Do not use for non-blocking notifications or alerts—use a toast or snackbar instead. Do not use for complex multi-step forms—use a dedicated dialog or wizard component.
- Description source: AI draft from source — check it reads true
- Props:
  - `heading`: string — optional — read from observedAttributes
  - `open`: boolean — optional — read from observedAttributes
  - `size`: string — optional — default `md` — read from observedAttributes
- Doc comment in source: <ui-modal heading="Delete project" open><p>This cannot be undone.</p><ui-button slot="footer" variant="danger">Delete</ui-button></ui-modal> Slots: default (body), footer. Fires "close" when dismissed. Closes on scrim click, on the close button, and on Escape.

### UITable

- Source: `js/components/ui-table.js` (line 5)
- Kind: web-component `<ui-table>` · export `UITable`
- Summary: A web component that renders tabular data with configurable columns and rows, supporting striped and compact density modes.
- Use when: You need to display structured data in rows and columns with optional visual density adjustments. Use when you want a self-contained table element that parses comma-separated columns and semicolon/pipe-separated cell data.
- Don't use when: Do not use for complex interactive tables requiring sorting, filtering, or pagination; use a more feature-rich data grid component instead. Do not use for layout purposes unrelated to tabular data.
- Description source: AI draft from source — check it reads true
- Props:
  - `columns`: string — optional — read from observedAttributes
  - `rows`: "Jane Doe" | "Designer" | "Active;Sam Reed" | "Engineer" | "Away" — optional — one of `Jane Doe` | `Designer` | `Active;Sam Reed` | `Engineer` | `Away` — read from observedAttributes
  - `striped`: string — optional — read from observedAttributes
  - `compact`: boolean — optional — read from observedAttributes
  - `caption`: string — optional — read from observedAttributes
- Variants:
  - `rows`: `Jane Doe` | `Designer` | `Active;Sam Reed` | `Engineer` | `Away`
- Doc comment in source: <ui-table columns="Name,Role,Status" rows="Jane Doe|Designer|Active;Sam Reed|Engineer|Away"></ui-table> Columns are comma-separated; rows are semicolon-separated with pipe-separated cells. Add "striped" or "compact" to change density. Fires "rowclick" with detail.index.

### UIToast

- Source: `js/components/ui-toast.js` (line 5)
- Kind: web-component `<ui-toast>` · export `UIToast`
- Summary: A fixed-position notification that displays a brief message in a corner and automatically dismisses after a specified duration.
- Use when: You need to inform users of a transient event outcome like a successful save or warning, and the message should not block interaction with the page. Set duration to 0 if the toast should persist until manually dismissed.
- Don't use when: For critical errors requiring user acknowledgment or action—use a modal dialog instead. For messages that need to persist on the page or be permanently logged—use an alert component or separate log section instead.
- Description source: AI draft from source — check it reads true
- Props:
  - `variant`: string — optional — default `info` — read from observedAttributes
  - `message`: string — optional — read from observedAttributes
  - `duration`: string — optional — read from observedAttributes
  - `position`: string — optional — default `bottom-right` — read from observedAttributes
- Doc comment in source: <ui-toast variant="success" message="Saved successfully" duration="4000"></ui-toast> Appears fixed in the corner and removes itself after "duration" ms (0 keeps it). Variants: info, success, warning, danger. Fires "dismiss" when it goes.

---

*Remaining components in the published file, same format: UIAccordion, UIAvatar, UIBadge,
UICheckbox, UIChip, UIDivider, UIDropdown, UIEmptyState, UIIconButton, UIPagination,
UIProgress, UIRadio, UISearchField, UISelect, UISkeleton, UISlider, UISpinner, UITabs,
UITextarea, UITextfield, UIToggle, UITooltip.*
