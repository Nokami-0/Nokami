import test from 'node:test';import assert from 'node:assert/strict';
import {parryDisadvantage,consumeParryDisadvantage,imposeParryDisadvantage} from '../module/parry-penalty.js';
function actor(owner=true){
 const applied=new Set();const a={isOwner:owner,effects:[],getFlag:(_id,key)=>applied.has(key),setFlag:async(_id,key)=>applied.add(key)};
 a.createEmbeddedDocuments=async(_type,rows)=>{for(const row of rows){const e={disabled:false,getFlag:(_id,key)=>row.flags['sonic-tag-team-heroes'][key],delete:async()=>{a.effects=a.effects.filter(x=>x!==e);}};a.effects.push(e);}};
 return a;
}
test('successful Parry penalty applies once, does not stack, consumes once',async()=>{
 const a=actor();assert.equal(parryDisadvantage(a),0);
 assert.equal(await imposeParryDisadvantage(a,'message1'),true);assert.equal(parryDisadvantage(a),1);
 await imposeParryDisadvantage(a,'message2');assert.equal(a.effects.length,1);
 await consumeParryDisadvantage(a);assert.equal(parryDisadvantage(a),0);
 assert.equal(await imposeParryDisadvantage(a,'message1'),false);assert.equal(parryDisadvantage(a),0);
 await imposeParryDisadvantage(a,'message3');assert.equal(parryDisadvantage(a),1);
});
test('nonowners cannot modify enemy and disabled penalties do not count',async()=>{
 const a=actor(false);await assert.rejects(imposeParryDisadvantage(a,'message'),/GM or attacker owner/);
 const b=actor();await imposeParryDisadvantage(b,'message');b.effects[0].disabled=true;assert.equal(parryDisadvantage(b),0);
});
