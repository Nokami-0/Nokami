import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import H from 'handlebars';import {parseHTML} from 'linkedom';
import {validateMagenCatalog,groupMagenEntries,magenPowerLevel,magenParameters,magenSheetContext,filterMagenEntries,activateMagenTab} from '../module/magen.js';
const rows=JSON.parse(fs.readFileSync(new URL('../integrated/data/sns-magen__items.json',import.meta.url)));const SYS='shinobi-no-sho-revamp';
test('all core rules, 16 base effects, 22 evolutions and Fluid Illusion are catalogued and restricted',()=>{
 assert.equal(validateMagenCatalog(rows),rows);assert.equal(rows.length,45);assert.equal(rows.filter(r=>r.kind==='Rules').length,6);assert.equal(rows.filter(r=>r.baseEffect).length,22);assert.equal(rows.filter(r=>r.level>0&&!r.baseEffect&&r.kind!=='Limited Aptitude').length,16);assert.equal(rows.filter(r=>r.kind==='Limited Aptitude').length,1);
 assert.equal(rows.find(r=>r.id==='false-speed').chakraCost,2);assert.equal(rows.find(r=>r.id==='false-speed').level,3);
 for(const r of rows){assert.equal(r.restrictedTo,'Magen');assert.ok(r.sourcePages.every(p=>p>=233&&p<=238));assert.ok(r.description.length>40);}
});
test('catalog rejects duplicate IDs, out-of-range levels and common/unrestricted contamination',()=>{
 assert.throws(()=>validateMagenCatalog([...rows,rows[0]]));for(const change of [{level:11},{restrictedTo:'Common Ninpou'},{chakraCost:-1},{kind:'Elemental'}])assert.throws(()=>validateMagenCatalog([{...rows[0],...change}]));
});
test('ten level groups contain actual effects/evolutions and exclude Fluid Illusion',()=>{
 const groups=groupMagenEntries(rows);assert.deepEqual(groups.map(g=>g.level),[1,2,3,4,5,6,7,8,9,10]);assert.ok(groups.every(g=>g.entries.length));assert.equal(groups.flatMap(g=>g.entries).length,38);assert.ok(groups.flatMap(g=>g.entries).every(r=>r.kind!=='Limited Aptitude'));
 const at=level=>groups.find(g=>g.level===level).entries.map(r=>r.id);
 assert.deepEqual(at(1),['ecstasy']);assert.ok(at(10).includes('false-position-10'));assert.ok(at(9).includes('paralyze-9'));
});
test('DC uses POWER level and includes Deep Illusion only once; False Speed costs 2',()=>{
 assert.deepEqual(magenParameters(6,12),{powerLevel:6,intelligence:12,resistanceDC:21,touchDC:20,range:17});assert.equal(magenParameters(5,13).resistanceDC,21);assert.equal(magenParameters(11,12),null);
});
test('owned Magen power reads legacy source metadata without granting or changing any items',()=>{
 const items=[{name:'Magen (Demonic Illusion)',type:'poder',system:{nivelUsado:7},flags:{'sns-basic-book-hijutsu':{hijutsu:'Magen',category:'Restricted Powers'}}},{name:'Paralyze',type:'poder',system:{nivelUsado:10},flags:{[SYS]:{hierarchy:{owner:'Magen',kind:'Techniques'}}}}];
 const snapshot=JSON.stringify(items);assert.equal(magenPowerLevel({items}),7);assert.equal(magenPowerLevel({items:[items[1]]}),0);assert.equal(JSON.stringify(items),snapshot);
});
test('failed reference load never prevents sheet opening and a later reopen retries',async()=>{
 const old=console.error;console.error=()=>{};globalThis.fetch=async()=>({ok:false,status:404});const result=await magenSheetContext({items:[]});assert.match(result.magenError,/404/);assert.deepEqual(result.magenGroups,[]);
 globalThis.fetch=async()=>({ok:true,json:async()=>rows});const recovered=await magenSheetContext({items:[]});assert.equal(recovered.magenError,'');assert.equal(recovered.magenGroups.length,10);console.error=old;
});
test('filters select exact level, illusion type and searchable upgrades',()=>{
 assert.deepEqual(filterMagenEntries(rows,{level:1}).map(r=>r.id),['ecstasy']);assert.deepEqual(filterMagenEntries(rows,{level:10,query:'direction'}).map(r=>r.id),['false-position-10']);assert.ok(filterMagenEntries(rows,{kind:'Phantom'}).every(r=>r.kind==='Phantom'));
});
const block=fs.readFileSync(new URL('../templates/magen-tab.hbs',import.meta.url),'utf8');
test('Magen tab renders every effect and Limited Aptitude with escaped source text',()=>{
 const context={magenGroups:groupMagenEntries(rows),magenRules:rows.filter(r=>r.kind==='Rules'),magenMeta:rows.filter(r=>r.kind==='Limited Aptitude')};const html=H.compile(block)(context);const {document}=parseHTML(html);
 assert.equal(document.querySelectorAll('.sns-magen-entry').length,45);assert.equal(document.querySelectorAll('[data-magen-level="10"]').length,5);assert.ok(html.includes('Fluid Illusion'));assert.ok(!html.includes('item-use'));assert.ok(!html.includes('name="magen-filter'));
 const malicious=H.compile(block)({...context,magenMeta:[{name:'<script>bad()</script>',description:'<img onerror="bad()">',level:6,kind:'Limited Aptitude'}]});assert.ok(!malicious.includes('<script>bad()'));
});
test('Magen tab DOM filtering hides unmatched groups without submitting the actor form',()=>{
 const {document,window}=parseHTML(H.compile(block)({magenGroups:groupMagenEntries(rows),magenRules:rows.filter(r=>r.kind==='Rules'),magenMeta:rows.filter(r=>r.kind==='Limited Aptitude')}));
 function wrap(nodes){return {length:nodes.length,find:s=>wrap(nodes.flatMap(n=>[...n.querySelectorAll(s)])),val:()=>nodes[0]?.value||'',on:(events,cb)=>{for(const n of nodes)for(const e of events.split(' '))n.addEventListener(e,cb);},each:cb=>nodes.forEach((n,i)=>cb(i,n))};}
 activateMagenTab(wrap([document]));const level=document.querySelector('[data-magen-filter=level]');for(const o of level.querySelectorAll('option'))o.selected=o.value==='10';let bubbled=0;document.addEventListener('change',()=>bubbled++);level.dispatchEvent(new window.Event('change',{bubbles:true}));const visible=[...document.querySelectorAll('.sns-magen-entry')].filter(e=>!e.hidden);assert.equal(visible.length,5);assert.equal(bubbled,0);assert.ok(visible.every(e=>e.dataset.magenLevel==='10'));
});
