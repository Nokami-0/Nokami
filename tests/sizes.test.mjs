import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {SNS_SIZE_TABLE,NORMAL_SUMMON_SIZES,sizeById,isSummonSizeLegal,correctedSizeDetails,repairSummonSize,openSnsSizeReference} from '../module/sizes.js';
test('all ten distinct English names preserve the ten source rows and modifiers',()=>{
 assert.deepEqual(SNS_SIZE_TABLE.map(s=>s.label),['Minuscule','Tiny','Little','Small','Medium','Large','Huge','Immense','Colossal','Incredible']);
 assert.deepEqual(SNS_SIZE_TABLE.map(s=>s.str),[-7,-5,-3,-1,0,1,3,5,7,9]);assert.deepEqual(SNS_SIZE_TABLE.map(s=>s.reach),[1,1,1,1,1,2,3,4,5,6]);
 assert.deepEqual(SNS_SIZE_TABLE.map(s=>s.move),[-12,-9,-6,-3,0,3,6,9,12,15]);assert.ok(SNS_SIZE_TABLE.every(s=>s.height&&s.weight));
});
test('normal Kuchiyose uses the third size tier, not either smaller Tiny row',()=>{
 assert.deepEqual(NORMAL_SUMMON_SIZES,['child','small','medium','large','huge','gargantuan']);
 for(const size of ['minute','tiny','colossal','incredible','bad-id'])assert.equal(isSummonSizeLegal({},size,20),false,size);
 assert.equal(isSummonSizeLegal({},'child',13),false);assert.equal(isSummonSizeLegal({},'child',14),true);
 assert.equal(isSummonSizeLegal({},'small',8),true);assert.equal(isSummonSizeLegal({},'small',9),false);
 for(const [id,min]of [['large',12],['huge',14],['gargantuan',16]]){assert.equal(isSummonSizeLegal({},id,min-1),false);assert.equal(isSummonSizeLegal({},id,min),true);}
});
test('species-fixed exceptions and legacy IDs remain valid',()=>{
 assert.equal(isSummonSizeLegal({contract:'Bees'},'tiny',4,'tiny'),true);
 assert.equal(isSummonSizeLegal({contract:'Bees'},'child',14,'tiny'),false);
 assert.equal(isSummonSizeLegal({name:'Doki'},'huge',14,'huge'),true);
 assert.equal(sizeById('immense').id,'gargantuan');assert.equal(sizeById('little').id,'child');
 assert.equal(isSummonSizeLegal({},'immense',16),true);
});
test('size metadata repair preserves token footprint and all unrelated actor data',async()=>{
 const original={id:'gargantuan',label:'Huge',tokenSquares:6,custom:'keep'};const updates=[];
 const actor={isOwner:true,flags:{'shinobi-no-sho-revamp':{summonProfile:{size:original,notes:'keep'}}},system:{atributos:{for:{valor:9}},energias:{vitalidade:{value:40}}},update:async d=>updates.push(d)};
 const before=structuredClone(actor.system);assert.equal(await repairSummonSize(actor),true);assert.deepEqual(actor.system,before);
 const size=updates[0]['flags.shinobi-no-sho-revamp.summonProfile.size'];assert.equal(size.label,'Immense');assert.equal(size.tokenSquares,6);assert.equal(size.custom,'keep');assert.equal(size.strengthModifier,5);assert.equal(Object.keys(updates[0]).length,2);
 assert.equal(await repairSummonSize({isOwner:false,flags:actor.flags}),false);
});
test('full reference dialog displays all ten rows and NC thresholds',()=>{
 let content;globalThis.Dialog=class{constructor(data){content=data.content;}render(){return this;}};openSnsSizeReference();for(const s of SNS_SIZE_TABLE)assert.ok(content.includes(s.label));assert.match(content,/minimum NC 14/);
});
test('invalid NC sizes retain a visible error and the dropdown includes the correct six rows',()=>{
 const s=fs.readFileSync(new URL('../module/kuchiyose-engine.js',import.meta.url),'utf8');assert.match(s,/\[fixedSize\(profile\|\|\{\}\)\]:NORMAL_SUMMON_SIZES/);assert.match(s,/else html.find\('\.sns-size-info'\)/);
});
