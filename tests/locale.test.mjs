import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const source=readFileSync(new URL('../assets/locale.js',import.meta.url),'utf8');
function detect({path='',languages=['en-US'],language='en-US',saved=null,blocked=false,base='/BlendParser/'}={}){
 const current=new URL(path,`https://example.com${base}`);let redirect=null,choice=saved;
 runInNewContext(source,{
  URL,document:{currentScript:{src:`https://example.com${base}assets/locale.js?v=test`}},
  location:{href:current.href,pathname:current.pathname,replace:href=>{redirect=href;}},
  navigator:{languages,language},
  localStorage:{getItem:()=>{if(blocked)throw Error('blocked');return choice;},setItem:(_,value)=>{if(blocked)throw Error('blocked');choice=value;}}
 });
 return {redirect,choice};
}
test('detects browser language variants in preference order',()=>{
 assert.equal(detect({languages:['fr-FR','en-GB','es-MX']}).redirect,'https://example.com/BlendParser/en/');
 assert.equal(detect({languages:['es-MX','en-US']}).redirect,null);
 assert.equal(detect({languages:[],language:'es-ES'}).redirect,null);
 assert.equal(detect({languages:['de-DE']}).redirect,'https://example.com/BlendParser/en/');
});
test('manual preference wins over browser; invalid storage is ignored',()=>{
 assert.equal(detect({saved:'es'}).redirect,null);
 assert.equal(detect({saved:'en',languages:['es-MX']}).redirect,'https://example.com/BlendParser/en/');
 assert.equal(detect({saved:'fr'}).redirect,'https://example.com/BlendParser/en/');
});
test('explicit English URLs remain shareable without detection redirects',()=>{
 assert.equal(detect({path:'en/docs.html#paleta',saved:'es',languages:['es-MX']}).redirect,null);
});
test('explicit query choices work with blocked storage and cannot loop',()=>{
 assert.equal(detect({path:'?lang=es',blocked:true}).redirect,null);
 assert.deepEqual(detect({path:'en/?lang=es',blocked:true}),{redirect:'https://example.com/BlendParser/?lang=es',choice:null});
 assert.deepEqual(detect({path:'?lang=en',languages:['es-MX']}),{redirect:'https://example.com/BlendParser/en/?lang=en',choice:'en'});
});
test('preserves the docs route, query, anchor and project hosting prefix',()=>{
 assert.equal(detect({path:'docs.html?source=link#paleta'}).redirect,'https://example.com/BlendParser/en/docs.html?source=link#paleta');
 assert.equal(detect({base:'/',path:'docs.html#pincel'}).redirect,'https://example.com/en/docs.html#pincel');
 assert.equal(detect({path:'en/docs.html?lang=es&source=link#paleta'}).redirect,'https://example.com/BlendParser/docs.html?lang=es&source=link#paleta');
});
test('does not redirect unrelated paths or fail when storage is unavailable',()=>{
 assert.equal(detect({path:'assets/icon.svg'}).redirect,null);
 assert.equal(detect({blocked:true}).redirect,'https://example.com/BlendParser/en/');
});
