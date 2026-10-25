// Optional browser regression check: requires puppeteer-core and Chrome.
// BP_BROWSER_TOOLS may point to an existing directory with node_modules.
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdirSync, readFileSync} from 'node:fs';
const require=createRequire(process.env.BP_BROWSER_TOOLS?`${process.env.BP_BROWSER_TOOLS}/package.json`:import.meta.url);
const puppeteer=require('puppeteer-core');
const browser=await puppeteer.launch({executablePath:process.env.BP_CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const base=process.env.BP_SITE_URL||'http://127.0.0.1:8768/';
const snapshot=JSON.parse(readFileSync(new URL('../assets/releases.json',import.meta.url)));
const navPositions=page=>page.$$eval('nav.container .navlinks > *',elements=>elements.map(el=>{
 const {x,y,width,height}=el.getBoundingClientRect();
 return {x,y:height?y-el.closest('nav').getBoundingClientRect().top:0,width,height};
}));
mkdirSync('.qa',{recursive:true});
try {
 const page=await browser.newPage();const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.evaluateOnNewDocument(()=>Object.defineProperty(navigator,'platform',{get:()=> 'Win32'}));
 await page.setRequestInterception(true);
 // Exercise the local release snapshot when GitHub is unavailable.
 page.on('request',request=>request.url().startsWith('https://api.github.com/')?request.abort():request.continue());
 for(const language of ['es','en']){
  const prefix=language==='en'?'en/':'';
  const localized=route=>{const url=new URL(base+prefix+route);url.searchParams.set('lang',language);return url.href;};
  await page.setViewport({width:1440,height:900});
  await page.goto(localized(''),{waitUntil:'networkidle0'});
  assert.equal(await page.$eval('html',el=>el.lang),language);
  assert.match(await page.$eval('[data-download]:not(.nav-action)',el=>el.textContent),language==='en'?/Download for Windows/:/Descargar para Windows/);
  assert.equal(await page.$eval('.nav-action',el=>el.textContent),language==='en'?'Download':'Descargar');
  assert.ok(await page.$$eval('[data-release-assets] a',els=>els.length>=2));
  assert.ok((await page.$eval('[data-release-status]',el=>el.textContent)).includes(snapshot.release.tag_name));
  const landingNav=await navPositions(page);
  const navBeforeDropdown=await navPositions(page);
  await page.click('.language-switch summary');
  assert.deepEqual(await navPositions(page),navBeforeDropdown,'Opening language dropdown must not change layout');
  await page.keyboard.press('Escape');
  assert.equal(await page.$eval('.language-switch',el=>el.open),false);
  await page.click('[data-play-tour]');
  assert.equal(await page.$eval('[data-play-tour]',el=>el.textContent),language==='en'?'Play tour':'Reproducir recorrido');
  await page.click('[data-shot="resultado"]');
  await page.waitForFunction(()=>document.querySelector('[data-capture-image]').src.endsWith('/assets/resultado.png'));
  assert.match(await page.$eval('[data-capture-caption]',el=>el.textContent),language==='en'?/filament colors/:/colores de filamento/);
  await page.click('[data-feature="mesh"]');
  assert.equal(await page.$eval('#feature-mesh',el=>el.hidden),false);
  await page.click('.faq-item summary');
  assert.equal(await page.$eval('.faq-item summary',el=>el.getAttribute('aria-expanded')),'true');
  const navAtWidth=new Map();
  for(const width of [375,768,1024,1280,1440]){
   await page.setViewport({width,height:900});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${prefix} overflow at ${width}`);
   assert.equal(await page.$eval('.language-switch',el=>el.getBoundingClientRect().right>innerWidth),false);
   const menuFits=await page.evaluate(()=>{
    const menu=document.querySelector('.language-switch');menu.open=true;
    const bounds=menu.querySelector('.language-options').getBoundingClientRect();
    const fits=bounds.left>=0&&bounds.right<=innerWidth;menu.open=false;return fits;
   });
   assert.ok(menuFits,`Language menu must fit viewport at ${width}px`);
   if(language==='en'){
    const titleSize=await page.$eval('.friendly-hero h1',heading=>parseFloat(getComputedStyle(heading).fontSize));
    if(width===375)assert.ok(titleSize>=52,'English mobile title should keep its visual weight');
    if(width===1440)assert.ok(titleSize>=80,'English desktop title should keep its visual weight');
    assert.ok(await page.$eval('.friendly-hero h1',heading=>[...heading.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim()).every(node=>{
     const range=document.createRange();range.selectNodeContents(node);
     return range.getClientRects().length===1&&range.getBoundingClientRect().width<=heading.clientWidth+1;
    })),`English headline must have exactly two unbroken lines at ${width}px`);
   }
   navAtWidth.set(width,await navPositions(page));
  }
  // Keep the accordion trigger and viewport still while its answer expands.
  await page.evaluate(()=>{const s=document.querySelector('.faq-item summary');scrollTo({top:scrollY+s.getBoundingClientRect().top-100,behavior:'instant'});});
  if(await page.$eval('.faq-item',el=>el.open)){await page.click('.faq-item summary');await new Promise(r=>setTimeout(r,400));}
  const before=await page.evaluate(()=>scrollY);
  await page.click('.faq-item summary');
  for(let frame=0;frame<25;frame++){
   await new Promise(r=>setTimeout(r,20));
   assert.ok(Math.abs(await page.evaluate(()=>scrollY)-before)<=1,'FAQ must not move the viewport');
  }
  await page.setViewport({width:375,height:812});
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:`.qa/${language}-landing-mobile.png`,fullPage:true});
  await page.screenshot({path:`.qa/${language}-landing-mobile-top.png`});
  await page.setViewport({width:1440,height:900});
  await page.screenshot({path:`.qa/${language}-landing-desktop.png`});
  await page.goto(localized('docs.html#paleta'),{waitUntil:'networkidle0'});
  // Compare at the top: the docs header is sticky while the landing is static.
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  assert.deepEqual(await navPositions(page),landingNav,'Landing and guide navigation must keep identical positions');
  assert.equal(await page.$$eval('[data-doc-section]',els=>els.length),13);
  await page.type('#doc-search',language==='en'?'brush':'pincel');
  assert.match(await page.$eval('#doc-search-status',el=>el.textContent),language==='en'?/of 13 sections/:/de 13 secciones/);
  await page.focus('#doc-search');await page.keyboard.press('Escape');
  assert.equal(await page.$$eval('[data-doc-section]:not([hidden])',els=>els.length),13);
  await page.type('#doc-search','zzzznoresult');
  assert.equal(await page.$eval('.doc-empty',el=>el.hidden),false);
  await page.keyboard.press('Escape');
  const other=language==='en'?'es':'en';
  await page.click('.language-switch summary');
  await page.click(`[data-language="${other}"]`);
  await page.waitForFunction(expected=>document.documentElement.lang===expected,{},other);
  assert.equal(new URL(page.url()).hash,'#paleta');
  assert.equal(await page.$eval('.language-switch [aria-current="true"]',el=>el.lang),other);
  await page.goto(localized('docs.html'),{waitUntil:'networkidle0'});
  for(const width of [375,768,1440]){
   await page.setViewport({width,height:900});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${prefix}docs overflow at ${width}`);
   assert.deepEqual(await navPositions(page),navAtWidth.get(width),`Navigation must remain stable at ${width}px`);
  }
  await page.setViewport({width:375,height:812});
  await page.screenshot({path:`.qa/${language}-docs-mobile.png`,fullPage:true});
  await page.screenshot({path:`.qa/${language}-docs-mobile-top.png`});
  await page.setJavaScriptEnabled(false);
  await page.goto(localized(''),{waitUntil:'networkidle0'});
  assert.equal(await page.$eval('[data-download]',el=>el.href),'https://github.com/ArnulfoVargas/blend-parser-app/releases');
  await page.click('.language-switch summary');
  await page.click(`[data-language="${other}"]`);
  assert.equal(await page.$eval('html',el=>el.lang),other);
  await page.goto(localized('docs.html'),{waitUntil:'networkidle0'});
  assert.equal(await page.$$eval('[data-doc-section]:not([hidden])',els=>els.length),13);
  await page.setJavaScriptEnabled(true);
 }
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 await page.goto(base+'en/',{waitUntil:'networkidle0'});
 assert.equal(await page.$eval('[data-play-tour]',el=>el.textContent),'Play tour');
 assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),0);
 // Real navigation: detection, manual override, future visits and blocked storage.
 const context=await browser.createBrowserContext();
 const auto=await context.newPage();auto.on('pageerror',error=>errors.push(error.message));
 await auto.evaluateOnNewDocument(()=>{
  Object.defineProperty(navigator,'languages',{get:()=>['fr-FR','en-GB','es-MX']});
  Object.defineProperty(navigator,'language',{get:()=> 'en-GB'});
 });
 await auto.goto(base+'docs.html?source=test#paleta',{waitUntil:'networkidle0'});
 await auto.waitForFunction(()=>document.documentElement.lang==='en');
 assert.equal(new URL(auto.url()).pathname,new URL(base+'en/docs.html').pathname);
 assert.equal(new URL(auto.url()).searchParams.get('source'),'test');
 assert.equal(new URL(auto.url()).hash,'#paleta');
 await auto.click('.language-switch summary');await auto.click('[data-language="es"]');
 await auto.waitForFunction(()=>document.documentElement.lang==='es');
 await auto.goto(base,{waitUntil:'networkidle0'});
 assert.equal(await auto.$eval('html',el=>el.lang),'es','Manual Spanish choice must override English browser on future visits');
 await auto.goto(base+'en/',{waitUntil:'networkidle0'});
 assert.equal(await auto.$eval('html',el=>el.lang),'en','Explicit English URL must remain shareable');
 await context.close();
 const blocked=await browser.newPage();blocked.on('pageerror',error=>errors.push(error.message));
 await blocked.evaluateOnNewDocument(()=>{
  Object.defineProperty(navigator,'languages',{get:()=>['en-US']});
  Object.defineProperty(window,'localStorage',{get:()=>{throw new Error('Storage blocked');}});
 });
 await blocked.goto(base+'?lang=es',{waitUntil:'networkidle0'});
 assert.equal(await blocked.$eval('html',el=>el.lang),'es');
 await blocked.click('.doc-link');
 await blocked.waitForSelector('[data-doc-section]');
 assert.equal(await blocked.$eval('html',el=>el.lang),'es','Manual choice must survive navigation with storage blocked');
 await blocked.close();
 assert.deepEqual(errors,[]);
 console.log('Browser i18n checks passed: both languages, mobile/desktop, strong two-line title, stable navigation, downloads offline, guide search, browser language detection, remembered manual choice, blocked storage, preserved queries and anchors, no JavaScript, reduced motion.');
}finally{await browser.close();}
