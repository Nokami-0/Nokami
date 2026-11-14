import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import H from 'handlebars';import {parseHTML} from 'linkedom';
import {validateSenjutsuCatalog,groupSenjutsuEntries,senjutsuPowerLevel,senjutsuParameters,senjutsuSheetContext,filterSenjutsuEntries,activateSenjutsuTab} from '../module/senjutsu.js';
const rows=JSON.parse(fs.readFileSync(new URL('../integrated/data/sns-senjutsu__items.json',import.meta.url)));const block=fs.readFileSync(new URL('../templates/senjutsu-tab.hbs',import.meta.url),'utf8');
test('33 sourced entries include all 9 spendable bonuses and 10 capacity milestones',()=>{
 assert.equal(validateSenjutsuCatalog(rows).length,33);assert.equal(rows.filter(r=>r.kind==='Benefit').length,10);assert.equal(rows.filter(r=>r.cost==='1 Senjutsu Chakra').length,9);assert.equal(rows.filter(r=>r.id.startsWith('capacity-')).length,10);assert.ok(rows.every(r=>r.restrictedTo==='Senjutsu'&&r.sourcePages.every(p=>p>=239&&p<=241)));
 assert.throws(()=>validateSenjutsuCatalog([...rows,rows[0]]));assert.throws(()=>validateSenjutsuCatalog([{...rows[0],restrictedTo:'Common'}]));
});
test('every level shows its matching chakra capacity without invented automatic powers',()=>{
 const groups=groupSenjutsuEntries(rows);assert.deepEqual(groups.map(g=>g.level),[1,2,3,4,5,6,7,8,9,10]);for(const g of groups)assert.ok(g.entries.some(r=>r.id==='capacity-'+g.level));
 assert.equal(rows.find(r=>r.id==='two-lives').level,6);assert.equal(rows.find(r=>r.id==='perfect').level,8);assert.equal(rows.find(r=>r.id==='mokuton8').level,8);assert.equal(rows.find(r=>r.id==='mokuton10').level,10);
});
test('prerequisite routes, recharge restrictions, bonus incompatibility and Two Lives exceptions are explicit',()=>{
 const text=id=>rows.find(r=>r.id===id).description;assert.match(text('prerequisites'),/Vigor 14/);assert.match(text('prerequisites'),/Slugs do not/);assert.match(text('prerequisites'),/Mokuton 8/);
 assert.match(text('strength'),/Does not stack/);assert.match(text('vitality'),/once per scene/);assert.match(text('vitality'),/cannot be used/);assert.match(text('experiments'),/Medicine 20 and Occultism 20/);assert.match(text('clones'),/Up to 2 clones/);
 assert.match(text('two-lives'),/Senjutsu 6/);assert.match(text('two-lives'),/NC 14/);assert.match(text('mokuton10'),/Senjutsu 10 and Mokuton 10/);
});
test('owned Senjutsu level reads source flags but effects do not increase the power level',()=>{
 const power={type:'poder',name:'Senjutsu (Hermit Technique)',system:{nivelUsado:8},flags:{}};const effect={type:'poder',name:'Two Lives',system:{nivelUsado:10},flags:{source:{hijutsu:'Senjutsu',category:'Techniques'}}};assert.equal(senjutsuPowerLevel({items:[power,effect]}),8);assert.equal(senjutsuPowerLevel({items:[effect]}),0);
 assert.deepEqual(senjutsuParameters(8,14),{powerLevel:8,pool:8,vigor:14,vigorMet:true});assert.equal(senjutsuParameters(6,13).vigorMet,false);assert.equal(senjutsuParameters(11,14),null);
});
test('unavailable data does not break actor sheets; reopening retries',async()=>{
 const original=console.error;console.error=()=>{};globalThis.fetch=async()=>({ok:false,status:404});const bad=await senjutsuSheetContext({items:[]});assert.match(bad.senjutsuError,/404/);assert.deepEqual(bad.senjutsuGroups,[]);
 globalThis.fetch=async()=>({ok:true,json:async()=>rows});const ok=await senjutsuSheetContext({items:[]});assert.equal(ok.senjutsuGroups.length,10);assert.equal(ok.senjutsuError,'');console.error=original;
});
test('level/type/search filtering selects the actual upgrade route',()=>{
 assert.deepEqual(filterSenjutsuEntries(rows,{level:10,kind:'Recharge'}).map(r=>r.id),['mokuton10']);assert.ok(filterSenjutsuEntries(rows,{query:'Senninka'}).some(r=>r.id==='experiments'));
});
test('tab renders all 33 cards, separately names ordinary and Senjutsu chakra, and grants no abilities',()=>{
 const context={senjutsuRules:rows.filter(r=>r.level===0),senjutsuGroups:groupSenjutsuEntries(rows),senjutsuStats:senjutsuParameters(8,14)};const html=H.compile(block)(context);const {document}=parseHTML(html);assert.equal(document.querySelectorAll('.sns-senjutsu-entry').length,33);assert.ok(html.includes('Senpou: Ryousei'));assert.ok(html.includes('Ordinary Chakra'));assert.ok(!html.includes('item-use'));assert.ok(!html.includes('name="senjutsu'));
 const malicious=H.compile(block)({...context,senjutsuRules:[{name:'<script>bad()</script>',description:'<img onerror="bad()">'}]});assert.ok(!malicious.includes('<script>bad()'));
});
test('filtering does not submit actor data and hides unrelated groups',()=>{
 const {document,window}=parseHTML(H.compile(block)({senjutsuRules:rows.filter(r=>r.level===0),senjutsuGroups:groupSenjutsuEntries(rows)}));
 const wrap=nodes=>({length:nodes.length,find:s=>wrap(nodes.flatMap(n=>[...n.querySelectorAll(s)])),val:()=>nodes[0]?.value||'',on:(events,cb)=>{for(const n of nodes)for(const e of events.split(' '))n.addEventListener(e,cb);},each:cb=>nodes.forEach((n,i)=>cb(i,n))});
 activateSenjutsuTab(wrap([document]));const select=document.querySelector('[data-senjutsu-filter=level]');for(const o of select.querySelectorAll('option'))o.selected=o.value==='10';let submits=0;document.addEventListener('change',()=>submits++);select.dispatchEvent(new window.Event('change',{bubbles:true}));const visible=[...document.querySelectorAll('.sns-senjutsu-entry')].filter(e=>!e.hidden);assert.equal(visible.length,2);assert.equal(submits,0);
});
