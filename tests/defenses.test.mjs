import test from 'node:test';import assert from 'node:assert/strict';
import {blockDamage,parryOutcome} from '../module/defense-rules.js';
import {armorReduction,reduceArmorDamage} from '../module/armor.js';
import {applyDamage} from '../module/engine.js';
test('Power 4 blocks 4 damage, floors at zero and handles no power',()=>{
 assert.deepEqual(blockDamage(10,4),{incoming:10,prevented:4,damage:6});
 assert.equal(blockDamage(2,4).damage,0);assert.equal(blockDamage(10,0).damage,10);
});
test('armor follows Block once; full prevention does not damage HP or spill Rings',()=>{
 const armor=armorReduction([{type:'gear',name:'Heavy Armor',system:{equipped:true}}]);
 const reduced=reduceArmorDamage(blockDamage(10,4).damage,armor);
 assert.equal(reduced.damage,3);
 const zero=reduceArmorDamage(blockDamage(6,4).damage,armor).damage;
 const result=applyDamage({hp:20,rings:10,crits:0,pc:true},zero,{critical:false});
 assert.equal(result.hp,20);assert.equal(result.rings,10);assert.equal(result.crits,0);
});
test('Parry requires strictly more hits, grants one TP and respects cap',()=>{
 assert.deepEqual(parryOutcome(3,2,5),{success:true,tp:6});
 assert.deepEqual(parryOutcome(2,2,5),{success:false,tp:5});
 assert.deepEqual(parryOutcome(1,2,5),{success:false,tp:5});
 assert.deepEqual(parryOutcome(3,2,15),{success:true,tp:15});
 assert.equal(parryOutcome(0,0,5).success,false);
});
