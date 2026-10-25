const motionAllowed=matchMedia('(prefers-reduced-motion: no-preference)');
const hero=document.querySelector('.friendly-opening');
const dock=document.querySelector('.download-dock');
const tour=document.querySelector('[data-tour]');
const play=tour?.querySelector('[data-play-tour]');
const tabs=[...(tour?.querySelectorAll('[data-shot]')||[])];
let timer=null,playing=false,tourVisible=true;
const stop=()=>{
 playing=false;clearTimeout(timer);timer=null;
 if(play){play.textContent='Reproducir recorrido';play.setAttribute('aria-pressed','false');}
};
const advance=()=>{
 if(!playing||document.hidden||!tourVisible)return;
 const current=tabs.findIndex(b=>b.getAttribute('aria-pressed')==='true');
 tabs[(current+1)%tabs.length].click();
 timer=setTimeout(advance,3000);
};
play?.addEventListener('click',()=>{
 if(playing){stop();return;}
 playing=true;play.textContent='Pausar recorrido';play.setAttribute('aria-pressed','true');
 tabs[0]?.click();
 if(!tour.matches(':hover'))timer=setTimeout(advance,3000);
});
// Automatic playback pauses while the visitor handles a capture or leaves it.
tour?.addEventListener('pointerenter',()=>{if(playing)clearTimeout(timer);});
tour?.addEventListener('pointerleave',()=>{if(playing&&(!tour.contains(document.activeElement)||document.activeElement===play)){clearTimeout(timer);timer=setTimeout(advance,3000);}});
tour?.addEventListener('focusin',event=>{if(event.target!==play&&playing)clearTimeout(timer);});
tour?.addEventListener('focusout',()=>{if(playing){clearTimeout(timer);timer=setTimeout(advance,3000);}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
if(tour)new IntersectionObserver(entries=>{tourVisible=entries[0].isIntersecting;if(!tourVisible)stop();},{threshold:.1}).observe(tour);
if(hero&&dock)new IntersectionObserver(entries=>{
 const show=!entries[0].isIntersecting&&entries[0].boundingClientRect.bottom<0;
 dock.hidden=!show;
 if(show&&motionAllowed.matches)dock.animate([{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,easing:'ease-out'});
}).observe(hero);
if(motionAllowed.matches){
 const heading=document.querySelector('.friendly-hero h1');
 const description=document.querySelector('.friendly-hero .lead');
 const actions=document.querySelector('.friendly-hero .actions');
 [heading,description,actions,tour].forEach((el,index)=>el?.animate([{opacity:0,transform:`translateY(${index===3?28:18}px)`},{opacity:1,transform:'translateY(0)'}],{duration:700,delay:index*90,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'}));
}
motionAllowed.addEventListener('change',()=>{stop();if(!motionAllowed.matches)document.getAnimations().forEach(animation=>animation.cancel());});
for(const details of document.querySelectorAll('.faq-list details'))details.addEventListener('toggle',()=>{
 if(details.open&&motionAllowed.matches)details.querySelector('p')?.animate([{opacity:0,transform:'translateY(-8px)'},{opacity:1,transform:'translateY(0)'}],{duration:260,easing:'ease-out'});
});
