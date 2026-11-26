import {lockedSummonSize, repairSummonSize} from './sizes.js';

Hooks.on('preCreateToken', token => {
  const size = lockedSummonSize(token.actor);
  if (size) token.updateSource({width:size.grid, height:size.grid});
});

Hooks.on('preUpdateToken', (token, changes) => {
  if (!('width' in changes || 'height' in changes || 'actorId' in changes)) return;
  const actor = changes.actorId && changes.actorId !== token.actorId
    ? game.actors.get(changes.actorId) : token.actor;
  const size = lockedSummonSize(actor);
  if (size) Object.assign(changes, {width:size.grid, height:size.grid});
});

Hooks.once('ready', async () => {
  if (!game.user.isGM || (game.users.activeGM && !game.users.activeGM.isSelf)) return;
  for (const actor of game.actors) {
    if (lockedSummonSize(actor)) await repairSummonSize(actor);
  }
  for (const scene of game.scenes) {
    const updates = [];
    for (const token of scene.tokens) {
      const size = lockedSummonSize(token.actor);
      if (!size) continue;
      if (!token.actorLink) await repairSummonSize(token.actor);
      if (token.width !== size.grid || token.height !== size.grid) {
        updates.push({_id:token.id, width:size.grid, height:size.grid});
      }
    }
    if (updates.length) await scene.updateEmbeddedDocuments('Token', updates);
  }
});
