import test from 'node:test';
import assert from 'node:assert/strict';
import {createSnsArea, deleteSnsAreas, snsAreas} from '../module/sns-area-preview.js';

const scope = 'shini-no-sho-altered';
const positioned = {t:'ray', x:100, y:150, distance:4, direction:0, width:1, fillColor:'#ff9900'};
const area = {name:'Test ray', actorId:'actor', itemId:'item', cleanup:'after-use'};

for (const generation of [12, 13, 14]) {
  test(`Foundry ${generation}: area creation and cleanup select the correct document type`, async () => {
    globalThis.game = {release:{generation}, user:{id:'player', isGM:false}};
    globalThis.CONST = {REGION_VISIBILITY:{ALWAYS:2}, DOCUMENT_OWNERSHIP_LEVELS:{OWNER:3}};
    const collection = [];
    const expectedType = generation === 14 ? 'Region' : 'MeasuredTemplate';
    const scene = {
      grid:{size:100, distance:2},
      [generation === 14 ? 'regions' : 'templates']: collection,
      async createEmbeddedDocuments(type, [data]) {
        assert.equal(type, expectedType);
        collection.push({id:'area', getFlag:(namespace,key)=>data.flags[namespace]?.[key]});
        return data;
      },
      async deleteEmbeddedDocuments(type, ids) {
        assert.equal(type, expectedType);
        assert.deepEqual(ids,['area']);
      }
    };

    const data = await createSnsArea(scene, positioned, area);
    if (generation === 14) {
      assert.deepEqual(data.shapes,[{type:'polygon', points:[100,125,300,125,300,175,100,175]}]);
      assert.equal(data.visibility, 2);
    } else assert.equal(data.t, 'ray');
    assert.equal(data.flags[scope].cleanup, 'after-use');
    assert.equal(snsAreas(scene, 'actor').length, 1);
    game.user.id = 'other-player';
    assert.equal(snsAreas(scene, 'actor').length, 0);
    game.user.isGM = true;
    await deleteSnsAreas(scene, snsAreas(scene, 'actor'));
  });
}
