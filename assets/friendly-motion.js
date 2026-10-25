const motionAllowed=matchMedia('(prefers-reduced-motion: no-preference)');
const tourLabels=document.documentElement.lang==='en'?['Pause tour','Play tour']:['Pausar recorrido','Reproducir recorrido'];
const hero=document.querySelector('.friendly-opening');
const dock=document.querySelector('.download-dock');
const tour=document.querySelector('[data-tour]');
const play=tour?.querySelector('[data-play-tour]');
const tabs=[...(tour?.querySelectorAll('[data-shot]')||[])];
let timer=null,playing=motionAllowed.matches,tourVisible=false,started=false,hoverPaused=false,focusPaused=false;
const renderPlayback=()=>{
 if(play){play.textContent=tourLabels[playing?0:1];play.setAttribute('aria-pressed',String(playing));}
};
const syncPlayback=()=>{
 clearTimeout(timer);timer=null;renderPlayback();
 if(playing&&tourVisible&&!document.hidden&&!hoverPaused&&!focusPaused)timer=setTimeout(advance,3000);
};
const stop=()=>{playing=false;syncPlayback();};
const advance=()=>{
 if(!playing||document.hidden||!tourVisible||hoverPaused||focusPaused){syncPlayback();return;}
 const current=tabs.findIndex(b=>b.getAttribute('aria-pressed')==='true');
 tabs[(current+1)%tabs.length].click();
 syncPlayback();
};
const start=()=>{
 if(!play)return;
 playing=true;hoverPaused=false;focusPaused=false;
 if(!started){started=true;tabs[0]?.click();}
 syncPlayback();
};
play?.addEventListener('click',()=>{if(playing)stop();else start();});
// Incidental pointer placement during load must not suppress autoplay.
// Pause after actual pointer movement, then resume when it leaves the viewer.
tour?.addEventListener('pointermove',event=>{if(event.pointerType==='mouse'){hoverPaused=true;syncPlayback();}});
tour?.addEventListener('pointerleave',()=>{hoverPaused=false;syncPlayback();});
tour?.addEventListener('focusin',event=>{focusPaused=event.target!==play;syncPlayback();});
tour?.addEventListener('focusout',()=>{queueMicrotask(()=>{focusPaused=tour.contains(document.activeElement)&&document.activeElement!==play;syncPlayback();});});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)hoverPaused=false;syncPlayback();});
if(tour)new IntersectionObserver(entries=>{
 tourVisible=entries[0].isIntersecting;
 if(!tourVisible)hoverPaused=false;
 if(tourVisible&&playing&&!started)start();else syncPlayback();
},{threshold:.1}).observe(tour);
renderPlayback();
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
