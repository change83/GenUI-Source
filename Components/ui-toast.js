/**
 * <ui-toast variant="success" message="Saved successfully"></ui-toast>
 * Brief non-blocking outcome. Fires dismiss.
 */
class UIToast extends HTMLElement {
  static get observedAttributes(){return ["variant","message","duration"]}
  constructor(){super();this.attachShadow({mode:"open"})} connectedCallback(){this.render()} attributeChangedCallback(){this.render()}
  render(){const variant=this.getAttribute("variant")||"success",message=this.getAttribute("message")||"Saved successfully";const accent={success:"#1c8843",warning:"#8c6d00",danger:"#cc1730",info:"#3571fe"}[variant]||"#3571fe";this.shadowRoot.innerHTML=`<style>:host{display:block;font-family:var(--font-family-base,system-ui);color:var(--color-on-surface,#161c27)}.toast{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 16px;border-left:4px solid ${accent};border-radius:var(--radius-sm,8px);background:var(--color-surface,#fff);box-shadow:var(--elevation-2,0 4px 12px #0002);font:var(--body-m,400 14px/20px system-ui)}button{border:0;background:transparent;font-size:18px;cursor:pointer}</style><div class="toast" role="status"><span>${message}</span><button aria-label="Dismiss">×</button></div>`;this.shadowRoot.querySelector("button").addEventListener("click",()=>this.dispatchEvent(new CustomEvent("dismiss",{bubbles:true,composed:true})))}}
customElements.define("ui-toast",UIToast);export default UIToast;
