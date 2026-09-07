/**
 * <ui-textarea label="Notes" placeholder="Add details" rows="4"></ui-textarea>
 * Multi-line text entry. Fires input with detail.value.
 */
class UITextarea extends HTMLElement {
  static get observedAttributes() { return ["label", "placeholder", "value", "rows", "helper", "error", "disabled", "name"]; }
  constructor(){super();this.attachShadow({mode:"open"})}
  connectedCallback(){this.render()} attributeChangedCallback(){this.render()}
  render(){const label=this.getAttribute("label")||"Notes",placeholder=this.getAttribute("placeholder")||"Add details",value=this.getAttribute("value")||"",rows=this.getAttribute("rows")||"4",error=this.getAttribute("error")||"",helper=this.getAttribute("helper")||"",disabled=this.hasAttribute("disabled");this.shadowRoot.innerHTML=`<style>:host{display:block;font-family:var(--font-family-base,system-ui);color:var(--color-on-surface,#161c27)}label{display:grid;gap:4px;font:var(--label-m,500 14px/20px system-ui)}textarea{box-sizing:border-box;width:100%;padding:10px 12px;border:1px solid ${error?"var(--color-error,#cc1730)":"var(--color-outline,#757775)"};border-radius:var(--radius-sm,8px);font:var(--body-m,400 14px/20px system-ui);resize:vertical}.note{font:var(--body-s,400 12px/16px system-ui);color:${error?"var(--color-error,#cc1730)":"var(--color-on-surface-variant,#5f5e60)"}}</style><label>${label}<textarea rows="${rows}" placeholder="${placeholder}" ${disabled?"disabled":""}>${value}</textarea>${error||helper?`<span class="note">${error||helper}</span>`:""}</label>`;this.shadowRoot.querySelector("textarea").addEventListener("input",e=>this.dispatchEvent(new CustomEvent("input",{detail:{value:e.target.value},bubbles:true,composed:true})))}}
customElements.define("ui-textarea",UITextarea);export default UITextarea;
