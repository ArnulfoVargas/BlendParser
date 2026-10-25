import {loadRelease} from './releases.js';
loadRelease();
const index=document.querySelector('.doc-index');
if(matchMedia('(max-width:700px)').matches)index.open=false;
const search=document.querySelector('#doc-search');
const sections=[...document.querySelectorAll('[data-doc-section]')];
const links=[...index.querySelectorAll('a')];
const status=document.querySelector('#doc-search-status');
const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function filter(){
 const query=normalize(search.value.trim());let count=0;
 for(const section of sections){
  section.hidden=!!query&&!normalize(section.textContent).includes(query);
  if(!section.hidden)count++;
  const link=links.find(a=>a.hash==='#'+section.id);if(link)link.hidden=section.hidden;
 }
 status.textContent=query?(document.documentElement.lang==='en'?`${count} of ${sections.length} sections.`:`${count} de ${sections.length} secciones.`):'';
 document.querySelector('.doc-empty').hidden=count!==0;
}
search.addEventListener('input',filter);
search.addEventListener('keydown',event=>{if(event.key==='Escape'){search.value='';filter();}});
for(const link of links)link.addEventListener('click',()=>{if(matchMedia('(max-width:700px)').matches)index.open=false;});
const observer=new IntersectionObserver(entries=>{
 for(const entry of entries)if(entry.isIntersecting){
  links.forEach(link=>{if(link.hash==='#'+entry.target.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
 }
},{rootMargin:'-15% 0px -60% 0px'});
sections.forEach(section=>observer.observe(section));
