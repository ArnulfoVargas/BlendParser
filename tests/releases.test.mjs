import {test} from 'node:test';
import assert from 'node:assert/strict';
import {selectRelease,installerAssets,preferredAsset} from '../assets/releases.js';
const asset=name=>({name,browser_download_url:'https://github.com/ArnulfoVargas/blend-parser-app/releases/download/test/'+name});
const release=(tag,date,assets,extra={})=>({tag_name:tag,published_at:date,assets:assets.map(asset),...extra});
test('newer published preview is available; drafts and release shells never replace working installers',()=>{
 const stable=release('v1','2026-01-01',['BlendParser_x64-setup.exe']);
 const preview=release('alpha-2','2026-02-01',['BlendParser_x64-setup.exe'],{prerelease:true});
 const draft=release('v3','2026-03-01',['BlendParser.exe'],{draft:true});
 const shell=release('v4','2026-04-01',['latest.json','BlendParser.exe.sig']);
 assert.equal(selectRelease([stable,draft,shell,preview]).tag_name,'alpha-2');
 assert.equal(selectRelease([shell,draft]),null);
});
test('platform selection ignores updater files and offers the correct real installer',()=>{
 const r=release('v1','2026-01-01',['latest.json','BlendParser_x64-setup.exe.sig','BlendParser_amd64.deb','BlendParser_amd64.AppImage','BlendParser_x64.msi','BlendParser_x64-setup.exe']);
 assert.equal(preferredAsset(r,'windows').name,'BlendParser_x64-setup.exe');
 assert.equal(preferredAsset(r,'linux').name,'BlendParser_amd64.AppImage');
 assert.equal(preferredAsset(r,'mac'),null);
 assert.equal(installerAssets(r).length,4);
 r.assets.push({name:'malicious.exe',browser_download_url:'https://example.com/malicious.exe'});
 assert.equal(installerAssets(r).length,4);
});
