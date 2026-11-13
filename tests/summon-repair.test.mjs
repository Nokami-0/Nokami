import test from 'node:test';import assert from 'node:assert/strict';
import {normalizeSummonProfile,summonStats} from '../module/summon-rules.js';
globalThis.Hooks={once(){}};
const {repairSummonSheet}=await import('../module/summon-repair.js');
test('legacy skill strings and missing size normalize without losing notes',()=>{
 const old={species:'Spider',skills:'Athletics, Search',notes:'keep'};
 const p=normalizeSummonProfile(old);assert.deepEqual(p.skills,['Athletics','Search']);assert.equal(p.size.label,'Unspecified');assert.equal(p.notes,'keep');assert.equal(old.size,undefined);
 assert.equal(summonStats(old,4,{for:3,per:2},30,{atletismo:{attr:'for'},procurar:{attr:'per'}},{}).skills.atletismo,3);
});
test('missing or string size does not crash summon sheet context',async()=>{
 const {summonSheetContext}=await import('../module/summon-sheet.js');
 for(const size of [undefined,'Huge',{label:'Huge'}]){const c=summonSheetContext({getFlag:(_s,k)=>k==='summonProfile'?{species:'Doki',skills:'Athletics',size}:null,system:{}},new Map());assert.equal(c.summonProfile.size.label,size?'Huge':'Unspecified');assert.deepEqual(c.summonProfile.skills,['Athletics']);}
});
function actor(sheet,profile=true,owner=true){const cleared=[];return {cleared,isOwner:owner,getFlag:(scope,key)=>scope==='core'?sheet:profile?{}:null,unsetFlag:async(s,k)=>cleared.push([s,k])};}
test('repair stale stored sheet override on a summon or token actor',async()=>{const a=actor('old-system.RemovedSheet');assert.equal(await repairSummonSheet(a,{'shinobi-no-sho-revamp.ShinobiActorSheet':{cls:class{}}}),true);assert.deepEqual(a.cleared,[['core','sheetClass']]);});
test('preserve valid custom sheets, ordinary actors, and actors without permission',async()=>{for(const a of [actor('custom.Valid'),actor('old.Missing',false),actor('old.Missing',true,false)]){assert.equal(await repairSummonSheet(a,{'custom.Valid':{cls:class{}}}),false);assert.equal(a.cleared.length,0);}});
test('sheet repairs do not dismiss zero-HP summon tokens; explicit vitality changes still do',async()=>{
 const fs=await import('node:fs'),vm=await import('node:vm');const hooks={},deleted=[];
 const c={Hooks:{once(){},on:(n,f)=>hooks[n]=f},game:{user:{isGM:true},scenes:[{tokens:[{id:'token',actorId:'summon',getFlag:()=>true}],deleteEmbeddedDocuments:async(type,ids)=>deleted.push(ids)}]}};
 vm.createContext(c);vm.runInContext(fs.readFileSync(new URL('../module/kuchiyose-engine.js',import.meta.url),'utf8').replace(/^import .*;$/gm,'').replace(/export /g,''),c);
 const a={id:'summon',getFlag:()=>({species:'Toad'}),system:{energias:{vitalidade:{value:0}}}};
 await hooks.updateActor(a,{'flags.core.-=sheetClass':null});assert.equal(deleted.length,0);
 await hooks.updateActor(a,{'system.energias.vitalidade.value':0});assert.equal(deleted.length,1);
});
