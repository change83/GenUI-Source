/**
 * GenUI common components.
 *
 * Lightweight, dependency-free Web Components designed for generated UI.
 * Styles live in components.scss; visual values come from Design tokens.
 */

const BaseHTMLElement = globalThis.HTMLElement ?? class {};

const escapeHTML = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const has = (el, name) => el.hasAttribute(name);
const attr = (el, name, fallback = '') => el.getAttribute(name) ?? fallback;
const numberAttr = (el, name, fallback = 0) => {
  const value = Number(el.getAttribute(name));
  return Number.isFinite(value) ? value : fallback;
};

const parseItems = (el, name = 'items') => {
  const raw = el.getAttribute(name);
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch {
    console.warn(`[GenUI] "${name}" on <${el.localName}> must be valid JSON.`);
    return [];
  }
};

const emit = (el, type, detail = {}) =>
  el.dispatchEvent(
    new CustomEvent(type, {
      detail,
      bubbles: true,
      composed: true,
    }),
  );

export const componentCatalog = Object.freeze({
  button: {
    element: 'ui-button',
    priority: 'P0',
    useWhen: 'Triggering an action',
    variants: ['primary', 'secondary', 'ghost', 'danger'],
    sizes: ['sm', 'md', 'lg'],
    attributes: ['variant', 'size', 'disabled', 'full', 'type'],
  },
  iconButton: {
    element: 'ui-icon-button',
    priority: 'P0',
    useWhen: 'A compact icon-only action has a standard meaning',
    attributes: ['label', 'variant', 'size', 'disabled'],
  },
  card: {
    element: 'ui-card',
    priority: 'P0',
    useWhen: 'Grouping related content into one surface',
    attributes: ['heading', 'subheading', 'elevated', 'interactive'],
  },
  textInput: {
    element: 'ui-text-input',
    priority: 'P0',
    useWhen: 'Single-line text entry',
    attributes: ['label', 'value', 'placeholder', 'type', 'helper', 'error', 'disabled', 'name'],
    events: ['input', 'change'],
  },
  textarea: {
    element: 'ui-textarea',
    priority: 'P0',
    useWhen: 'Multi-line text entry',
    attributes: ['label', 'value', 'placeholder', 'rows', 'helper', 'error', 'disabled', 'name'],
    events: ['input', 'change'],
  },
  select: {
    element: 'ui-select',
    priority: 'P0',
    useWhen: 'Choosing one item from a compact known list',
    attributes: ['label', 'options', 'value', 'placeholder', 'error', 'disabled', 'name'],
    events: ['change'],
  },
  checkbox: {
    element: 'ui-checkbox',
    priority: 'P0',
    useWhen: 'Independent selection',
    attributes: ['label', 'checked', 'disabled', 'name', 'value'],
    events: ['change'],
  },
  radio: {
    element: 'ui-radio',
    priority: 'P0',
    useWhen: 'Exactly one choice in a visible group',
    attributes: ['label', 'checked', 'disabled', 'name', 'value'],
    events: ['change'],
  },
  toggle: {
    element: 'ui-toggle',
    priority: 'P0',
    useWhen: 'Immediate binary setting',
    attributes: ['label', 'checked', 'disabled', 'name'],
    events: ['change'],
  },
  search: {
    element: 'ui-search',
    priority: 'P0',
    useWhen: 'Search or filter',
    attributes: ['label', 'value', 'placeholder', 'disabled'],
    events: ['input'],
  },
  tag: {
    element: 'ui-tag',
    priority: 'P1',
    useWhen: 'Compact metadata, status, or filter value',
    kinds: ['neutral', 'info', 'success', 'warning', 'danger'],
    attributes: ['kind', 'size', 'dismissible'],
    events: ['dismiss'],
  },
  alert: {
    element: 'ui-alert',
    priority: 'P0',
    useWhen: 'Persistent contextual feedback',
    kinds: ['info', 'success', 'warning', 'danger'],
    attributes: ['kind', 'title', 'dismissible'],
    events: ['dismiss'],
  },
  tabs: {
    element: 'ui-tabs',
    priority: 'P0',
    useWhen: 'Switching between peer views',
    attributes: ['items', 'active'],
    events: ['change'],
  },
  accordion: {
    element: 'ui-accordion',
    priority: 'P1',
    useWhen: 'Progressive disclosure of optional detail',
    attributes: ['items', 'multiple'],
    events: ['toggle'],
  },
  modal: {
    element: 'ui-modal',
    priority: 'P0',
    useWhen: 'Blocking confirmation or a short focused task',
    sizes: ['sm', 'md', 'lg'],
    attributes: ['heading', 'open', 'size', 'dismissible'],
    events: ['close'],
  },
  tooltip: {
    element: 'ui-tooltip',
    priority: 'P1',
    useWhen: 'Short supplemental explanation',
    attributes: ['label', 'position'],
  },
  pagination: {
    element: 'ui-pagination',
    priority: 'P1',
    useWhen: 'Paging a known result set',
    attributes: ['page', 'page-size', 'total'],
    events: ['change'],
  },
  progress: {
    element: 'ui-progress',
    priority: 'P1',
    useWhen: 'Completion percentage is known',
    attributes: ['value', 'label'],
  },
  skeleton: {
    element: 'ui-skeleton',
    priority: 'P1',
    useWhen: 'Loading duration is unknown',
    attributes: ['type', 'lines'],
  },
  toast: {
    element: 'ui-toast',
    priority: 'P1',
    useWhen: 'Brief non-blocking outcome',
    attributes: ['kind', 'message', 'duration'],
    events: ['dismiss'],
  },
});

class GenUIElement extends BaseHTMLElement {
  connectedCallback() {
    if (this._sourceContent === undefined) {
      this._sourceContent = this.innerHTML.trim();
    }
    this.render();
    this.bind();
  }

  attributeChangedCallback() {
    if (!this.isConnected) return;
    this.render();
    this.bind();
  }

  render() {}

  bind() {}
}

class UIButton extends GenUIElement {
  static observedAttributes = ['variant', 'size', 'disabled', 'full', 'type'];

  render() {
    const variant = attr(this, 'variant', 'primary');
    const size = attr(this, 'size', 'md');
    const disabled = has(this, 'disabled') ? 'disabled' : '';
    const full = has(this, 'full') ? ' gen-button--full' : '';
    const type = attr(this, 'type', 'button');
    this.innerHTML = `
      <button class="gen-button gen-button--${escapeHTML(variant)} gen-button--${escapeHTML(size)}${full}"
        type="${escapeHTML(type)}" ${disabled}>
        ${this._sourceContent || ''}
      </button>`;
  }
}

class UIIconButton extends GenUIElement {
  static observedAttributes = ['label', 'variant', 'size', 'disabled'];

  render() {
    const label = attr(this, 'label', 'Action');
    const variant = attr(this, 'variant', 'ghost');
    const size = attr(this, 'size', 'md');
    const disabled = has(this, 'disabled') ? 'disabled' : '';
    this.innerHTML = `
      <button class="gen-icon-button gen-icon-button--${escapeHTML(variant)} gen-icon-button--${escapeHTML(size)}"
        type="button" aria-label="${escapeHTML(label)}" title="${escapeHTML(label)}" ${disabled}>
        ${this._sourceContent || ''}
      </button>`;
  }
}

class UICard extends GenUIElement {
  static observedAttributes = ['heading', 'subheading', 'elevated', 'interactive'];

  render() {
    const heading = attr(this, 'heading');
    const subheading = attr(this, 'subheading');
    const elevated = has(this, 'elevated') ? ' gen-card--elevated' : '';
    const interactive = has(this, 'interactive') ? ' gen-card--interactive' : '';
    const role = has(this, 'interactive') ? 'button' : 'group';
    const tabindex = has(this, 'interactive') ? 'tabindex="0"' : '';
    this.innerHTML = `
      <section class="gen-card${elevated}${interactive}" role="${role}" ${tabindex}>
        ${
          heading || subheading
            ? `<header class="gen-card__header">
                ${heading ? `<h3 class="gen-card__title">${escapeHTML(heading)}</h3>` : ''}
                ${subheading ? `<p class="gen-card__subtitle">${escapeHTML(subheading)}</p>` : ''}
              </header>`
            : ''
        }
        <div class="gen-card__body">${this._sourceContent || ''}</div>
      </section>`;
  }
}

class UITextInput extends GenUIElement {
  static observedAttributes = ['label', 'value', 'placeholder', 'type', 'helper', 'error', 'disabled', 'name'];

  render() {
    const label = attr(this, 'label');
    const value = attr(this, 'value');
    const placeholder = attr(this, 'placeholder');
    const type = attr(this, 'type', 'text');
    const helper = attr(this, 'helper');
    const error = attr(this, 'error');
    const name = attr(this, 'name');
    const disabled = has(this, 'disabled') ? 'disabled' : '';
    const id = `gen-input-${this._instanceId ?? (this._instanceId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2))}`;
    const describedBy = error ? `${id}-error` : helper ? `${id}-helper` : '';
    this.innerHTML = `
      <label class="gen-field">
        ${label ? `<span class="gen-field__label">${escapeHTML(label)}</span>` : ''}
        <input class="gen-input ${error ? 'gen-input--error' : ''}" id="${id}" type="${escapeHTML(type)}"
          value="${escapeHTML(value)}" placeholder="${escapeHTML(placeholder)}" name="${escapeHTML(name)}"
          ${describedBy ? `aria-describedby="${describedBy}"` : ''} ${error ? 'aria-invalid="true"' : ''} ${disabled}>
        ${
          error
            ? `<span class="gen-field__message gen-field__message--error" id="${id}-error">${escapeHTML(error)}</span>`
            : helper
              ? `<span class="gen-field__message" id="${id}-helper">${escapeHTML(helper)}</span>`
              : ''
        }
      </label>`;
  }

  get value() {
    return this.querySelector('input')?.value ?? '';
  }
}

class UITextarea extends GenUIElement {
  static observedAttributes = ['label', 'value', 'placeholder', 'rows', 'helper', 'error', 'disabled', 'name'];

  render() {
    const label = attr(this, 'label');
    const value = attr(this, 'value');
    const placeholder = attr(this, 'placeholder');
    const rows = Math.max(2, numberAttr(this, 'rows', 4));
    const helper = attr(this, 'helper');
    const error = attr(this, 'error');
    const name = attr(this, 'name');
    const disabled = has(this, 'disabled') ? 'disabled' : '';
    const id = `gen-textarea-${this._instanceId ?? (this._instanceId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2))}`;
    this.innerHTML = `
      <label class="gen-field">
        ${label ? `<span class="gen-field__label">${escapeHTML(label)}</span>` : ''}
        <textarea class="gen-textarea ${error ? 'gen-textarea--error' : ''}" id="${id}" rows="${rows}"
          placeholder="${escapeHTML(placeholder)}" name="${escapeHTML(name)}"
          ${error ? 'aria-invalid="true"' : ''} ${disabled}>${escapeHTML(value)}</textarea>
        ${
          error
            ? `<span class="gen-field__message gen-field__message--error">${escapeHTML(error)}</span>`
            : helper
              ? `<span class="gen-field__message">${escapeHTML(helper)}</span>`
              : ''
        }
      </label>`;
  }

  get value() {
    return this.querySelector('textarea')?.value ?? '';
  }
}

class UISelect extends GenUIElement {
  static observedAttributes = ['label', 'options', 'value', 'placeholder', 'error', 'disabled', 'name'];

  render() {
    const label = attr(this, 'label');
    const value = attr(this, 'value');
    const placeholder = attr(this, 'placeholder', 'Select an option');
    const error = attr(this, 'error');
    const name = attr(this, 'name');
    const disabled = has(this, 'disabled') ? 'disabled' : '';
    const options = parseItems(this, 'options');
    const optionHTML = options
      .map((option) => {
        const optionValue = String(option.value ?? option.label ?? '');
        const selected = optionValue === value ? 'selected' : '';
        return `<option value="${escapeHTML(optionValue)}" ${selected}>${escapeHTML(option.label ?? optionValue)}</option>`;
      })
      .join('');
    this.innerHTML = `
      <label class="gen-field">
        ${label ? `<span class="gen-field__label">${escapeHTML(label)}</span>` : ''}
        <span class="gen-select-wrap">
          <select class="gen-select ${error ? 'gen-select--error' : ''}" name="${escapeHTML(name)}"
            ${error ? 'aria-invalid="true"' : ''} ${disabled}>
            <option value="" ${value ? '' : 'selected'} disabled>${escapeHTML(placeholder)}</option>
            ${optionHTML}
          </select>
        </span>
        ${error ? `<span class="gen-field__message gen-field__message--error">${escapeHTML(error)}</span>` : ''}
      </label>`;
  }

  get value() {
    return this.querySelector('select')?.value ?? '';
  }
}

class UICheckbox extends GenUIElement {
  static observedAttributes = ['label', 'checked', 'disabled', 'name', 'value'];

  render() {
    const label = attr(this, 'label', this._sourceContent || '');
    const checked = has(this, 'checked') ? 'checked' : '';
    const disabled = has(this, 'disabled') ? 'disabled' : '';
    const name = attr(this, 'name');
    const value = attr(this, 'value', 'on');
    this.innerHTML = `
      <label class="gen-choice">
        <input class="gen-checkbox" type="checkbox" name="${escapeHTML(name)}" value="${escapeHTML(value)}" ${checked} ${disabled}>
        <span class="gen-choice__indicator" aria-hidden="true"></span>
        <span class="gen-choice__label">${escapeHTML(label)}</span>
      </label>`;
  }

  get checked() {
    return Boolean(this.querySelector('input')?.checked);
  }
}

class UIRadio extends GenUIElement {
  static observedAttributes = ['label', 'checked', 'disabled', 'name', 'value'];

  render() {
    const label = attr(this, 'label', this._sourceContent || '');
    const checked = has(this, 'checked') ? 'checked' : '';
    const disabled = has(this, 'disabled') ? 'disabled' : '';
    const name = attr(this, 'name');
    const value = attr(this, 'value');
    this.innerHTML = `
      <label class="gen-choice">
        <input class="gen-radio" type="radio" name="${escapeHTML(name)}" value="${escapeHTML(value)}" ${checked} ${disabled}>
        <span class="gen-choice__indicator gen-choice__indicator--radio" aria-hidden="true"></span>
        <span class="gen-choice__label">${escapeHTML(label)}</span>
      </label>`;
  }

  get checked() {
    return Boolean(this.querySelector('input')?.checked);
  }
}

class UIToggle extends GenUIElement {
  static observedAttributes = ['label', 'checked', 'disabled', 'name'];

  render() {
    const label = attr(this, 'label', this._sourceContent || '');
    const checked = has(this, 'checked') ? 'checked' : '';
    const disabled = has(this, 'disabled') ? 'disabled' : '';
    const name = attr(this, 'name');
    this.innerHTML = `
      <label class="gen-toggle">
        <input class="gen-toggle__input" type="checkbox" role="switch" name="${escapeHTML(name)}" ${checked} ${disabled}>
        <span class="gen-toggle__track" aria-hidden="true"><span class="gen-toggle__thumb"></span></span>
        <span class="gen-toggle__label">${escapeHTML(label)}</span>
      </label>`;
  }

  get checked() {
    return Boolean(this.querySelector('input')?.checked);
  }
}

class UISearch extends GenUIElement {
  static observedAttributes = ['label', 'value', 'placeholder', 'disabled'];

  render() {
    const label = attr(this, 'label', 'Search');
    const value = attr(this, 'value');
    const placeholder = attr(this, 'placeholder', 'Search');
    const disabled = has(this, 'disabled') ? 'disabled' : '';
    this.innerHTML = `
      <label class="gen-search">
        <span class="gen-visually-hidden">${escapeHTML(label)}</span>
        <span class="gen-search__icon" aria-hidden="true">⌕</span>
        <input class="gen-search__input" type="search" value="${escapeHTML(value)}"
          placeholder="${escapeHTML(placeholder)}" ${disabled}>
      </label>`;
  }

  get value() {
    return this.querySelector('input')?.value ?? '';
  }
}

class UITag extends GenUIElement {
  static observedAttributes = ['kind', 'size', 'dismissible'];

  render() {
    const kind = attr(this, 'kind', 'neutral');
    const size = attr(this, 'size', 'md');
    const dismissible = has(this, 'dismissible');
    this.innerHTML = `
      <span class="gen-tag gen-tag--${escapeHTML(kind)} gen-tag--${escapeHTML(size)}">
        <span>${this._sourceContent || ''}</span>
        ${dismissible ? '<button class="gen-tag__dismiss" type="button" aria-label="Remove">×</button>' : ''}
      </span>`;
  }

  bind() {
    this.querySelector('.gen-tag__dismiss')?.addEventListener('click', () => emit(this, 'dismiss'));
  }
}

class UIAlert extends GenUIElement {
  static observedAttributes = ['kind', 'title', 'dismissible'];

  render() {
    const kind = attr(this, 'kind', 'info');
    const title = attr(this, 'title');
    const dismissible = has(this, 'dismissible');
    this.innerHTML = `
      <div class="gen-alert gen-alert--${escapeHTML(kind)}" role="${kind === 'danger' ? 'alert' : 'status'}">
        <div class="gen-alert__content">
          ${title ? `<strong class="gen-alert__title">${escapeHTML(title)}</strong>` : ''}
          <div class="gen-alert__body">${this._sourceContent || ''}</div>
        </div>
        ${dismissible ? '<button class="gen-alert__dismiss" type="button" aria-label="Dismiss">×</button>' : ''}
      </div>`;
  }

  bind() {
    this.querySelector('.gen-alert__dismiss')?.addEventListener('click', () => emit(this, 'dismiss'));
  }
}

class UITabs extends GenUIElement {
  static observedAttributes = ['items', 'active'];

  render() {
    const items = parseItems(this);
    const active = Math.min(Math.max(numberAttr(this, 'active', 0), 0), Math.max(items.length - 1, 0));
    this.innerHTML = `
      <div class="gen-tabs" role="tablist">
        ${items
          .map(
            (item, index) => `
              <button class="gen-tabs__tab ${index === active ? 'gen-tabs__tab--active' : ''}"
                type="button" role="tab" data-index="${index}"
                aria-selected="${index === active}">
                ${escapeHTML(item.label ?? item.value ?? `Tab ${index + 1}`)}
              </button>`,
          )
          .join('')}
      </div>`;
  }

  bind() {
    this.querySelectorAll('[data-index]').forEach((tab) => {
      tab.addEventListener('click', () => {
        const index = Number(tab.dataset.index);
        const items = parseItems(this);
        this.setAttribute('active', String(index));
        emit(this, 'change', { index, value: items[index]?.value ?? index });
      });
    });
  }
}

class UIAccordion extends GenUIElement {
  static observedAttributes = ['items', 'multiple'];

  render() {
    const items = parseItems(this);
    const multiple = has(this, 'multiple');
    const openSet = this._openSet ?? new Set(items.map((item, index) => (item.open ? index : -1)).filter((index) => index >= 0));
    this._openSet = openSet;
    this.innerHTML = `
      <div class="gen-accordion" data-multiple="${multiple}">
        ${items
          .map((item, index) => {
            const open = openSet.has(index);
            return `
              <section class="gen-accordion__item">
                <button class="gen-accordion__trigger" type="button" data-index="${index}" aria-expanded="${open}">
                  <span>${escapeHTML(item.title ?? `Section ${index + 1}`)}</span>
                  <span aria-hidden="true">${open ? '−' : '+'}</span>
                </button>
                <div class="gen-accordion__panel" ${open ? '' : 'hidden'}>${escapeHTML(item.content ?? '')}</div>
              </section>`;
          })
          .join('')}
      </div>`;
  }

  bind() {
    this.querySelectorAll('.gen-accordion__trigger').forEach((button) => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.index);
        const open = !this._openSet.has(index);
        if (!has(this, 'multiple')) this._openSet.clear();
        if (open) this._openSet.add(index);
        else this._openSet.delete(index);
        this.render();
        this.bind();
        emit(this, 'toggle', { index, open });
      });
    });
  }
}

class UIModal extends GenUIElement {
  static observedAttributes = ['heading', 'open', 'size', 'dismissible'];

  render() {
    if (!has(this, 'open')) {
      this.innerHTML = '';
      return;
    }
    const heading = attr(this, 'heading', 'Dialog');
    const size = attr(this, 'size', 'md');
    const dismissible = !this.hasAttribute('dismissible') || attr(this, 'dismissible') !== 'false';
    this.innerHTML = `
      <div class="gen-modal" role="presentation">
        <button class="gen-modal__scrim" type="button" aria-label="Close dialog" ${dismissible ? '' : 'disabled'}></button>
        <section class="gen-modal__dialog gen-modal__dialog--${escapeHTML(size)}"
          role="dialog" aria-modal="true" aria-labelledby="gen-modal-title">
          <header class="gen-modal__header">
            <h2 class="gen-modal__title" id="gen-modal-title">${escapeHTML(heading)}</h2>
            ${dismissible ? '<button class="gen-modal__close" type="button" aria-label="Close">×</button>' : ''}
          </header>
          <div class="gen-modal__body">${this._sourceContent || ''}</div>
        </section>
      </div>`;
  }

  bind() {
    const dismissible = !this.hasAttribute('dismissible') || attr(this, 'dismissible') !== 'false';
    const close = () => {
      if (!dismissible) return;
      this.removeAttribute('open');
      emit(this, 'close');
    };

    this.querySelector('.gen-modal__close')?.addEventListener('click', close);
    this.querySelector('.gen-modal__scrim')?.addEventListener('click', close);

    if (!this._keyHandler) {
      this._keyHandler = (event) => {
        if (event.key === 'Escape' && has(this, 'open')) close();
      };
      document.addEventListener('keydown', this._keyHandler);
    }

    queueMicrotask(() => this.querySelector('.gen-modal__close, button, input, select, textarea, [tabindex="0"]')?.focus());
  }

  disconnectedCallback() {
    if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
    this._keyHandler = null;
  }
}

class UITooltip extends GenUIElement {
  static observedAttributes = ['label', 'position'];

  render() {
    const label = attr(this, 'label');
    const position = attr(this, 'position', 'top');
    this.innerHTML = `
      <span class="gen-tooltip gen-tooltip--${escapeHTML(position)}" tabindex="0">
        <span class="gen-tooltip__target">${this._sourceContent || ''}</span>
        <span class="gen-tooltip__bubble" role="tooltip">${escapeHTML(label)}</span>
      </span>`;
  }
}

class UIPagination extends GenUIElement {
  static observedAttributes = ['page', 'page-size', 'total'];

  render() {
    const pageSize = Math.max(1, numberAttr(this, 'page-size', 10));
    const total = Math.max(0, numberAttr(this, 'total', 0));
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(numberAttr(this, 'page', 1), 1), pages);
    const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);
    this.innerHTML = `
      <nav class="gen-pagination" aria-label="Pagination">
        <span class="gen-pagination__summary">${start}–${end} of ${total}</span>
        <div class="gen-pagination__controls">
          <button class="gen-pagination__button" type="button" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''} aria-label="Previous page">←</button>
          <span class="gen-pagination__page">Page ${page} of ${pages}</span>
          <button class="gen-pagination__button" type="button" data-page="${page + 1}" ${page >= pages ? 'disabled' : ''} aria-label="Next page">→</button>
        </div>
      </nav>`;
  }

  bind() {
    this.querySelectorAll('[data-page]').forEach((button) => {
      button.addEventListener('click', () => {
        const page = Number(button.dataset.page);
        if (button.disabled) return;
        this.setAttribute('page', String(page));
        emit(this, 'change', { page, pageSize: numberAttr(this, 'page-size', 10) });
      });
    });
  }
}

class UIProgress extends GenUIElement {
  static observedAttributes = ['value', 'label'];

  render() {
    const value = Math.min(Math.max(numberAttr(this, 'value', 0), 0), 100);
    const label = attr(this, 'label', 'Progress');
    this.innerHTML = `
      <div class="gen-progress">
        <div class="gen-progress__meta">
          <span>${escapeHTML(label)}</span>
          <span>${value}%</span>
        </div>
        <div class="gen-progress__track" role="progressbar" aria-label="${escapeHTML(label)}"
          aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}">
          <span class="gen-progress__bar" style="width:${value}%"></span>
        </div>
      </div>`;
  }
}

class UISkeleton extends GenUIElement {
  static observedAttributes = ['type', 'lines'];

  render() {
    const type = attr(this, 'type', 'text');
    const lines = Math.min(Math.max(numberAttr(this, 'lines', type === 'text' ? 3 : 1), 1), 8);
    this.innerHTML = `
      <div class="gen-skeleton gen-skeleton--${escapeHTML(type)}" aria-hidden="true">
        ${Array.from({ length: lines }, (_, index) => `<span class="gen-skeleton__line" style="--line:${index}"></span>`).join('')}
      </div>`;
  }
}

class UIToast extends GenUIElement {
  static observedAttributes = ['kind', 'message', 'duration'];

  render() {
    const kind = attr(this, 'kind', 'info');
    const message = attr(this, 'message', this._sourceContent || '');
    this.innerHTML = `
      <div class="gen-toast gen-toast--${escapeHTML(kind)}" role="${kind === 'danger' ? 'alert' : 'status'}">
        <span class="gen-toast__message">${escapeHTML(message)}</span>
        <button class="gen-toast__dismiss" type="button" aria-label="Dismiss">×</button>
      </div>`;
  }

  bind() {
    clearTimeout(this._timer);
    const dismiss = () => emit(this, 'dismiss');
    this.querySelector('.gen-toast__dismiss')?.addEventListener('click', dismiss);

    const duration = Math.max(0, numberAttr(this, 'duration', 4000));
    if (duration > 0) this._timer = setTimeout(dismiss, duration);
  }

  disconnectedCallback() {
    clearTimeout(this._timer);
  }
}

const definitions = [
  ['ui-button', UIButton],
  ['ui-icon-button', UIIconButton],
  ['ui-card', UICard],
  ['ui-text-input', UITextInput],
  ['ui-textarea', UITextarea],
  ['ui-select', UISelect],
  ['ui-checkbox', UICheckbox],
  ['ui-radio', UIRadio],
  ['ui-toggle', UIToggle],
  ['ui-search', UISearch],
  ['ui-tag', UITag],
  ['ui-alert', UIAlert],
  ['ui-tabs', UITabs],
  ['ui-accordion', UIAccordion],
  ['ui-modal', UIModal],
  ['ui-tooltip', UITooltip],
  ['ui-pagination', UIPagination],
  ['ui-progress', UIProgress],
  ['ui-skeleton', UISkeleton],
  ['ui-toast', UIToast],
];

/**
 * Registers all GenUI custom elements.
 * Safe to call more than once.
 */
export function registerGenUIComponents() {
  if (!globalThis.customElements) return;
  definitions.forEach(([name, constructor]) => {
    if (!customElements.get(name)) customElements.define(name, constructor);
  });
}
