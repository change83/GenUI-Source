/**
 * <ui-text-input label="Project name" placeholder="Untitled project"></ui-text-input>
 * Single-line text entry. Fires input with detail.value.
 */
class UITextInput extends HTMLElement {
  static get observedAttributes() { return ["label", "placeholder", "type", "value", "helper", "error", "disabled", "name"]; }
  constructor() { super(); this.attachShadow({ mode: "open" }); }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { this.render(); }
  render() {
    const label=this.getAttribute("label")||"Project name", placeholder=this.getAttribute("placeholder")||"Untitled project", value=this.getAttribute("value")||"", helper=this.getAttribute("helper")||"", error=this.getAttribute("error")||"", disabled=this.hasAttribute("disabled"), type=this.getAttribute("type")||"text";
    this.shadowRoot.innerHTML=`<style>:host{display:block;font-family:var(--font-family-base,system-ui);color:var(--color-on-surface,#161c27)}label{display:grid;gap:4px;font:var(--label-m,500 14px/20px system-ui)}input{box-sizing:border-box;width:100%;min-height:40px;padding:0 12px;border:1px solid ${error?"var(--color-error,#cc1730)":"var(--color-outline,#757775)"};border-radius:var(--radius-sm,8px);background:var(--color-surface,#fff);font:var(--body-m,400 14px/20px system-ui)}input:focus{outline:2px solid var(--color-primary,#6c43c6);outline-offset:1px}.note{font:var(--body-s,400 12px/16px system-ui);color:${error?"var(--color-error,#cc1730)":"var(--color-on-surface-variant,#5f5e60)"}}</style><label>${label}<input type="${type}" value="${value}" placeholder="${placeholder}" ${disabled?"disabled":""}>${error||helper?`<span class="note">${error||helper}</span>`:""}</label>`;
    this.shadowRoot.querySelector("input").addEventListener("input",e=>this.dispatchEvent(new CustomEvent("input",{detail:{value:e.target.value},bubbles:true,composed:true})));
  }
}
customElements.define("ui-text-input", UITextInput);
export default UITextInput;
