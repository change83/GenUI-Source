# GenUI Components

This folder is intentionally structured for the GenUI Source reader: **one JavaScript file equals one component**. Every component directly extends `HTMLElement`, declares `observedAttributes`, defines a visible default render, registers one custom element, and exports that class as default. This lets Source extract props and compile a live preview from the same file.

The library keeps only common UI building blocks. Visual values are token-driven from `../tokens/`.

## Generation rules

1. Reuse an existing component before inventing markup.
2. Do not invent attributes that are not listed below.
3. Use semantic variants (`primary`, `secondary`, `danger`, `success`, `warning`, `info`) rather than raw colors.
4. Keep one primary action per local task.
5. Prefer native interaction meaning: button = action, radio = one choice, checkbox = independent choices, toggle = immediate binary setting.
6. Loading state: use progress only when completion is measurable; otherwise use skeleton.
7. Use modal only for blocking decisions or short focused tasks.
8. Component JS includes minimal Shadow DOM styles so Source can render it independently; `components.scss` provides the shared production bridge to design tokens.

## Components

### UIButton
- Source: `Components/ui-button.js`
- Kind: web-component `<ui-button>`
- Summary: A button for explicit user actions with semantic variants and three sizes.
- Use when: The user needs to save, continue, submit, retry, create, or delete.
- Don't use when: The user is navigating to another destination; use a link/navigation pattern instead.
- Props: `variant`, `size`, `disabled`, `full`, `type`

### UICard
- Source: `Components/ui-card.js`
- Kind: web-component `<ui-card>`
- Summary: A surface that groups related content into a scannable unit.
- Use when: Content belongs together and benefits from a clear local hierarchy.
- Don't use when: The card only adds decoration or creates unnecessary nesting.
- Props: `heading`, `subheading`, `elevated`, `interactive`

### UITextInput
- Source: `Components/ui-text-input.js`
- Kind: web-component `<ui-text-input>`
- Summary: A labeled single-line text field with helper and error states.
- Use when: Collecting names, email, identifiers, search-independent text, or other short values.
- Don't use when: The value is long-form content; use textarea.
- Props: `label`, `placeholder`, `type`, `value`, `helper`, `error`, `disabled`, `name`

### UITextarea
- Source: `Components/ui-textarea.js`
- Kind: web-component `<ui-textarea>`
- Summary: A labeled multi-line text field.
- Use when: Collecting notes, descriptions, comments, or other long-form text.
- Don't use when: A single line is sufficient; use text input.
- Props: `label`, `placeholder`, `value`, `rows`, `helper`, `error`, `disabled`, `name`

### UISelect
- Source: `Components/ui-select.js`
- Kind: web-component `<ui-select>`
- Summary: A compact control for choosing one value from a known list.
- Use when: The option list is known and does not need to stay visible.
- Don't use when: Users need to compare a small set of choices side-by-side; use radios.
- Props: `label`, `options`, `value`, `disabled`, `name`

### UICheckbox
- Source: `Components/ui-checkbox.js`
- Kind: web-component `<ui-checkbox>`
- Summary: An independent binary selection control.
- Use when: Multiple options may be selected independently.
- Don't use when: Exactly one option must be chosen; use radio.
- Props: `label`, `checked`, `disabled`, `name`, `value`

### UIRadio
- Source: `Components/ui-radio.js`
- Kind: web-component `<ui-radio>`
- Summary: A single option within an exclusive choice group.
- Use when: Exactly one of several visible options must be chosen.
- Don't use when: Options are independent; use checkbox.
- Props: `name`, `value`, `label`, `checked`, `disabled`

### UIToggle
- Source: `Components/ui-toggle.js`
- Kind: web-component `<ui-toggle>`
- Summary: An immediate on/off setting control.
- Use when: Changing the switch should take effect immediately.
- Don't use when: The value is part of a form submitted later; use checkbox.
- Props: `label`, `checked`, `disabled`, `name`

### UISearch
- Source: `Components/ui-search.js`
- Kind: web-component `<ui-search>`
- Summary: A dedicated search/filter field.
- Use when: Users need to find or filter items in the current context.
- Don't use when: Collecting ordinary text data; use text input.
- Props: `placeholder`, `value`, `disabled`, `label`

### UIAlert
- Source: `Components/ui-alert.js`
- Kind: web-component `<ui-alert>`
- Summary: Persistent contextual feedback with semantic status variants.
- Use when: Information or an outcome should remain visible in context.
- Don't use when: The message is transient and non-blocking; use toast.
- Props: `variant`, `title`, `dismissible`

### UITabs
- Source: `Components/ui-tabs.js`
- Kind: web-component `<ui-tabs>`
- Summary: A peer-view switcher for a small number of related sections.
- Use when: Views are peers and users may switch between them in any order.
- Don't use when: The flow is sequential; use a step/progress pattern.
- Props: `labels`, `selected`

### UIAccordion
- Source: `Components/ui-accordion.js`
- Kind: web-component `<ui-accordion>`
- Summary: A disclosure component for optional details.
- Use when: Secondary content can be hidden until requested.
- Don't use when: The content is required to complete the primary task.
- Props: `label`, `open`, `disabled`

### UIModal
- Source: `Components/ui-modal.js`
- Kind: web-component `<ui-modal>`
- Summary: A blocking dialog for confirmation or a short focused task.
- Use when: The user must resolve a decision before returning to the underlying UI.
- Don't use when: Content is long, navigational, or non-blocking.
- Props: `heading`, `open`, `size`, `dismissible`

### UIPagination
- Source: `Components/ui-pagination.js`
- Kind: web-component `<ui-pagination>`
- Summary: Page navigation for a known result set.
- Use when: Stable page boundaries help lookup or comparison.
- Don't use when: The total is unknown or continuous loading is a better fit.
- Props: `page`, `total`

### UIProgress
- Source: `Components/ui-progress.js`
- Kind: web-component `<ui-progress>`
- Summary: A progress bar for measurable completion.
- Use when: The system can estimate a real percentage.
- Don't use when: Completion cannot be estimated; use skeleton.
- Props: `value`, `label`, `variant`

### UISkeleton
- Source: `Components/ui-skeleton.js`
- Kind: web-component `<ui-skeleton>`
- Summary: A structural loading placeholder for unknown-duration loading.
- Use when: Content shape is known but load completion is not.
- Don't use when: A real percentage is available; use progress.
- Props: `lines`, `width`, `height`, `circle`

### UIToast
- Source: `Components/ui-toast.js`
- Kind: web-component `<ui-toast>`
- Summary: Brief non-blocking outcome feedback.
- Use when: Confirming a save, update, copy, or lightweight warning without interrupting work.
- Don't use when: The message requires acknowledgment or persistent action.
- Props: `variant`, `message`, `duration`

## Design dependency

Design tokens live in `../tokens/tokens.json`, with readable rules in `../tokens/Design.md` and runtime/SCSS representations in `../tokens/tokens.js` and `../tokens/tokens.scss`.
