import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
globalThis.Hooks={once(){}};
const {restrictedEntries,buildRestrictedPowers}=await import('../module/restricted-powers.js');
const SYS='shinobi-no-sho-revamp';
const catalogs=Object.fromEntries(['Magen','Senjutsu','Tensai'].map(n=>[n,JSON.parse(fs.readFileSync(new URL('../integrated/data/sns-'+n.toLowerCase()+'__items.json',import.meta.url)))]));
const entries=restrictedEntries(catalogs);
test('all source cards plus four purchasable power routes in one pack',()=>{
 assert.equal(entries.length,120);assert.equal(new Set(entries.map(e=>e.key)).size,120);
 assert.deepEqual(entries.filter(e=>e.doc.type==='poder').map(e=>e.doc.name),['Magen','Senjutsu','Versatility','Hibon Ninpou']);
 for(const e of entries){assert.ok(['poder','aptidao','elemento'].includes(e.doc.type));assert.ok(e.doc.system.descricao);assert.ok(['Magen','Senjutsu','Tensai','Restricted Aptitudes','Special Aptitudes'].includes(e.path[0]));}
});
test('level, cost, source, aptitude types and clan eligibility preserved',()=>{
 for(const [owner,rows]of Object.entries(catalogs))for(const row of rows){const e=entries.find(e=>e.key===owner+':'+row.id);assert.equal(e.doc.flags[SYS].requiredLevel,row.level);assert.ok(e.doc.system.descricao.includes(row.description));for(const page of row.sourcePages)assert.ok(e.doc.system.descricao.includes(String(page)));if(/Aptitude/.test(row.kind))assert.equal(e.doc.type,'aptidao');if(row.clan){assert.equal(e.doc.flags[SYS].clan,row.clan);assert.ok(e.doc.system.descricao.includes('original clan restrictions'));}}
 assert.ok(entries.some(e=>e.path.includes('Special Aptitudes')));assert.ok(entries.some(e=>e.path.includes('Restricted Aptitudes')));
});
function setup(fail=false){const docs=[],folders=[];const pack={collection:'world.sns-restricted-powers',locked:true,folders,async configure({locked}){this.locked=locked;},async getDocuments(){return docs;}};globalThis.game={user:{isGM:true},packs:new Map([[pack.collection,pack]])};globalThis.fetch=async url=>({ok:true,json:async()=>catalogs[Object.keys(catalogs).find(n=>url.includes(n.toLowerCase()))]});globalThis.Folder={async create(data){const f={...data,id:'folder'+folders.length};folders.push(f);return f;}};globalThis.Item={async create(data){if(fail)throw Error('write failed');docs.push(data);return data;}};return {pack,docs,folders};}
test('build is idempotent, preserves edits and creates navigable folders',async()=>{const {pack,docs,folders}=setup();await buildRestrictedPowers();assert.equal(docs.length,120);assert.equal(pack.locked,true);docs[0].name='Custom edit';await buildRestrictedPowers();assert.equal(docs.length,120);assert.equal(docs[0].name,'Custom edit');assert.equal(folders.filter(f=>!f.folder).length,5);for(const d of docs)assert.ok(folders.some(f=>f.id===d.folder));});
test('build restores lock after failed document creation',async()=>{const {pack}=setup(true);await assert.rejects(buildRestrictedPowers(),/write failed/);assert.equal(pack.locked,true);});
test('ordinary native Item drag/drop remains intact and reference tabs removed',()=>{const s=fs.readFileSync(new URL('../module/actor-sheet.js',import.meta.url),'utf8'),h=fs.readFileSync(new URL('../templates/actor-sheet.hbs',import.meta.url),'utf8');assert.match(s,/super\._onDropItem\(event, data\)/);for(const n of ['magen','senjutsu','tensai']){assert.ok(!h.includes('data-tab="'+n+'"'));assert.ok(!s.includes(n+'SheetContext'));}});

test('restricted and special aptitudes have distinct top-level sections and native aptitude types',()=>{
 const limited=entries.filter(e=>e.path[0]==='Restricted Aptitudes');
 const special=entries.filter(e=>e.path[0]==='Special Aptitudes'&&e.doc.type==='aptidao');
 assert.equal(limited.length,4);assert.equal(special.length,8);
 for(const e of [...limited,...special]){assert.equal(e.doc.type,'aptidao');assert.ok(e.doc.system.preRequisito);}
 const refs=entries.filter(e=>e.path[1]==='Clan References');assert.equal(refs.length,3);
 for(const e of refs){assert.equal(e.doc.flags[SYS].hierarchy.family,'Clan');assert.ok(e.doc.flags[SYS].restrictedReference);}
});
test('upgrade moves existing aptitude cards without overwriting edits or making duplicates',async()=>{
 const {pack,docs}=setup();await buildRestrictedPowers();
 const d=docs.find(d=>d.flags[SYS].restrictedUid==='Tensai:capacity');
 d.folder='legacy-folder';d.name='Edited capacity';d.system.descricao='Edited rules';
 let updates=0;d.update=async patch=>{Object.assign(d,patch);updates++;};
 await buildRestrictedPowers();assert.equal(updates,1);assert.equal(d.name,'Edited capacity');assert.equal(d.system.descricao,'Edited rules');assert.equal(docs.length,120);assert.equal(pack.locked,true);
 const f=pack.folders.find(f=>f.id===d.folder);assert.equal(f.name,'Tensai');assert.equal(pack.folders.find(p=>p.id===f.folder).name,'Special Aptitudes');
});
