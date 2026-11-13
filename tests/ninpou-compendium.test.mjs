import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {parseHTML} from 'linkedom';
const SYS='shinobi-no-sho-revamp';
const catalog=JSON.parse(fs.readFileSync(new URL('../integrated/data/sns-common-ninpou__items.json',import.meta.url)));
const hooks={};globalThis.Hooks={once:(name,cb)=>hooks[name]=cb,on(){}};globalThis.FormApplication=class{};globalThis.fetch=async()=>({ok:true,json:async()=>structuredClone(catalog)});
const {validateNinpouCatalog,ninpouFolderPath,ninpouItem,buildNinpouCompendium,filterNinpouEntries,ninpouBrowserMarkup,openNinpouBrowser}=await import('../module/ninpou-compendium.js');
const entry=id=>catalog.find(r=>r.id===id);
test('all 135 source-checked entries have explicit common eligibility and separated categories',()=>{
 assert.equal(validateNinpouCatalog(catalog).length,135);
 const counts={};for(const row of catalog){assert.ok(row.description.length>150);counts[row.element]=(counts[row.element]||0)+1;assert.equal(row.exclusiveTo.length,0);assert.ok(row.sourcePages);assert.ok(row.sourceBook);}
 assert.deepEqual(counts,{'non-elemental':23,doton:26,fuuton:25,katon:14,raiton:17,suiton:30});
 assert.equal(new Set(catalog.filter(r=>r.effectKey&&r.effectKey!=='optional-mist').map(r=>r.effectKey)).size,39);
});
test('restricted and duplicate entries fail validation before any compendium mutation',()=>{
 for(const patch of [{eligibility:'hijutsu'},{exclusiveTo:['Kekkei Genkai']},{exclusiveTo:['Kinjutsu']},{element:'mokuton'},{category:'elemental'}])assert.throws(()=>validateNinpouCatalog([{...catalog[0],...patch}]),/Restricted/);
 assert.throws(()=>validateNinpouCatalog([catalog[0],catalog[0]]),/duplicate/);
});
test('effects are present only for the powers explicitly permitting them',()=>{
 const has=(e,k)=>!!entry('effect:'+e+':'+k);
 assert.equal(has('non-elemental','sharpen'),false);assert.equal(has('katon','shackle'),false);assert.equal(has('raiton','barrier'),false);
 for(const e of ['non-elemental','doton','suiton'])assert.equal(has(e,'shackle'),true);
 assert.equal(has('fuuton','float'),true);assert.equal(has('katon','disaster'),false);
 for(const e of ['katon','raiton'])assert.equal(has(e,'ongoing-damage'),true);
 assert.match(entry('effect:raiton:lightning-blade').description,/not an access requirement/);
 assert.equal(entry('effect:non-elemental:optional-mist').optional,true);
});
test('correct effect levels and Advanced Guide revisions replace the old placeholders',()=>{
 for(const [key,level] of [['orb',2],['restraint',2],['spear',3],['ricochet',3],['destructive-breath',4],['explosive-wave',5],['shackle',6]])assert.equal(entry('effect:non-elemental:'+key).level,level);
 for(const key of ['orb','spear','energize','current','explosive-wave'])assert.equal(entry('effect:non-elemental:'+key).sourceBook,'Advanced Shinobi Guide');
 assert.match(entry('effect:non-elemental:spear').description,/Ignore 3 Hardness/);
});
test('native folders and index metadata preserve element and level distinctions',()=>{
 for(const r of catalog){const path=ninpouFolderPath(r),doc=ninpouItem(r);assert.equal(path[0],r.category==='non-elemental'?'Non-Elemental Ninpou':'Elemental Ninpou');assert.equal(doc.type,'elemento');assert.equal(doc.flags[SYS].hierarchy.level,r.level);assert.equal(doc.flags[SYS].hierarchy.element,r.element);assert.match(doc.system.descricao,/Source:/);assert.equal(doc.flags[SYS].compendiumUid,doc.flags[SYS].ninpouCatalogId);}
});
function setup(){
 const packs=new Map(),docs=[],folders=[];let next=0;
 const pack={collection:'world.sns-ninpou',locked:true,folders,getDocuments:async()=>docs,configure:async({locked})=>{pack.locked=locked}};
 const manual={id:'manual',name:'GM custom technique',getFlag:()=>null};docs.push(manual);
 globalThis.game={user:{isGM:true},packs:{get:k=>packs.get(k)}};
 globalThis.CompendiumCollection={createCompendium:async data=>{assert.equal(data.type,'Item');packs.set(pack.collection,pack);return pack}};
 globalThis.Folder={create:async data=>{const f={...data,id:'folder'+(++next)};folders.push(f);return f}};
 globalThis.Item={create:async data=>{const d={...data,id:'item'+(++next),getFlag:(_s,k)=>data.flags?.[SYS]?.[k]};docs.push(d);return d},deleteDocuments:async()=>{throw Error('Unexpected deletion')}};
 return {packs,pack,docs,folders,manual};
}
test('build creates all entries once, preserves manual edits/items, and restores lock',async()=>{
 const {pack,docs,manual}=setup();const first=await buildNinpouCompendium();assert.equal(first.added,135);assert.equal(pack.locked,true);assert.equal(docs.length,136);
 docs[1].name='GM renamed';const again=await buildNinpouCompendium();assert.equal(again.added,0);assert.equal(again.updated,0);assert.equal(docs[1].name,'GM renamed');assert.ok(docs.includes(manual));assert.equal(pack.locked,true);
});
test('only old generated placeholders are retired; manually created and restricted entries remain',async()=>{
 const {packs}=setup();const ids=[];let lock=true;
 packs.set('world.sns-techniques',{collection:'world.sns-techniques',get locked(){return lock},configure:async o=>lock=o.locked,getDocuments:async()=>[{id:'old',getFlag:()=> 'sns-general-ninpou-effects__items.json:0'},{id:'manual',getFlag:()=>null},{id:'clan',getFlag:()=> 'sns-basic-book-clans__items.json:0'}]});
 Item.deleteDocuments=async removed=>ids.push(...removed);const report=await buildNinpouCompendium();assert.deepEqual(ids,['old']);assert.equal(report.retired,1);assert.equal(lock,true);
});
test('GM permission and failures are enforced without leaving packs unlocked',async()=>{
 const {packs,pack}=setup();game.user.isGM=false;await assert.rejects(buildNinpouCompendium(),/Only a GM/);game.user.isGM=true;
 packs.set(pack.collection,pack);pack.getDocuments=async()=>{throw Error('Read failure')};await assert.rejects(buildNinpouCompendium(),/Read failure/);assert.equal(pack.locked,true);
});
test('browser has exactly two category tabs and its filters cannot mix elemental with non-elemental',()=>{
 const {document}=parseHTML(ninpouBrowserMarkup());assert.deepEqual([...document.querySelectorAll('[data-ninpou-tab]')].map(e=>e.textContent),['Non-Elemental Ninpou','Elemental Ninpou']);
 const entries=catalog.map((r,i)=>({_id:String(i),...ninpouItem(r)}));assert.equal(filterNinpouEntries(entries).length,23);
 const wind=filterNinpouEntries(entries,{category:'elemental',element:'fuuton'});assert.equal(wind.length,25);assert.ok(wind.every(r=>r.flags[SYS].hierarchy.element==='fuuton'));
 assert.equal(filterNinpouEntries(entries,{category:'elemental',element:'fuuton',level:'6',query:'sharpen'}).length,1);
});
