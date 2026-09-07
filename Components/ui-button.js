/**
 * <ui-button variant="primary" size="md">Save changes</ui-button>
 * Action button. Variants: primary, secondary, ghost, danger. Sizes: sm, md, lg.
 */
class UIButton extends HTMLElement {
  static get observedAttributes() { return ["variant", "size", "disabled", "full", "type"]; }
  constructor() { super(); this.attachShadow({ mode: "open" }); }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { this.render(); }
  render() {
    const variant = this.getAttribute("variant") || "primary";
    const size = this.getAttribute("size") || "md";
    const disabled = this.hasAttribute("disabled");
    const type = this.getAttribute("type") || "button";
    this.shadowRoot.innerHTML = `<style>
      :host{display:inline-flex;font-family:var(--font-family-base,system-ui)}:host([full]){display:flex}
      button{width:100%;border:1px solid transparent;border-radius:var(--radius-sm,8px);font:var(--label-m,500 14px/20px system-ui);cursor:pointer;padding:0 16px;transition:.12s ease}
      .sm{min-height:32px}.md{min-height:40px}.lg{min-height:48px}.primary{background:var(--color-primary,#6c43c6);color:var(--color-on-primary,#fff)}
      .secondary{background:transparent;color:var(--color-primary,#6c43c6);border-color:var(--color-primary,#6c43c6)}.ghost{background:transparent;color:var(--color-primary,#6c43c6)}
      .danger{background:var(--color-error,#cc1730);color:var(--color-on-error,#fff)}button:disabled{opacity:.38;cursor:not-allowed}button:focus-visible{outline:2px solid var(--color-focus,#161c27);outline-offset:2px}
    </style><button class="${variant} ${size}" type="${type}" ${disabled ? "disabled" : ""}><slot>Button</slot></button>`;
  }
}
customElements.define("ui-button", UIButton);
export default UIButton;
