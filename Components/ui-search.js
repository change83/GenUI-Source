/**
 * <ui-search placeholder="Search projects"></ui-search>
 * Search or filter input. Fires search with detail.query.
 */
class UISearch extends HTMLElement {
  static get observedAttributes(){return ["placeholder","value","disabled","label"]}
  constructor(){super();this.attachShadow({mode:"open"})} connectedCallback(){this.render()} attributeChangedCallback(){this.render()}
  render(){const placeholder=this.getAttribute("placeholder")||"Search projects",value=this.getAttribute("value")||"",disabled=this.hasAttribute("disabled");this.shadowRoot.innerHTML=`<style>:host{display:block;font-family:var(--font-family-base,system-ui)}.box{display:flex;align-items:center;gap:8px;min-height:40px;padding:0 12px;border:1px solid var(--color-outline-variant,#c6c4c0);border-radius:var(--radius-sm,8px);background:var(--color-surface-container,#f5f3f1)}input{flex:1;min-width:0;border:0;background:transparent;outline:0;font:var(--body-m,400 14px/20px system-ui);color:var(--color-on-surface,#161c27)}</style><div class="box"><span aria-hidden="true">⌕</span><input type="search" value="${value}" placeholder="${placeholder}" ${disabled?"disabled":""}></div>`;this.shadowRoot.querySelector("input").addEventListener("input",e=>this.dispatchEvent(new CustomEvent("search",{detail:{query:e.target.value},bubbles:true,composed:true})))}}
customElements.define("ui-search",UISearch);export default UISearch;
