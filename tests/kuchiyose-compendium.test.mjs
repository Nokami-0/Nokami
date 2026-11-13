import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const SYS='shinobi-no-sho-revamp';
const rows=JSON.parse(fs.readFileSync(new URL('../integrated/data/sns-kuchiyose-actors__summons.json',import.meta.url),'utf8'));
globalThis.Hooks={once(){},on(){}};
globalThis.FormApplication=class {static get defaultOptions(){return{}}};
globalThis.foundry={utils:{mergeObject:(a,b)=>({...a,...b})}};
globalThis.fetch=async()=>({ok:true,json:async()=>structuredClone(rows)});
const {buildKuchiyoseTemplate,loadKuchiyoseSpecies}=await import('../module/kuchiyose-engine.js');
const {buildKuchiyoseCompendium}=await import('../module/kuchiyose-compendium.js');
test('all 29 species produce sourced editable Actor templates with valid artwork',async()=>{
 assert.equal((await loadKuchiyoseSpecies()).length,29);
 for(const row of rows){
  const data=buildKuchiyoseTemplate(row);
  assert.equal(data.name,row.name);assert.equal(data.type,'personagem');assert.equal(data.flags[SYS].summonTemplate,true);
  assert.equal(data.flags[SYS].summonProfile.attributeAllocationRequired,true);
  assert.equal(data.flags[SYS].kuchiyoseSpecies.source,row.source);
  assert.equal(data.prototypeToken.texture.src,data.img);assert.ok(data.system.cabecalho.nc>=4);
  assert.ok(fs.existsSync(new URL('../'+data.img.replace('systems/'+SYS+'/',''),import.meta.url)),data.img);
  assert.ok(data.items.some(i=>i.flags[SYS]?.summonReference));
  const allowed=data.items.filter(i=>i.flags[SYS]?.summonAllowedAptitude);assert.ok(allowed.every(i=>i.system.descricao.includes('OPTION')));
 }
});
test('spider attacks, Doki variants and source-fixed sizes are preserved',()=>{
 const spider=buildKuchiyoseTemplate(rows.find(r=>r.name==='Spider (ordinary)'));assert.ok(spider.items.some(i=>i.name==='Bite (Piercing)'));assert.ok(spider.items.some(i=>i.name==='Body Strike (Bludgeoning)'));
 const doki=buildKuchiyoseTemplate(rows.find(r=>r.name==='Doki (Claws)'));assert.ok(doki.items.some(i=>i.name==='Tekko-Kagi — Pair (Slashing/Piercing)'));assert.equal(doki.prototypeToken.width,3);
 const animal=buildKuchiyoseTemplate(rows.find(r=>r.name==='Panda'));assert.equal(animal.prototypeToken.width,4);
});
test('compendium builds all species once, restores lock and preserves edited entries',async()=>{
 let pack;const docs=[],folders=[];let worldCreates=0;
 globalThis.game={user:{isGM:true},packs:{get:()=>pack}};
 globalThis.CompendiumCollection={createCompendium:async options=>{assert.equal(options.type,'Actor');return pack={collection:'world.sns-kuchiyose',locked:true,folders,configure:async o=>{pack.locked=o.locked},getDocuments:async()=>docs};}};
 globalThis.Folder={create:async(data,options)=>{assert.equal(options.pack,pack.collection);const folder={id:'folder'+folders.length,...data};folders.push(folder);return folder;}};
 globalThis.Actor={create:async(data,options)=>{if(!options?.pack)worldCreates++;docs.push({...data,getFlag:(_id,key)=>data.flags[SYS]?.[key]});}};
 const first=await buildKuchiyoseCompendium();assert.equal(first.added,29);assert.equal(pack.locked,true);assert.equal(worldCreates,0);
 docs[0].name='GM custom edit';const second=await buildKuchiyoseCompendium();assert.equal(second.added,0);assert.equal(second.existing,29);assert.equal(docs[0].name,'GM custom edit');assert.equal(docs.length,29);assert.ok(folders.some(f=>f.name==='Animal Path (Rinnegan)'));
});
test('non-GMs cannot build compendium',()=>{
 game.user.isGM=false;assert.throws(()=>buildKuchiyoseCompendium(),/Only the GM/);game.user.isGM=true;
});
test('an interrupted build restores the original pack lock',async()=>{
 game.packs.get=()=>({collection:'world.sns-kuchiyose',locked:true,folders:[],configure:async o=>{globalThis.finalLock=o.locked},getDocuments:async()=>{throw Error('Simulated read failure')}});
 await assert.rejects(buildKuchiyoseCompendium(),/Simulated/);assert.equal(globalThis.finalLock,true);
});

test('every Doki has an unarmed option and its correct carried weapon',()=>{
 for(const species of rows.filter(r=>r.dokiWeapon)){
  const template=buildKuchiyoseTemplate(species);
  const unarmed=template.items.filter(i=>i.name==='Unarmed Strike (Bludgeoning)');
  assert.equal(unarmed.length,1);assert.equal(unarmed[0].system.weaponCategory,'natural');assert.equal(unarmed[0].system.weaponDamage,0);
  if(species.dokiWeapon==='club'){const club=template.items.find(i=>i.name==='Club (Bludgeoning)');assert.equal(club.system.weaponDamage,2);assert.equal(club.system.quantidade,1);}
  if(species.dokiWeapon==='claws'){const pair=template.items.find(i=>i.flags?.[SYS]?.dokiLoadoutKey==='tekko-pair');assert.equal(pair.system.quantidade,2);assert.equal(pair.system.weaponDamage,3);assert.equal(pair.system.weaponBonus,0);assert.match(pair.system.descricao,/Ambidexterity/);}
 }
});
test('Doki migration updates only generated weapons, adds unarmed once, preserves stats and custom gear',async()=>{
 const {syncDokiLoadout}=await import('../module/doki-equipment.js');
 const species=rows.find(r=>r.dokiWeapon==='club');
 const flags={summonProfile:{species:species.name,nc:14}},custom={name:'GM custom charm',system:{note:'preserve'}};
 const club={name:'Club (Bludgeoning)',system:{weaponDamage:0},flags:{[SYS]:{summonAttack:true}},update:async function(patch){Object.assign(this,patch);}};
 const a={system:{cabecalho:{nc:14},attributes:{strength:8}},items:[club,custom],getFlag:(_s,k)=>flags[k],setFlag:async(_s,k,v)=>{flags[k]=v},createEmbeddedDocuments:async(_type,items)=>a.items.push(...items)};
 assert.deepEqual(await syncDokiLoadout(a,species),{added:1,updated:1});
 assert.equal(club.system.weaponDamage,2);assert.ok(a.items.includes(custom));assert.equal(custom.system.note,'preserve');assert.equal(a.system.attributes.strength,8);
 assert.deepEqual(await syncDokiLoadout(a,species),{added:0,updated:0});assert.equal(a.items.length,3);
});
test('summon damage uses Strength minus three and NC-below-four attacks are nondamaging',async()=>{
 const {dokiEquipment,summonEquipmentBase}=await import('../module/doki-equipment.js');
 const club=dokiEquipment(rows.find(r=>r.dokiWeapon==='club'),14);
 assert.equal(summonEquipmentBase(8,club[0]),5);assert.equal(summonEquipmentBase(8,club[1]),5);
 assert.equal(summonEquipmentBase(1,club[1]),3);
 assert.ok(dokiEquipment(rows.find(r=>r.dokiWeapon==='claws'),3).every(i=>i.flags[SYS].noDamage));
});

