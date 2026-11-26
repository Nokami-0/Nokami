import test from 'node:test';
import assert from 'node:assert/strict';

const hooks = {};
globalThis.Hooks = {on:(name,fn)=>{hooks[name]=fn;}, once:(name,fn)=>{hooks[name]=fn;}};
await import('../module/summon-size-lock.js');

test('fixed summon tokens keep their catalog footprint when placed, resized, or repaired', async () => {
  const scope = 'shinobi-no-sho-revamp';
  const changes = [];
  const actor = {
    isOwner:true, prototypeToken:{width:1,height:1}, system:{energias:{tamanho:'Medium'}},
    flags:{[scope]:{summonProfile:{size:{id:'medium'}},kuchiyoseSpecies:{name:'Fixed bird',fixedSize:'huge'}}},
    async update(data) {changes.push(data);}
  };
  const token = {id:'token', actor, actorLink:true, width:1, height:1, updateSource:data=>Object.assign(token,data)};
  hooks.preCreateToken(token);
  assert.deepEqual([token.width,token.height],[3,3]);
  const resize = {width:1,height:2,x:12};
  hooks.preUpdateToken(token,resize);
  assert.deepEqual(resize,{width:3,height:3,x:12});
  const flexible = {actor:{flags:{[scope]:{summonProfile:{species:'Toad'}}}}};
  const flexibleResize = {width:2,height:2};
  hooks.preUpdateToken(flexible,flexibleResize);
  assert.deepEqual(flexibleResize,{width:2,height:2});

  token.width = 1;
  token.height = 1;
  const scene = {tokens:[token], async updateEmbeddedDocuments(type, data) {
    assert.equal(type,'Token');
    assert.deepEqual(data,[{_id:'token',width:3,height:3}]);
    token.updateSource(data[0]);
  }};
  globalThis.game = {user:{isGM:true},users:{activeGM:{isSelf:true}},actors:[actor],scenes:[scene]};
  await hooks.ready();
  assert.equal(changes[0]['flags.shinobi-no-sho-revamp.summonProfile.size'].id,'huge');
  assert.equal(changes[0]['prototypeToken.width'],3);
  assert.deepEqual([token.width,token.height],[3,3]);
});
