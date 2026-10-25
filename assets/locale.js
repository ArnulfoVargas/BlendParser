// Run in <head> before the page paints. Explicit English URLs remain shareable.
(() => {
 const key='blendparser-language';
 const base=new URL('../',document.currentScript.src);
 const relative=location.pathname.slice(base.pathname.length);
 if(!['','index.html','docs.html','en/','en/index.html','en/docs.html'].includes(relative))return;
 const url=new URL(location.href);
 const explicit=url.searchParams.get('lang');
 const valid=value=>value==='es'||value==='en';
 let saved=null;
 try {
  saved=localStorage.getItem(key);
  if(valid(explicit))localStorage.setItem(key,explicit);
 }catch{}
 const current=relative.startsWith('en/')?'en':'es';
 const browser=(navigator.languages?.length?navigator.languages:[navigator.language])
  .map(value=>String(value||'').toLowerCase().split(/[-_]/)[0]).find(valid)||'en';
 const preferred=valid(explicit)?explicit:current==='en'?'en':valid(saved)?saved:browser;
 if(preferred===current)return;
 const docs=relative.endsWith('docs.html');
 const destination=new URL((preferred==='en'?'en/':'')+(docs?'docs.html':''),base);
 destination.search=url.search;destination.hash=url.hash;
 location.replace(destination.href);
})();
