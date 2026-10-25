// Capture a real Tauri WebView, without recreating or retouching the interface.
// BP_BROWSER_TOOLS points to a directory containing puppeteer-core.
import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const require=createRequire(process.env.BP_BROWSER_TOOLS?`${process.env.BP_BROWSER_TOOLS}/package.json`:import.meta.url);
const puppeteer=require('puppeteer-core');
const root=new URL('../assets/',import.meta.url);
const sourceRef=process.env.BP_CAPTURE_SOURCE_REF;
if(!sourceRef)throw new Error('Set BP_CAPTURE_SOURCE_REF to the commit used to build the captured app');
const browser=await puppeteer.connect({browserURL:process.env.BP_APP_CDP||'http://127.0.0.1:9223',defaultViewport:null});
const pause=()=>new Promise(resolve=>setTimeout(resolve,650));
try {
 const page=(await browser.pages()).find(p=>p.url().includes('tauri.localhost'));
 if(!page)throw new Error('No app WebView found');
 await page.setViewport({width:1600,height:1000,deviceScaleFactor:2});
 await page.waitForSelector('[data-state="ready"]',{timeout:90000});
 const version=await page.$eval('#version',el=>el.innerText.trim());
 if(process.env.BP_CAPTURE_VERSION&&version!==process.env.BP_CAPTURE_VERSION)throw new Error(`Expected ${process.env.BP_CAPTURE_VERSION}, found ${version}`);
 if(await page.$('dialog[open]'))throw new Error('Close the active dialog before capture');
 if(await page.$('.picker__panel:popover-open'))await page.keyboard.press('Escape');
 if(await page.$('#toast-close'))await page.click('#toast-close').catch(()=>{});
 await page.click('#printer-picker-button');
 await page.type('.picker__panel:popover-open input','Bambu Lab A1');
 await page.click('[role="option"][data-value="Bambu Lab A1"]');
 await page.select('#nozzle','0.4');await pause();
 await page.focus('#size-z');
 await page.keyboard.down('Control');await page.keyboard.press('A');await page.keyboard.up('Control');
 await page.keyboard.type('75');await page.keyboard.press('Tab');
 await page.waitForFunction(()=>!document.querySelector('[data-app]').classList.contains('is-working'));await pause();
 const save=async(name,selector)=>{
  await pause();const path=fileURLToPath(new URL(name,root));
  const target=selector?await page.$(selector):page;
  await target.screenshot({path});
  await target.screenshot({path:path.replace(/\.png$/,'.webp'),type:'webp',quality:95});
 };
 const tool=async key=>{await page.click(`button[data-tool="${key}"]`);await pause();};
 const groups=async open=>{
  const items=await page.$$('#settings > details.group');
  for(const item of items){
   const {id,current}=await item.evaluate(el=>({id:el.id,current:el.open}));
   if(current!==open.includes(id))await (await item.$('summary')).click();
  }
  await page.$eval('#settings',e=>e.closest('aside').scrollTop=0);
 };
 await groups(['size-group','color-group']);
 if(await page.$eval('#waste',e=>e.open))await page.click('#waste summary');
 await tool('orbit');await page.keyboard.press('f');await pause();
 await save('blendparser-app.png');await save('resultado.png','.stage__view');
 await page.click('[data-view="texture"]');await save('original.png','.stage__view');
 await page.click('[data-view="filament"]');
 await tool('size');await save('tamano.png');
 await tool('measure');await save('medir.png');
 await tool('move');await save('mover.png');
 await tool('rotate');await save('rotar.png');
 await tool('section');await save('corte.png');await page.click('#cut-off');
 await groups(['printability']);await page.click('#printability-run');
 await page.waitForFunction(()=>!document.querySelector('#printability-run').disabled,{timeout:90000});
 await page.$eval('#printability',el=>el.scrollIntoView({block:'start'}));
 await save('viabilidad.png');
 await groups(['plate-group']);await save('placa-torre.png');
 if(!await page.$eval('#waste',e=>e.open))await page.click('#waste summary');
 await page.click('#open-waste');
 await page.waitForSelector('#waste-dialog[open]');
 await save('desperdicio.png');await page.click('#waste-close');
 await page.click('#menubar > li:nth-child(2) > button');
 await page.click('[data-cmd="printers"]');await page.waitForSelector('#printer-dialog[open]');await save('impresoras.png');await page.click('#printer-close');
 await page.keyboard.down('Control');await page.keyboard.press(',');await page.keyboard.up('Control');
 await save('preferencias.png');await page.keyboard.press('Escape');
 await groups(['size-group','color-group']);await tool('orbit');
 writeFileSync(new URL('captures.json',root),JSON.stringify({
  source_ref:sourceRef,
  source:'Local release-profile build of the reviewed main commit; real Tauri WebView screenshots',
  availability:'Development preview; new features are not included in the published alpha-0.0.6 installer',
  displayed_version:version,model:'spider_hito2v5_optimizada-3d-texturizado-v21.blend',
  height_mm:75,printer:'Bambu Lab A1',nozzle_mm:0.4,viewport_css:[1600,1000],device_scale_factor:2,full_capture_pixels:[3200,2000],language:'es',
  captures:['blendparser-app.png','resultado.png','original.png','tamano.png','medir.png','mover.png','rotar.png','corte.png','viabilidad.png','placa-torre.png','desperdicio.png','impresoras.png','preferencias.png'],
  blender_captures:'Existing authentic Blender 5.0 images of the same model retained at native resolution'
 },null,2)+'\n');
 console.log(`Captured ${version}: native 3200 × 2000 development preview.`);
} finally {await browser.disconnect();}
