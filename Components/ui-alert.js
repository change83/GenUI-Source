/**
 * <ui-alert variant="success" title="Saved" dismissible>Your changes are live.</ui-alert>
 * Persistent contextual feedback. Variants: info, success, warning, danger.
 */
class UIAlert extends HTMLElement {
  static get observedAttributes(){return ["variant","title","dismissible"]}
  constructor(){super();this.attachShadow({mode:"open"})} connectedCallback(){this.render()} attributeChangedCallback(){this.render()}
  render(){const variant=this.getAttribute("variant")||"info",title=this.getAttribute("title")||"Saved",dismissible=this.hasAttribute("dismissible");const colors={info:["#dce7ff","#3571fe"],success:["#c3f5c8","#1c8843"],warning:["#ffe9a3","#8c6d00"],danger:["#ffd9dc","#cc1730"]}[variant]||["#dce7ff","#3571fe"];this.shadowRoot.innerHTML=`<style>:host{display:block;font-family:var(--font-family-base,system-ui);color:var(--color-on-surface,#161c27)}.alert{display:flex;justify-content:space-between;gap:12px;padding:12px 16px;border-left:4px solid ${colors[1]};border-radius:var(--radius-sm,8px);background:${colors[0]}}strong{display:block;font:var(--label-m,700 14px/20px system-ui)}.body{font:var(--body-m,400 14px/20px system-ui)}button{border:0;background:transparent;font-size:18px;cursor:pointer}</style><div class="alert" role="status"><div><strong>${title}</strong><div class="body"><slot>Your changes are live.</slot></div></div>${dismissible?'<button aria-label="Dismiss">×</button>':''}</div>`;this.shadowRoot.querySelector("button")?.addEventListener("click",()=>this.dispatchEvent(new CustomEvent("dismiss",{bubbles:true,composed:true})))}}
customElements.define("ui-alert",UIAlert);export default UIAlert;
