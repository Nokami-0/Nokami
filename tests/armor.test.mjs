import test from 'node:test';
import assert from 'node:assert/strict';
import {armorReduction,reduceArmorDamage} from '../module/armor.js';
const item=(name,system={},type='gear')=>({name,type,system:{equipped:true,...system}});
test('armor defaults, strongest only and explicit override',()=>{
 assert.equal(armorReduction([item('Light Armor')]),1);
 assert.equal(armorReduction([item('Medium Armor')]),2);
 assert.equal(armorReduction([item('Heavy Armor'),item('Light Armor')]),3);
 assert.equal(armorReduction([item('Heavy Armor',{damageReduction:0})]),0);
 assert.equal(armorReduction([item('Custom',{damageReduction:5})]),5);
});
test('unequipped, broken, disabled and non-equipment excluded',()=>{
 assert.equal(armorReduction([item('Heavy Armor',{equipped:false}),item('Heavy Armor',{broken:true}),item('Heavy Armor',{disabled:true}),item('Heavy Armor',{},'attack')]),0);
 assert.equal(armorReduction([item('Heavy Armor',{},'vehicleUpgrade')]),3);
});
test('reduction floors at zero; bypass and shield preserve incoming hit',()=>{
 assert.deepEqual(reduceArmorDamage(8,3),{incoming:8,prevented:3,damage:5});
 assert.equal(reduceArmorDamage(2,3).damage,0);
 assert.equal(reduceArmorDamage(8,3,{bypass:true}).damage,8);
 assert.equal(reduceArmorDamage(2,3,{shield:true}).damage,2);
 assert.equal(reduceArmorDamage(-5,3).damage,0);
});
