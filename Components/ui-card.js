/**
 * <ui-card heading="Project status" subheading="Updated today">Three tasks remain.</ui-card>
 * Groups related content in one surface.
 */
class UICard extends HTMLElement {
  static get observedAttributes() { return ["heading", "subheading", "elevated", "interactive"]; }
  constructor() { super(); this.attachShadow({ mode: "open" }); }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { this.render(); }
  render() {
    const heading = this.getAttribute("heading") || "Project status";
    const subheading = this.getAttribute("subheading") || "Updated today";
    const elevated = this.hasAttribute("elevated");
    this.shadowRoot.innerHTML = `<style>
      :host{display:block;font-family:var(--font-family-base,system-ui);color:var(--color-on-surface,#161c27)}
      .card{background:var(--color-surface,#fff);border:1px solid var(--color-outline-variant,#c6c4c0);border-radius:var(--radius-lg,16px);overflow:hidden;${elevated ? "box-shadow:var(--elevation-2,0 4px 12px #0002)" : ""}}
      header{padding:16px 20px;border-bottom:1px solid var(--color-outline-variant,#c6c4c0)}h3{margin:0;font:var(--title-m,500 18px/24px system-ui)}p{margin:2px 0 0;color:var(--color-on-surface-variant,#5f5e60);font:var(--body-s,400 12px/16px system-ui)}.body{padding:20px;font:var(--body-m,400 14px/20px system-ui)}
    </style><section class="card"><header><h3>${heading}</h3><p>${subheading}</p></header><div class="body"><slot>Three tasks remain.</slot></div></section>`;
  }
}
customElements.define("ui-card", UICard);
export default UICard;
