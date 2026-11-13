import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {normalizeSummonProfile,summonStats,summonNCCap,summonQuantityLegal,skillKey,syncSummonSpecies,SUMMON_REVISION,summonRollRestriction} from '../module/summon-rules.js';
import {summonEquipmentBase,dokiEquipment} from '../module/doki-equipment.js';
const SYS='shinobi-no-sho-revamp';
const rows=JSON.parse(fs.readFileSync(new URL('../integrated/data/sns-kuchiyose-actors__summons.json',import.meta.url)));
globalThis.Hooks={once(){},on(){}};globalThis.fetch=async()=>({ok:true,json:async()=>rows});
const {buildKuchiyoseTemplate}=await import('../module/kuchiyose-engine.js');
test('all species contain verified skills, attacks, power choices and individually readable ability cards',()=>{
 assert.equal(rows.filter(r=>!r.specialSummon).length,29);
 for(const row of rows.filter(r=>!r.specialSummon)){
  assert.equal(row.verifiedRevision,2,row.name);assert.ok(row.skills.length>0,row.name);assert.ok(row.aptitudes.length>0,row.name);assert.ok(row.attackList.length>0,row.name);assert.ok(row.powerOptions,row.name);
  for(const skill of row.skills.split(','))assert.ok(skillKey(skill),row.name+': '+skill);
  const doc=buildKuchiyoseTemplate(row),f=i=>i.flags[SYS];
  assert.equal(doc.items.filter(i=>f(i).summonAttack).length,row.attackList.length,row.name);
  assert.equal(doc.items.filter(i=>f(i).summonTechnique).length,row.innateAbilities.length+1,row.name);
  assert.ok(doc.items.filter(i=>f(i).summonTechnique).every(i=>i.type==='aptidao'&&i.system.descricao.length>40));
  assert.equal(new Set(doc.items.map(i=>f(i).summonContentKey||f(i).dokiLoadoutKey)).size,doc.items.length,row.name);
 }
});
test('numerous species keep maximum NC, Doki trio costs one NC, ordinary pairs cost two',()=>{
 const p=n=>rows.find(s=>s.name===n);
 for(const n of ['Ninken (Ninja Dog)','Shark','Spider (ordinary)']){assert.equal(summonQuantityLegal(p(n),8),true);assert.equal(summonNCCap(p(n),8,2),16);assert.equal(summonNCCap(p(n),8,8),16);}
 assert.equal(summonNCCap(p('Doki (Club)'),8,3),15);assert.equal(summonNCCap(p('Toad / Frog'),8,2),14);
 assert.equal(summonQuantityLegal(p('Doki (Club)'),4),false);assert.equal(summonQuantityLegal(p('Slug (Katsuyu species)'),2),false);assert.equal(summonQuantityLegal(p('Bee Swarm (50 Bees)'),2),true);
});
test('species skills use full linked attribute; unlisted skills ignore purchased points; half Vitality and common penalties apply',()=>{
 const derived=summonStats({skills:['Athletics (Swimming)','Flight'],commonPenalty:-3},12,{for:8,agi:9,int:7},99,{atletismo:{attr:'for',pontos:10},voo:{attr:'agi'},arte:{attr:'int',pontos:10}},{corporal:11,esquiva:12});
 assert.deepEqual(derived,{vitality:50,skills:{atletismo:8,voo:9,arte:0},combat:{corporal:8,esquiva:9}});
 const low=summonStats({skills:['Athletics']},3,{for:3},25,{atletismo:{attr:'for'}},{corporal:6});assert.equal(low.vitality,13);assert.equal(low.skills.atletismo,0);assert.equal(low.combat.corporal,0);
});
test('Doki Intelligence is zero, Ninken have one Vitality, and martial equipment adds only one damage',()=>{
 assert.equal(summonStats({skills:['Poisoncraft'],intelligenceZero:true,oneVitality:true},14,{int:10},100,{veneficio:{attr:'int'}},{}).skills.veneficio,0);
 assert.equal(summonStats({oneVitality:true},14,{},100,{},{}).vitality,1);
 const pair=dokiEquipment(rows.find(s=>s.dokiWeapon==='claws'),14)[0];pair.system.weaponBonus=100;
 assert.equal(summonEquipmentBase(8,pair),6);assert.equal(summonEquipmentBase(8,{system:{weaponCategory:'simple',weaponDamage:99}}),5);
});
test('revision migration fills old world summons once without changing attributes, energies, names or custom gear',async()=>{
 const species=rows.find(s=>s.name==='Baku'),flags={summonProfile:{species:species.name,nc:12,commonPenalty:-3,notes:'GM custom note'}};
 let next=0;const add=data=>({...structuredClone(data),id:String(++next),update:async function(data){Object.assign(this,data)}});
 const custom=add({name:'Custom weapon',type:'equipamento',system:{weaponDamage:9},flags:{}});
 const actor={name:'My renamed Baku',system:{cabecalho:{nc:12},atributos:{for:{valor:12}},energias:{vitalidade:{value:3}}},items:[custom],getFlag:(_s,k)=>flags[k],setFlag:async(_s,k,v)=>flags[k]=v,createEmbeddedDocuments:async(_t,data)=>actor.items.push(...data.map(add)),deleteEmbeddedDocuments:async(_t,ids)=>actor.items=actor.items.filter(i=>!ids.includes(i.id))};
 const saved=structuredClone(actor.system);
 assert.equal(await syncSummonSpecies(actor,species,buildKuchiyoseTemplate),true);
 const count=actor.items.length;assert.ok(count>8);assert.ok(actor.items.includes(custom));assert.equal(custom.system.weaponDamage,9);assert.equal(actor.name,'My renamed Baku');assert.deepEqual(actor.system,saved);assert.equal(flags.summonProfile.notes,'GM custom note');assert.equal(flags.summonRulesRevision,SUMMON_REVISION);
 assert.equal(await syncSummonSpecies(actor,species,buildKuchiyoseTemplate),false);assert.equal(actor.items.length,count);
});
test('actual character derived-data method applies summon rules while keeping ordinary actor calculations',()=>{
 const source=fs.readFileSync(new URL('../module/shinobi.js',import.meta.url),'utf8');
 const cls=source.slice(source.indexOf('class ShinobiPersonagemData'),source.indexOf('class ShinobiPoderData'));
 const Model=vm.runInNewContext(cls+';ShinobiPersonagemData',{foundry:{abstract:{TypeDataModel:class{}}},normalizeSummonProfile,summonStats,game:{actors:new Map()},console});
 function model(profile){const m=new Model();Object.assign(m,{parent:{getFlag:()=>profile,items:[]},cabecalho:{nc:12},configuracoes:{},atributos:Object.fromEntries(['for','des','agi','per','vig','int','esp'].map(k=>[k,{valor:8}])),sociais:{},energias:{vitalidade:{},chakra:{},iniciativa:{pericia:'prontidao',atributo:'per',bonus:0},reacaoEsquiva:{pericia:'esquiva',fixo:0,bonus:0},deslocamento:{base:10,atributo:'agi',divisor:2,bonus:0}},defesas:{dureza:0},pericias:{atletismo:{attr:'for',pontos:5,outro:0},prontidao:{attr:'per',pontos:0,outro:0},arte:{attr:'int',pontos:6,outro:0},furtividade:{attr:'agi',pontos:0,outro:0}},combate:{corporal:{attr:'for',base:3,outro:0},esquiva:{attr:'agi',base:3,outro:0}},periciasSociais:{},calculadora:{},recursoExtra:{ativo:'nenhum'}});return m;}
 const ordinary=model();ordinary.prepareDerivedData();assert.equal(ordinary.energias.vitalidade.max,94);assert.equal(ordinary.pericias.atletismo.total,9);assert.equal(ordinary.combate.corporal.total,11);
 const summon=model({species:'Turtle',skills:['Athletics (Swimming)'],commonPenalty:-3});summon.prepareDerivedData();assert.equal(summon.energias.vitalidade.max,47);assert.equal(summon.pericias.atletismo.total,8);assert.equal(summon.pericias.arte.total,0);assert.equal(summon.combate.corporal.total,8);assert.equal(summon.defesas.durezaTotal,2);
});

test('Intelligence-zero and individual-bee automatic-failure rules block inappropriate rolls',()=>{
 assert.match(summonRollRestriction({intelligenceZero:true},14,'Intelligence'),/automatically fails/);
 assert.match(summonRollRestriction({intelligenceZero:true},14,'Art'),/automatically fails/);
 assert.match(summonRollRestriction({species:'Bee (Individual)'},4,'Melee Combat (MC)'),/self-defense/);
 assert.equal(summonRollRestriction({species:'Bee (Individual)'},4,'Dodge'),null);
});

