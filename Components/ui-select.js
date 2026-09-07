/**
 * <ui-select label="Status" options="Active,Paused,Archived" value="Active"></ui-select>
 * Choose one item from a compact known list. Fires change with detail.value.
 */
class UISelect extends HTMLElement {
  static get observedAttributes(){return ["label","options","value","disabled","name"]}
  constructor(){super();this.attachShadow({mode:"open"})} connectedCallback(){this.render()} attributeChangedCallback(){this.render()}
  render(){const label=this.getAttribute("label")||"Status",options=(this.getAttribute("options")||"Active,Paused,Archived").split(",").map(v=>v.trim()).filter(Boolean),value=this.getAttribute("value")||options[0]||"",disabled=this.hasAttribute("disabled");this.shadowRoot.innerHTML=`<style>:host{display:block;font-family:var(--font-family-base,system-ui);color:var(--color-on-surface,#161c27)}label{display:grid;gap:4px;font:var(--label-m,500 14px/20px system-ui)}select{width:100%;min-height:40px;padding:0 12px;border:1px solid var(--color-outline,#757775);border-radius:var(--radius-sm,8px);background:var(--color-surface,#fff);color:inherit;font:var(--body-m,400 14px/20px system-ui)}</style><label>${label}<select ${disabled?"disabled":""}>${options.map(o=>`<option ${o===value?"selected":""}>${o}</option>`).join("")}</select></label>`;this.shadowRoot.querySelector("select").addEventListener("change",e=>this.dispatchEvent(new CustomEvent("change",{detail:{value:e.target.value},bubbles:true,composed:true})))}}
customElements.define("ui-select",UISelect);export default UISelect;
