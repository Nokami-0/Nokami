import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {parseHTML} from 'linkedom';
const SYS='shinobi-no-sho-revamp';
const rows=JSON.parse(fs.readFileSync(new URL('../integrated/data/sns-sealing-medical__items.json',import.meta.url)));
globalThis.Hooks={once(){},on(){}};globalThis.FormApplication=class{};
const {validateSupportNinjutsuCatalog,ninpouFolderPath,ninpouItem,filterNinpouEntries,openNinpouBrowser}=await import('../module/ninpou-compendium.js');
const row=id=>rows.find(r=>r.id===id);
test('16 sourced cards cover storage, all six advanced seals, and medical techniques without Epic Seals',()=>{
 assert.equal(validateSupportNinjutsuCatalog(rows).length,16);assert.equal(rows.filter(r=>r.category==='fuuinjutsu').length,11);assert.equal(rows.filter(r=>r.category==='iryou').length,5);
 for(const r of rows){assert.ok(r.sourcePages);assert.ok(r.prerequisites);assert.ok(r.action);assert.ok(r.chakraCost);assert.ok(r.description.length>220);assert.equal(r.eligibility,'common');}
 const seals=rows.filter(r=>r.category==='fuuinjutsu'&&r.section==='Advanced Seals'&&r.kind==='Technique');assert.deepEqual(seals.map(r=>r.level),[3,4,5,6,7,8]);
 assert.ok(!rows.some(r=>/Shiki Fuujin|Shishou Fuuin|Keiyaku Fuuin|Byakugou|Souzou Saisei/.test(r.name)));
});
test('storage capacity, release rules, specific seal costs and trap restrictions are preserved',()=>{
 assert.match(row('fuuinjutsu:storage').description,/3 equipment compartments/);assert.match(row('fuuinjutsu:larger-storage').description,/6 equipment compartments/);
 assert.match(row('fuuinjutsu:storage-rules').description,/releasing jutsus always requires seals/);
 assert.match(row('fuuinjutsu:bakudan').chakraCost,/1 per tag.*half/);assert.match(row('fuuinjutsu:wana').description,/restricted powers cannot/);
 assert.match(row('fuuinjutsu:souin').description,/cannot reduce a creature below 1/);assert.match(row('fuuinjutsu:kekkai').description,/not a Kekkei Genkai/);
});
test('medical prerequisites, healing formula, self-healing threshold and treatment exceptions are documented',()=>{
 assert.match(row('iryou:power').prerequisites,/Medical Ninja aptitude; Spirit 6/);
 const healing=row('iryou:healing').description;assert.match(healing,/ceil\(Medicine \/ 2\)/);assert.match(healing,/Expert: Medicine/);assert.match(healing,/below level 4/);assert.match(healing,/bleeding/);
 assert.equal(row('iryou:mesu').level,6);assert.match(row('iryou:mesu').description,/After three hits/);assert.match(row('iryou:mesu').description,/Unarmed Block cannot/);
 assert.match(row('iryou:inyu').description,/Once per day/);assert.match(row('iryou:inyu').description,/critical hits or area attacks/);
 assert.equal(row('iryou:shousen').level,7);assert.match(row('iryou:shousen').description,/another failure makes the target unconscious/);
});
test('sealing and medical reference cards become properly indexed power items with stable browser identities',()=>{
 for(const r of rows){const doc=ninpouItem(r),meta=doc.flags[SYS].hierarchy;assert.equal(doc.type,'poder');assert.equal(meta.family,r.category==='fuuinjutsu'?'Fuuinjutsu':'Iryou Ninjutsu');assert.equal(meta.section,r.section);assert.equal(meta.ninpouCategory,r.category);assert.equal(doc.flags[SYS].compendiumUid,doc.flags[SYS].ninpouCatalogId);assert.ok(doc.system.caracteristicas.includes(r.prerequisites));assert.deepEqual(ninpouFolderPath(r).slice(0,2),[meta.family,r.section]);}
});
test('invalid categories, exclusive content and missing rules are rejected',()=>{
 for(const patch of [{category:'hijutsu'},{exclusiveTo:['Kinjutsu']},{section:'Epic Seals'},{level:10},{prerequisites:''}])assert.throws(()=>validateSupportNinjutsuCatalog([{...rows[0],...patch}]));
 assert.throws(()=>validateSupportNinjutsuCatalog([rows[0],rows[0]]),/duplicate/);
});
test('four-tab filtering isolates Fuuinjutsu sections and medical techniques',()=>{
 const entries=rows.map((r,i)=>({_id:String(i),...ninpouItem(r)}));
 assert.equal(filterNinpouEntries(entries,{category:'fuuinjutsu'}).length,11);assert.equal(filterNinpouEntries(entries,{category:'iryou'}).length,5);
 assert.equal(filterNinpouEntries(entries,{category:'fuuinjutsu',section:'Seals'}).length,3);assert.equal(filterNinpouEntries(entries,{category:'fuuinjutsu',section:'Advanced Seals',level:'8'}).length,1);
 assert.equal(filterNinpouEntries(entries,{category:'iryou',section:'Medical Techniques',level:'6'}).length,2);
 assert.equal(filterNinpouEntries(entries,{category:'elemental'}).length,0);
});
test('rendered browser switches tabs, resets stale filters, reads cards and emits draggable Item UUIDs',async()=>{
 const events=new WeakMap(),values=new WeakMap();let root,opened=null;
 class JQ{
  constructor(nodes){this.nodes=nodes;this.length=nodes.length;}
  find(s){return new JQ(this.nodes.flatMap(n=>[...n.querySelectorAll(s)]));}
  prop(k,v){this.nodes.forEach(n=>n[k]=v);return this;}
  val(v){if(v!==undefined){this.nodes.forEach(n=>values.set(n,String(v)));return this;}const n=this.nodes[0];if(values.has(n))return values.get(n);return n?.tagName==='SELECT'?(n.querySelector('option[selected]')||n.querySelector('option'))?.getAttribute('value')??(n.querySelector('option')?.textContent||''):n?.value||'';}
  html(s){this.nodes.forEach(n=>n.innerHTML=s);return this;}
  on(event,cb){for(const n of this.nodes){const map=events.get(n)||{};map[event]=cb;events.set(n,map);}return this;}
  each(cb){this.nodes.forEach((n,i)=>cb(i,n));return this;}
 }
 globalThis.jQuery=JQ;globalThis.$=node=>new JQ([node]);
 const entries=rows.map((r,i)=>({_id:String(i),...ninpouItem(r)}));
 globalThis.game={packs:{get:()=>({getIndex:async()=>entries,getDocument:async id=>({sheet:{render:()=>opened=id}})})}};
 globalThis.Dialog=class{constructor(options){this.options=options;}render(){root=parseHTML(this.options.content).document;this.options.render(new JQ([root]));return this;}};
 await openNinpouBrowser();
 const click=async selector=>{const n=root.querySelector(selector);assert.ok(n,selector);await events.get(n).click({currentTarget:n});};
 await click('[data-ninpou-tab="fuuinjutsu"]');assert.equal(root.querySelectorAll('[data-ninpou-id]').length,11);assert.equal(root.querySelector('[name="element"]').disabled,true);
 const select=root.querySelector('[name="section"]');values.set(select,'Advanced Seals');events.get(select).change();assert.equal(root.querySelectorAll('[data-ninpou-id]').length,7);
 await click('[data-ninpou-tab="iryou"]');assert.equal(root.querySelectorAll('[data-ninpou-id]').length,5);assert.equal(values.get(select),'');
 await click('.sns-ninpou-read');assert.ok(opened!==null);
 let payload;const item=root.querySelector('[draggable="true"]');events.get(item).dragstart({currentTarget:item,dataTransfer:{setData:(_type,value)=>payload=JSON.parse(value)}});assert.equal(payload.type,'Item');assert.match(payload.uuid,/^Compendium\.world\.sns-ninpou\.Item\./);
 assert.equal(root.querySelector('[data-ninpou-tab="iryou"]').getAttribute('aria-pressed'),'true');
});
