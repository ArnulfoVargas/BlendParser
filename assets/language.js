// Real links keep both languages available without JavaScript.
// Shared anchor IDs retain the reader's place when switching languages.
for (const link of document.querySelectorAll('[data-language]')) {
 const update = () => {
  const destination=new URL(link.href);
  destination.search=location.search;
  destination.searchParams.set('lang',link.dataset.language);
  destination.hash=location.hash;
  link.href=destination.href;
 };
 update();
 addEventListener('hashchange', update);
 link.addEventListener('click',()=>{
  try{localStorage.setItem('blendparser-language',link.dataset.language);}catch{}
 });
}
// Query choices also survive navigation when browser storage is unavailable.
const explicit=new URL(location.href).searchParams.get('lang');
if(explicit==='es'||explicit==='en')for(const link of document.querySelectorAll('a[href]:not([data-language])')){
 const destination=new URL(link.href);
 const base=new URL('../',document.querySelector('script[src*="language.js"]').src);
 if(destination.origin===base.origin&&destination.pathname.startsWith(base.pathname)&&/\/(?:index\.html|docs\.html)?$/.test(destination.pathname)){
  destination.searchParams.set('lang',explicit);link.href=destination.href;
 }
}
const menu=document.querySelector('.language-switch');
document.addEventListener('click',event=>{if(menu&&!menu.contains(event.target))menu.open=false;});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&menu?.open){menu.open=false;menu.querySelector('summary').focus();}
});
