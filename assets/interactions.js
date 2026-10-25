document.documentElement.classList.add('enhanced');
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
for(const group of document.querySelectorAll('[data-capture-switch]')) {
 const buttons=[...group.querySelectorAll('[data-shot]')];
 const image=group.querySelector('[data-capture-image]');
 const caption=group.querySelector('[data-capture-caption]');
 let active=Math.max(0,buttons.findIndex(button=>button.getAttribute('aria-pressed')==='true'));
 let request=0;
 function select(index) {
  const ticket=++request;
  active=index;
  const b=buttons[index];
  buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
  const next=new Image();
  next.onload=()=>{
   if(ticket!==request)return;
   let old;
   if(document.body.classList.contains('four')&&!reduceMotion.matches){
    old=image.cloneNode();old.removeAttribute('data-capture-image');old.alt='';old.setAttribute('aria-hidden','true');old.classList.add('outgoing-capture');image.parentElement.append(old);
   }
   image.src=next.src;image.alt=b.dataset.caption;
   image.closest('a').href=next.src;
   caption.textContent=b.dataset.caption;
   if(!reduceMotion.matches){
    if(old){
     old.animate([{opacity:1,transform:'translateX(0)'},{opacity:0,transform:'translateX(-28px)'}],{duration:420,easing:'ease-in-out'}).finished.then(()=>old.remove(),()=>old.remove());
     image.animate([{opacity:0,transform:'translateX(28px)'},{opacity:1,transform:'translateX(0)'}],{duration:500,easing:'cubic-bezier(.16,1,.3,1)'});
    }else image.animate([{opacity:.55},{opacity:1}],{duration:240,easing:'ease-out'});
   }
  };
  next.src=`assets/${b.dataset.shot}.png`;
 }
 buttons.forEach((b,i)=>b.addEventListener('click',()=>select(i)));
 group.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)||!buttons.includes(document.activeElement))return;
  e.preventDefault();
  const index=e.key==='Home'?0:e.key==='End'?buttons.length-1:(active+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
  buttons[index].focus();select(index);
 });
}
for(const comparison of document.querySelectorAll('[data-comparison]')) {
 const input=comparison.querySelector('input');
 const apply=()=>comparison.style.setProperty('--split',input.value+'%');
 input.addEventListener('input',apply);apply();
 const pictures=comparison.querySelector('.comparison-pictures');
 pictures.querySelectorAll('img').forEach(image=>image.draggable=false);
 const drag=event=>{
  const box=pictures.getBoundingClientRect();
  input.value=String(Math.round(Math.max(0,Math.min(100,(event.clientX-box.left)/box.width*100))));apply();
 };
 pictures.addEventListener('pointerdown',event=>{if(event.button!==0)return; event.preventDefault(); pictures.setPointerCapture(event.pointerId);drag(event);});
 pictures.addEventListener('pointermove',event=>{if(pictures.hasPointerCapture(event.pointerId))drag(event);});
 pictures.addEventListener('pointerup',event=>{if(pictures.hasPointerCapture(event.pointerId))pictures.releasePointerCapture(event.pointerId);});
}
const dialog=document.querySelector('.image-dialog');
let trigger=null;
for(const link of document.querySelectorAll('[data-lightbox]'))link.addEventListener('click',event=>{
 if(event.ctrlKey||event.metaKey||event.shiftKey||!dialog)return;
 event.preventDefault();trigger=link;
 dialog.querySelector('img').src=link.href;
 dialog.querySelector('img').alt=link.querySelector('img').alt;
 dialog.querySelector('p').textContent=link.closest('figure')?.querySelector('figcaption')?.textContent||link.querySelector('img').alt;
 dialog.showModal();
});
dialog?.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
dialog?.addEventListener('close',()=>trigger?.focus());
// A single entrance gives the product stage priority without hiding any content.
if(!reduceMotion.matches&&!document.body.classList.contains('four')) {
 const stage=document.querySelector('.capture-switch, .comparison');
 stage?.animate([{opacity:.5,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'cubic-bezier(.16,1,.3,1)'});
}
