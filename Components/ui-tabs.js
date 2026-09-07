/**
 * <ui-tabs selected="0"></ui-tabs>
 * Switch between peer views. Uses labels attribute as comma-separated tab names.
 */
class UITabs extends HTMLElement {
  static get observedAttributes(){return ["labels","selected"]}
  constructor(){super();this.attachShadow({mode:"open"})} connectedCallback(){this.render()} attributeChangedCallback(){this.render()}
  render(){const labels=(this.getAttribute("labels")||"Overview,Activity,Details").split(",").map(v=>v.trim()),selected=Math.max(0,Number(this.getAttribute("selected")||0));this.shadowRoot.innerHTML=`<style>:host{display:block;font-family:var(--font-family-base,system-ui)}.tabs{display:flex;border-bottom:1px solid var(--color-outline-variant,#c6c4c0)}button{min-height:40px;padding:0 16px;border:0;border-bottom:2px solid transparent;background:transparent;color:var(--color-on-surface-variant,#5f5e60);font:var(--label-m,500 14px/20px system-ui);cursor:pointer}.active{border-bottom-color:var(--color-primary,#6c43c6);color:var(--color-on-surface,#161c27)}</style><div class="tabs" role="tablist">${labels.map((l,i)=>`<button class="${i===selected?"active":""}" data-index="${i}" role="tab" aria-selected="${i===selected}">${l}</button>`).join("")}</div>`;this.shadowRoot.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{const index=Number(b.dataset.index);this.setAttribute("selected",index);this.dispatchEvent(new CustomEvent("change",{detail:{index,label:labels[index]},bubbles:true,composed:true}))}))}}
customElements.define("ui-tabs",UITabs);export default UITabs;
