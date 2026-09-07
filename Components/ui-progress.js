/**
 * <ui-progress value="68" label="Uploading"></ui-progress>
 * Known completion progress from 0 to 100.
 */
class UIProgress extends HTMLElement {
  static get observedAttributes(){return ["value","label","variant"]}
  constructor(){super();this.attachShadow({mode:"open"})} connectedCallback(){this.render()} attributeChangedCallback(){this.render()}
  render(){const value=Math.min(100,Math.max(0,Number(this.getAttribute("value")||68))),label=this.getAttribute("label")||"Uploading";this.shadowRoot.innerHTML=`<style>:host{display:block;font-family:var(--font-family-base,system-ui);color:var(--color-on-surface,#161c27)}.meta{display:flex;justify-content:space-between;margin-bottom:6px;font:var(--body-s,400 12px/16px system-ui)}.track{height:8px;border-radius:999px;background:var(--color-surface-container-highest,#e9e7e3);overflow:hidden}.bar{height:100%;background:var(--color-primary,#6c43c6);border-radius:999px}</style><div class="meta"><span>${label}</span><span>${value}%</span></div><div class="track" role="progressbar" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100"><div class="bar" style="width:${value}%"></div></div>`}}
customElements.define("ui-progress",UIProgress);export default UIProgress;
