/**
 * <ui-skeleton lines="3"></ui-skeleton>
 * Loading placeholder for unknown duration.
 */
class UISkeleton extends HTMLElement {
  static get observedAttributes(){return ["lines","width","height","circle"]}
  constructor(){super();this.attachShadow({mode:"open"})} connectedCallback(){this.render()} attributeChangedCallback(){this.render()}
  render(){const lines=Math.max(1,Math.min(6,Number(this.getAttribute("lines")||3)));this.shadowRoot.innerHTML=`<style>:host{display:block}.line{height:14px;margin:8px 0;border-radius:6px;background:linear-gradient(90deg,#e9e7e3 25%,#f5f3f1 37%,#e9e7e3 63%);background-size:400% 100%;animation:pulse 1.4s ease infinite}.line:last-child{width:72%}@keyframes pulse{0%{background-position:100% 0}100%{background-position:0 0}}</style>${Array.from({length:lines},()=>'<div class="line"></div>').join("")}`}}
customElements.define("ui-skeleton",UISkeleton);export default UISkeleton;
