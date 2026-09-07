/**
 * <ui-radio name="plan" value="pro" label="Pro plan" checked></ui-radio>
 * One choice within a named group. Fires change with detail.value.
 */
class UIRadio extends HTMLElement {
  static get observedAttributes(){return ["name","value","label","checked","disabled"]}
  constructor(){super();this.attachShadow({mode:"open"})} connectedCallback(){this.render()} attributeChangedCallback(){this.render()}
  render(){const label=this.getAttribute("label")||"Pro plan",name=this.getAttribute("name")||"plan",value=this.getAttribute("value")||"pro",checked=this.hasAttribute("checked"),disabled=this.hasAttribute("disabled");this.shadowRoot.innerHTML=`<style>:host{display:inline-block;font-family:var(--font-family-base,system-ui);color:var(--color-on-surface,#161c27)}label{display:inline-flex;align-items:center;gap:8px;font:var(--body-m,400 14px/20px system-ui);cursor:pointer}input{width:18px;height:18px;accent-color:var(--color-primary,#6c43c6)}</style><label><input type="radio" name="${name}" value="${value}" ${checked?"checked":""} ${disabled?"disabled":""}><span>${label}</span></label>`;this.shadowRoot.querySelector("input").addEventListener("change",()=>this.dispatchEvent(new CustomEvent("change",{detail:{value},bubbles:true,composed:true})))}}
customElements.define("ui-radio",UIRadio);export default UIRadio;
