/**
 * <ui-toggle label="Enable notifications" checked></ui-toggle>
 * Immediate binary setting. Fires change with detail.checked.
 */
class UIToggle extends HTMLElement {
  static get observedAttributes(){return ["label","checked","disabled","name"]}
  constructor(){super();this.attachShadow({mode:"open"})} connectedCallback(){this.render()} attributeChangedCallback(){this.render()}
  render(){const label=this.getAttribute("label")||"Enable notifications",checked=this.hasAttribute("checked"),disabled=this.hasAttribute("disabled");this.shadowRoot.innerHTML=`<style>:host{display:inline-block;font-family:var(--font-family-base,system-ui);color:var(--color-on-surface,#161c27)}label{display:flex;align-items:center;gap:10px;font:var(--body-m,400 14px/20px system-ui)}input{position:absolute;opacity:0}.track{width:42px;height:24px;padding:2px;border-radius:999px;background:var(--color-outline,#757775);box-sizing:border-box;transition:.12s}.thumb{display:block;width:20px;height:20px;border-radius:50%;background:#fff;transition:.12s}input:checked+.track{background:var(--color-primary,#6c43c6)}input:checked+.track .thumb{transform:translateX(18px)}</style><label><input type="checkbox" role="switch" ${checked?"checked":""} ${disabled?"disabled":""}><span class="track"><span class="thumb"></span></span><span>${label}</span></label>`;this.shadowRoot.querySelector("input").addEventListener("change",e=>this.dispatchEvent(new CustomEvent("change",{detail:{checked:e.target.checked},bubbles:true,composed:true})))}}
customElements.define("ui-toggle",UIToggle);export default UIToggle;
