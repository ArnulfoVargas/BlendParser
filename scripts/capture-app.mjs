// Capture the real release WebView, connected with WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS.
// BP_BROWSER_TOOLS points to a directory containing puppeteer-core in node_modules.
import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
const require=createRequire(process.env.BP_BROWSER_TOOLS?`${process.env.BP_BROWSER_TOOLS}/package.json`:import.meta.url);
const puppeteer=require('puppeteer-core');
const browser=await puppeteer.connect({browserURL:process.env.BP_APP_CDP||'http://127.0.0.1:9223',defaultViewport:null});
const root=new URL('../assets/',import.meta.url);
const pause=()=>new Promise(resolve=>setTimeout(resolve,800));
try{
 const page=(await browser.pages()).find(p=>p.url().includes('tauri.localhost'));
 if(!page)throw new Error('No release app WebView found');
 await page.setViewport({width:1600,height:1000,deviceScaleFactor:1});
 await page.waitForSelector('[data-state="ready"]');
 const version=await page.$eval('#version',el=>el.innerText.trim());
 if(version!=='v0.0.5')throw new Error(`Expected v0.0.5, found ${version}`);
 if(await page.$('.picker__panel:popover-open'))await page.keyboard.press('Escape');
 await page.click('#printer-picker-button');
 await page.type('.picker__panel:popover-open input','Bambu Lab A1');
 await page.click('[role="option"][data-value="Bambu Lab A1"]');
 await page.select('#nozzle','0.4');
 await pause();
 await page.focus('#size-z');
 await page.keyboard.down('Control');await page.keyboard.press('A');await page.keyboard.up('Control');
 await page.keyboard.type('75');await page.keyboard.press('Tab');await pause();
 await page.click('[data-tool="orbit"]');
 await page.keyboard.press('f');await pause();
 const save=async(name,selector)=>{
  await pause();
  if(selector)await (await page.$(selector)).screenshot({path:new URL(name,root).pathname.replace(/^\/([A-Z]:)/,'$1')});
  else await page.screenshot({path:new URL(name,root).pathname.replace(/^\/([A-Z]:)/,'$1')});
 };
 await save('blendparser-app.png');
 await save('resultado.png','.stage__view');
 await page.click('[data-view="texture"]');await save('original.png','.stage__view');
 await page.click('[data-view="filament"]');
 await page.click('[data-tool="size"]');await save('tamano.png');
 await page.click('[data-tool="measure"]');await save('medir.png');
 await page.click('[data-tool="orbit"]');
 await page.click('#size-group summary');await page.click('#color-group summary');
 await page.click('#plate-group summary');await save('placa-torre.png');
 await page.click('#waste summary');
 await page.click('#open-waste');await save('desperdicio.png');await page.click('#waste-close');
 await page.click('#menubar > li:nth-child(2) > button');
 await page.click('[data-cmd="printers"]');await save('impresoras.png');await page.click('#printer-close');
 await page.keyboard.down('Control');await page.keyboard.press(',');await page.keyboard.up('Control');
 await save('preferencias.png');await page.keyboard.press('Escape');
 writeFileSync(new URL('captures.json',root),JSON.stringify({release:'alpha-0.0.5',source:'Published Windows MSI, extracted without installation; real Tauri WebView screenshots',model:'spider_hito2v5_optimizada-3d-texturizado-v21.blend',height_mm:75,printer:'Bambu Lab A1',nozzle_mm:0.4,viewport:[1600,1000],language:'es',captures:['blendparser-app.png','resultado.png','original.png','tamano.png','medir.png','placa-torre.png','desperdicio.png','impresoras.png','preferencias.png'],blender_captures:'Existing real Blender 5.0 screenshots of the same source model retained'},null,2)+'\n');
 console.log(`Captured ${version}: real interface and seven feature views.`);
}finally{await browser.disconnect();}
