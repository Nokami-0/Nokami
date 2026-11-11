import test from 'node:test';import assert from 'node:assert/strict';import {equipmentError} from '../module/validation.js';
function actor(){const items=[{id:'a',name:'Armor',type:'gear',system:{equipped:true,slots:5,gearKind:'armor'}},{id:'b',name:'Armor2',type:'gear',system:{equipped:false,slots:2,gearKind:'armor'}},{id:'c',name:'Tool',type:'gear',system:{equipped:false,slots:1}}];items.get=id=>items.find(i=>i.id===id);return {type:'character',system:{gearSlots:6},items};}
test('editor and macro equip validation enforces slots',()=>{const a=actor();assert.match(equipmentError(a,'b',true),/slots/);assert.equal(equipmentError(a,'c',true),null);});
test('equipped gear slot edits cannot exceed limit',()=>{const a=actor();assert.match(equipmentError(a,'a',true,{slots:7}),/slots/);});
test('same kind rejected even within capacity',()=>{const a=actor();assert.match(equipmentError(a,'b',true,{slots:1}),/kind/);});
test('unequipping and NPCs do not inherit player caps',()=>{const a=actor();assert.equal(equipmentError(a,'b',false),null);a.type='npc';assert.equal(equipmentError(a,'b',true),null);});
test('disabled equipment cannot be equipped',()=>{const a=actor();assert.match(equipmentError(a,'c',true,{disabled:true}),/enable/);});
