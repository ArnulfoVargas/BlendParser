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
  await page.setViewport({width:1440,height:900});
  await page.goto(base+prefix,{waitUntil:'networkidle0'});
  assert.equal(await page.$eval('html',el=>el.lang),language);
  assert.match(await page.$eval('[data-download]',el=>el.textContent),language==='en'?/Download for Windows/:/Descargar para Windows/);
  assert.ok(await page.$$eval('[data-release-assets] a',els=>els.length>=2));
  assert.ok((await page.$eval('[data-release-status]',el=>el.textContent)).includes(snapshot.release.tag_name));
  await page.click('[data-play-tour]');
  assert.equal(await page.$eval('[data-play-tour]',el=>el.textContent),language==='en'?'Play tour':'Reproducir recorrido');
  await page.click('[data-shot="resultado"]');
  await page.waitForFunction(()=>document.querySelector('[data-capture-image]').src.endsWith('/assets/resultado.png'));
  assert.match(await page.$eval('[data-capture-caption]',el=>el.textContent),language==='en'?/filament colors/:/colores de filamento/);
  await page.click('[data-feature="mesh"]');
  assert.equal(await page.$eval('#feature-mesh',el=>el.hidden),false);
  await page.click('.faq-item summary');
  assert.equal(await page.$eval('.faq-item summary',el=>el.getAttribute('aria-expanded')),'true');
  for(const width of [375,768,1024,1280,1440]){
   await page.setViewport({width,height:900});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${prefix} overflow at ${width}`);
   assert.equal(await page.$eval('.language-switch',el=>el.getBoundingClientRect().right>innerWidth),false);
  }
  await page.setViewport({width:375,height:812});
  await page.screenshot({path:`.qa/${language}-landing-mobile.png`,fullPage:true});
  await page.screenshot({path:`.qa/${language}-landing-mobile-top.png`});
  await page.setViewport({width:1440,height:900});
  await page.goto(base+prefix+'docs.html#paleta',{waitUntil:'networkidle0'});
  assert.equal(await page.$$eval('[data-doc-section]',els=>els.length),12);
  await page.type('#doc-search',language==='en'?'brush':'pincel');
  assert.match(await page.$eval('#doc-search-status',el=>el.textContent),language==='en'?/of 12 sections/:/de 12 secciones/);
  await page.focus('#doc-search');await page.keyboard.press('Escape');
  assert.equal(await page.$$eval('[data-doc-section]:not([hidden])',els=>els.length),12);
  await page.type('#doc-search','zzzznoresult');
  assert.equal(await page.$eval('.doc-empty',el=>el.hidden),false);
  await page.keyboard.press('Escape');
  const other=language==='en'?'es':'en';
  await page.click(`[data-language="${other}"]`);
  await page.waitForFunction(expected=>document.documentElement.lang===expected,{},other);
  assert.equal(new URL(page.url()).hash,'#paleta');
  assert.equal(await page.$eval('.language-switch [aria-current="true"]',el=>el.lang),other);
  await page.goto(base+prefix+'docs.html',{waitUntil:'networkidle0'});
  for(const width of [375,768,1440]){
   await page.setViewport({width,height:900});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${prefix}docs overflow at ${width}`);
  }
  await page.setViewport({width:375,height:812});
  await page.screenshot({path:`.qa/${language}-docs-mobile.png`,fullPage:true});
  await page.screenshot({path:`.qa/${language}-docs-mobile-top.png`});
  await page.setJavaScriptEnabled(false);
  await page.goto(base+prefix,{waitUntil:'networkidle0'});
  assert.equal(await page.$eval('[data-download]',el=>el.href),'https://github.com/ArnulfoVargas/blend-parser-app/releases');
  await page.click(`[data-language="${other}"]`);
  assert.equal(await page.$eval('html',el=>el.lang),other);
  await page.goto(base+prefix+'docs.html',{waitUntil:'networkidle0'});
  assert.equal(await page.$$eval('[data-doc-section]:not([hidden])',els=>els.length),12);
  await page.setJavaScriptEnabled(true);
 }
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 await page.goto(base+'en/',{waitUntil:'networkidle0'});
 assert.equal(await page.$eval('[data-play-tour]',el=>el.textContent),'Play tour');
 assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),0);
 assert.deepEqual(errors,[]);
 console.log('Browser i18n checks passed: both languages, mobile/desktop, downloads with API offline, tour images and labels, guide search, anchor-preserving switch, no JavaScript, reduced motion.');
}finally{await browser.close();}
