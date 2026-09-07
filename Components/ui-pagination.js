/**
 * <ui-pagination page="2" total="8"></ui-pagination>
 * Page a known result set. Fires change with detail.page.
 */
class UIPagination extends HTMLElement {
  static get observedAttributes(){return ["page","total"]}
  constructor(){super();this.attachShadow({mode:"open"})} connectedCallback(){this.render()} attributeChangedCallback(){this.render()}
  render(){const page=Math.max(1,Number(this.getAttribute("page")||2)),total=Math.max(1,Number(this.getAttribute("total")||8));this.shadowRoot.innerHTML=`<style>:host{display:block;font-family:var(--font-family-base,system-ui)}nav{display:flex;align-items:center;gap:6px}button{min-width:34px;height:34px;border:1px solid var(--color-outline-variant,#c6c4c0);border-radius:var(--radius-sm,8px);background:var(--color-surface,#fff);font:var(--label-m,500 14px/20px system-ui)}.active{background:var(--color-primary,#6c43c6);color:#fff;border-color:var(--color-primary,#6c43c6)}</style><nav aria-label="Pagination">${Array.from({length:Math.min(total,7)},(_,i)=>i+1).map(p=>`<button class="${p===page?"active":""}" data-page="${p}">${p}</button>`).join("")}</nav>`;this.shadowRoot.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{const p=Number(b.dataset.page);this.setAttribute("page",p);this.dispatchEvent(new CustomEvent("change",{detail:{page:p},bubbles:true,composed:true}))}))}}
customElements.define("ui-pagination",UIPagination);export default UIPagination;
