// Capture the real Model files dialog, with an OBJ open in a separate WebView.
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const require=createRequire(process.env.BP_BROWSER_TOOLS?`${process.env.BP_BROWSER_TOOLS}/package.json`:import.meta.url);
const puppeteer=require('puppeteer-core');
const root=new URL('../assets/',import.meta.url);
const browser=await puppeteer.connect({browserURL:process.env.BP_IMPORT_CDP||'http://127.0.0.1:9224',defaultViewport:null});
try {
 const page=(await browser.pages()).find(p=>p.url().includes('tauri.localhost'));
 if(!page)throw new Error('No importer WebView found');
 await page.setViewport({width:1600,height:1000,deviceScaleFactor:2});
 await page.waitForSelector('#files-dialog[open]',{timeout:30000});
 if(await page.$('#toast:popover-open'))await page.click('#toast-close');
 await new Promise(resolve=>setTimeout(resolve,650));
 await page.screenshot({path:fileURLToPath(new URL('importacion.png',root))});
 await page.screenshot({path:fileURLToPath(new URL('importacion.webp',root)),type:'webp',quality:95});
 const manifestPath=new URL('captures.json',root);
 const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
 if(!manifest.captures.includes('importacion.png'))manifest.captures.push('importacion.png');
 manifest.import_example='reference.obj exported from the same source BLEND with Blender 5.0.1; the real importer prompts to restore packed textures';
 writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
 console.log('Captured the real importer at 3200 × 2000.');
} finally {await browser.disconnect();}
