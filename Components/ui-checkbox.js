/**
 * <ui-checkbox label="Subscribe to updates" checked></ui-checkbox>
 * Independent selection. Fires change with detail.checked.
 */
class UICheckbox extends HTMLElement {
  static get observedAttributes(){return ["label","checked","disabled","name","value"]}
  constructor(){super();this.attachShadow({mode:"open"})} connectedCallback(){this.render()} attributeChangedCallback(){this.render()}
  render(){const label=this.getAttribute("label")||"Subscribe to updates",checked=this.hasAttribute("checked"),disabled=this.hasAttribute("disabled");this.shadowRoot.innerHTML=`<style>:host{display:inline-block;font-family:var(--font-family-base,system-ui);color:var(--color-on-surface,#161c27)}label{display:inline-flex;align-items:center;gap:8px;font:var(--body-m,400 14px/20px system-ui);cursor:pointer}input{width:18px;height:18px;accent-color:var(--color-primary,#6c43c6)}</style><label><input type="checkbox" ${checked?"checked":""} ${disabled?"disabled":""}><span>${label}</span></label>`;this.shadowRoot.querySelector("input").addEventListener("change",e=>this.dispatchEvent(new CustomEvent("change",{detail:{checked:e.target.checked},bubbles:true,composed:true})))}}
customElements.define("ui-checkbox",UICheckbox);export default UICheckbox;
