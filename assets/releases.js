export const REPO='ArnulfoVargas/blend-parser-app';
const FALLBACK=`https://github.com/${REPO}/releases`;
export function selectRelease(releases){
 return [...releases].filter(r=>!r.draft&&r.published_at&&(r.assets||[]).some(a=>/\.(exe|msi|AppImage|deb|rpm)$/i.test(a.name))).sort((a,b)=>Date.parse(b.published_at)-Date.parse(a.published_at))[0]||null;
}
export function installerAssets(release){
 return (release?.assets||[]).filter(a=>/\.(exe|msi|AppImage|deb|rpm)$/i.test(a.name)&&a.browser_download_url?.startsWith(`https://github.com/${REPO}/releases/download/`));
}
export function preferredAsset(release,platform){
 const assets=installerAssets(release);
 if(platform==='windows')return assets.find(a=>/x64.*\.exe$/i.test(a.name))||assets.find(a=>/\.exe$/i.test(a.name))||assets.find(a=>/\.msi$/i.test(a.name));
 if(platform==='linux')return assets.find(a=>/amd64\.AppImage$/i.test(a.name))||assets.find(a=>/\.AppImage$/i.test(a.name))||assets.find(a=>/\.deb$/i.test(a.name));
 return null;
}
function platformName(){const p=navigator.userAgentData?.platform||navigator.platform||'';return /win/i.test(p)?'windows':/linux/i.test(p)?'linux':null;}
function render(release){
 if(!release)return;
 const platform=platformName(),preferred=preferredAsset(release,platform);
 for(const link of document.querySelectorAll('[data-download]')){
  link.href=preferred?.browser_download_url||(release.html_url?.startsWith(`https://github.com/${REPO}/releases/tag/`)?release.html_url:FALLBACK);
  link.textContent=preferred?`Descargar para ${platform==='windows'?'Windows':'Linux'}`:'Ver descargas';
 }
 const status=document.querySelector('[data-release-status]');
 if(status)status.textContent=`${release.tag_name}${release.prerelease?' · Versión preliminar':''}`;
 const list=document.querySelector('[data-release-assets]');
 if(list){
  const links=installerAssets(release).map(asset=>{
   const link=document.createElement('a');link.href=asset.browser_download_url;link.className='installer-link';
   const ext=asset.name.split('.').at(-1);
   link.textContent=/exe|msi/i.test(ext)?`Windows (.${ext})`:`Linux (.${ext})`;
   return link;
  });
  list.replaceChildren(...links);
 }
}
export async function loadRelease(){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8000);
 let snapshot=null;
 try{const response=await fetch(new URL('./releases.json',import.meta.url));if(response.ok){snapshot=await response.json();render(snapshot.release);}}catch{}
 try{
  const cached=JSON.parse(sessionStorage.getItem('blendparser-release')||'null');
  if(cached&&Date.now()-cached.at<600000){render(cached.release);clearTimeout(timeout);return;}
 }catch{}
 try{
  const response=await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=30`,{signal:controller.signal,headers:{Accept:'application/vnd.github+json'}});
  if(!response.ok)throw new Error('GitHub releases unavailable');
  const release=selectRelease(await response.json());
  if(release){render(release);try{sessionStorage.setItem('blendparser-release',JSON.stringify({at:Date.now(),release}));}catch{}}
 }catch{if(!snapshot?.release){const status=document.querySelector('[data-release-status]');if(status)status.textContent='Consulta las versiones disponibles en GitHub.';}}
 finally{clearTimeout(timeout);}
}
