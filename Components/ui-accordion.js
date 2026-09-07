/**
 * <ui-accordion label="Shipping and returns" open>Free returns within 30 days.</ui-accordion>
 * Progressive disclosure for optional detail. Fires toggle with detail.open.
 */
class UIAccordion extends HTMLElement {
  static get observedAttributes(){return ["label","open","disabled"]}
  constructor(){super();this.attachShadow({mode:"open"})} connectedCallback(){this.render()} attributeChangedCallback(){this.render()}
  render(){const label=this.getAttribute("label")||"Shipping and returns",open=this.hasAttribute("open"),disabled=this.hasAttribute("disabled");this.shadowRoot.innerHTML=`<style>:host{display:block;font-family:var(--font-family-base,system-ui);color:var(--color-on-surface,#161c27)}.item{border:1px solid var(--color-outline-variant,#c6c4c0);border-radius:var(--radius-sm,8px);overflow:hidden}button{display:flex;width:100%;justify-content:space-between;min-height:44px;padding:0 16px;border:0;background:var(--color-surface,#fff);font:var(--label-m,500 14px/20px system-ui);cursor:pointer}.panel{padding:12px 16px;border-top:1px solid var(--color-outline-variant,#c6c4c0);font:var(--body-m,400 14px/20px system-ui)}</style><div class="item"><button ${disabled?"disabled":""} aria-expanded="${open}"><span>${label}</span><span>${open?"−":"+"}</span></button>${open?'<div class="panel"><slot>Free returns within 30 days.</slot></div>':''}</div>`;this.shadowRoot.querySelector("button").addEventListener("click",()=>{this.toggleAttribute("open");this.dispatchEvent(new CustomEvent("toggle",{detail:{open:!open},bubbles:true,composed:true}))})}}
customElements.define("ui-accordion",UIAccordion);export default UIAccordion;
