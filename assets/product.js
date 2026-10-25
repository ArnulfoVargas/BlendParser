const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const animate=(element)=>{if(!reduced.matches)element.animate([{opacity:.2,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,easing:'ease-out'});};
// A closing answer remains rendered until its grid transition completes.
for(const group of document.querySelectorAll('[data-accordion]')){
 group.classList.add('faq-ready');
 const items=[...group.querySelectorAll('details')];
 const close=(item)=>{
  item.classList.remove('is-open');item.querySelector('summary').setAttribute('aria-expanded','false');
  const finish=()=>{if(!item.classList.contains('is-open'))item.open=false;};
  if(reduced.matches)finish();else setTimeout(finish,340);
 };
 items.forEach((item,i)=>{
  const summary=item.querySelector('summary'),answer=item.querySelector('.faq-answer');
  answer.id=`faq-answer-${i}`;summary.setAttribute('aria-controls',answer.id);summary.setAttribute('aria-expanded','false');
  summary.addEventListener('click',event=>{
   event.preventDefault();
   if(item.classList.contains('is-open')){close(item);return;}
   items.filter(other=>other!==item).forEach(close);
   item.open=true;
   // Resolve the collapsed track before transitioning to the expanded track.
   answer.getBoundingClientRect();
   item.classList.add('is-open');summary.setAttribute('aria-expanded','true');
  });
 });
}
const featureButtons=[...document.querySelectorAll('[data-feature]')];
const featurePanels=[...document.querySelectorAll('[data-feature-panel]')];
function selectFeature(key,animatePanel=true){
 featureButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.feature===key)));
 featurePanels.forEach(panel=>{panel.hidden=panel.dataset.featurePanel!==key;if(!panel.hidden&&animatePanel)animate(panel);});
}
featureButtons.forEach((button,index)=>{
 button.addEventListener('click',()=>selectFeature(button.dataset.feature));
 button.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  const next=event.key==='Home'?0:event.key==='End'?featureButtons.length-1:(index+(event.key==='ArrowRight'?1:-1)+featureButtons.length)%featureButtons.length;
  featureButtons[next].focus();selectFeature(featureButtons[next].dataset.feature);
 });
});
selectFeature('color',false);
import {loadRelease} from './releases.js';
loadRelease();
