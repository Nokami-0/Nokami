import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import H from 'handlebars';import {parseHTML} from 'linkedom';
import {validateTensaiCatalog,groupTensaiEntries,tensaiPowerSummary,tensaiSheetContext,filterTensaiEntries,activateTensaiTab} from '../module/tensai.js';
const rows=JSON.parse(fs.readFileSync(new URL('../integrated/data/sns-tensai__items.json',import.meta.url)));const block=fs.readFileSync(new URL('../templates/tensai-tab.hbs',import.meta.url),'utf8');
test('38 sourced reference cards include progression, limited and special aptitudes, clan references and Hiraishin',()=>{
 assert.equal(validateTensaiCatalog(rows).length,38);assert.equal(rows.filter(r=>r.kind==='Level Choice').length,10);assert.equal(rows.filter(r=>r.kind==='Restricted Aptitude').length,3);assert.equal(rows.filter(r=>r.kind==='Special Aptitude').length,8);assert.equal(rows.filter(r=>r.kind==='Clan Reference').length,3);assert.equal(rows.filter(r=>r.kind==='Technique').length,8);
 assert.throws(()=>validateTensaiCatalog([...rows,rows[0]]));assert.throws(()=>validateTensaiCatalog([{...rows[0],restrictedTo:'Common Ninpou'}]));
});
test('Versatility progression preserves both level-one effects and the two-consecutive limit',()=>{
 const g=groupTensaiEntries(rows);assert.deepEqual(g.map(x=>x.level),[1,2,3,4,5,6,7,8,9,10]);assert.ok(g.every(x=>x.entries.some(r=>r.kind==='Level Choice')));const base=rows.find(r=>r.id==='versatility').description;assert.match(base,/2 different powers/);assert.match(base,/both chosen powers/);assert.match(base,/2 consecutive/);assert.match(rows.find(r=>r.id==='hibon').description,/prevents purchasing Versatility/);
});
test('special aptitude levels are not misrepresented as Versatility levels; clan sources remain distinct',()=>{
 assert.ok(rows.filter(r=>r.kind==='Special Aptitude').every(r=>r.level===0));const clans=rows.filter(r=>r.kind==='Clan Reference');assert.deepEqual(clans.map(r=>r.clan),['Hatake','Sarutobi','Senju']);assert.deepEqual(clans.map(r=>r.sourcePages[0]),[155,174,175]);assert.match(rows.find(r=>r.id==='special-limit').description,/up to 2 different/);assert.match(rows.find(r=>r.id==='special-limit').description,/do not consume another|does not consume another|do not use|does not use/);
});
test('Hiraishin retains seals, costs, second-step requirements and ranged critical-hit exception',()=>{
 const text=id=>rows.find(r=>r.id===id).description;assert.match(text('hiraishin-seals'),/10 × 10 cm/);assert.match(text('hiraishin-travel'),/Immense \+9/);assert.match(text('hiraishin-travel'),/2 Chakra/);assert.match(rows.find(r=>r.id==='second-step').prerequisites,/Intelligence 16/);assert.match(text('dorai'),/200 m/);assert.match(text('dorai'),/critical hit/);
});
test('owned power summary reads Versatility and Hibon without changing actor data',()=>{
 const a={items:[{type:'poder',name:'Versatility',system:{nivelUsado:6}},{type:'poder',name:'Hibon Ninpou (Unique Ninja Art)',system:{nivelUsado:5}},{type:'aptidao',name:'Perfect Control'}]};const before=JSON.stringify(a);assert.deepEqual(tensaiPowerSummary(a).map(r=>[r.route,r.level]),[['Versatility',6],['Hibon Ninpou',5]]);assert.equal(JSON.stringify(a),before);
});
test('failed load preserves sheet opening and retries on reopen',async()=>{
 const error=console.error;console.error=()=>{};globalThis.fetch=async()=>({ok:false,status:404});const bad=await tensaiSheetContext({items:[]});assert.match(bad.tensaiError,/404/);globalThis.fetch=async()=>({ok:true,json:async()=>rows});const good=await tensaiSheetContext({items:[]});assert.equal(good.tensaiError,'');assert.equal(good.tensaiGroups.length,10);console.error=error;
});
test('tab renders 38 escaped cards and keeps purchases, seals and teleportation manual',()=>{
 const c={tensaiRules:rows.filter(r=>r.level===0),tensaiGroups:groupTensaiEntries(rows)};const html=H.compile(block)(c);const {document}=parseHTML(html);assert.equal(document.querySelectorAll('.sns-tensai-entry').length,38);assert.ok(html.includes('Sarutobi'));assert.ok(!html.includes('item-use'));assert.ok(!html.includes('name="tensai'));
 const escaped=H.compile(block)({...c,tensaiRules:[{name:'<script>bad()</script>',description:'<img onerror="bad()">'}]});assert.ok(!escaped.includes('<script>bad()'));
});
test('exact category, level and search filters do not submit actor data',()=>{
 assert.equal(filterTensaiEntries(rows,{kind:'Clan Reference'}).length,3);assert.equal(filterTensaiEntries(rows,{level:10}).length,1);
 const {document,window}=parseHTML(H.compile(block)({tensaiRules:rows.filter(r=>r.level===0),tensaiGroups:groupTensaiEntries(rows)}));const wrap=nodes=>({length:nodes.length,find:s=>wrap(nodes.flatMap(n=>[...n.querySelectorAll(s)])),val:()=>nodes[0]?.value||'',on:(events,cb)=>{for(const n of nodes)for(const e of events.split(' '))n.addEventListener(e,cb);},each:cb=>nodes.forEach((n,i)=>cb(i,n))});activateTensaiTab(wrap([document]));const level=document.querySelector('[data-tensai-filter=level]');for(const o of level.querySelectorAll('option'))o.selected=o.value==='10';let bubbled=0;document.addEventListener('change',()=>bubbled++);level.dispatchEvent(new window.Event('change',{bubbles:true}));assert.equal([...document.querySelectorAll('.sns-tensai-entry')].filter(e=>!e.hidden).length,1);assert.equal(bubbled,0);
});

test('restricted and special sections separate all three restricted aptitudes from special picks and upgrades',()=>{assert.deepEqual(filterTensaiEntries(rows,{kind:'Restricted Aptitude'}).map(r=>r.id),['fast-learning','natural-talent','advanced-technique']);const special=filterTensaiEntries(rows,{kind:'special'});assert.equal(special.length,12);assert.ok(special.some(r=>r.id==='special-limit'));assert.equal(special.filter(r=>r.kind==='Clan Reference').length,3);assert.ok(special.some(r=>r.id==='thunder-god-2'));assert.ok(!special.some(r=>r.kind==='Restricted Aptitude'));});
test('Restricted and Special section buttons display their cards and reset old level filters',()=>{
 const {document,window}=parseHTML(H.compile(block)({tensaiRules:rows.filter(r=>r.level===0),tensaiGroups:groupTensaiEntries(rows)}));
 const wrap=nodes=>({length:nodes.length,find:s=>wrap(nodes.flatMap(n=>[...n.querySelectorAll(s)])),val:value=>{if(value===undefined)return nodes[0]?.value||'';for(const n of nodes){if(n.tagName==='SELECT')for(const o of n.querySelectorAll('option'))o.selected=o.value===value;else n.value=value;}},on:(events,cb)=>{for(const n of nodes)for(const e of events.split(' '))n.addEventListener(e,cb);},each:cb=>nodes.forEach((n,i)=>cb(i,n))});
 activateTensaiTab(wrap([document]));for(const [key,count]of [['Restricted Aptitude',3],['special',12],['',38]]){const button=[...document.querySelectorAll('[data-tensai-section]')].find(b=>b.dataset.tensaiSection===key);button.dispatchEvent(new window.Event('click',{bubbles:true}));assert.equal([...document.querySelectorAll('.sns-tensai-entry')].filter(e=>!e.hidden).length,count);assert.equal(button.getAttribute('aria-pressed'),'true');}
});
