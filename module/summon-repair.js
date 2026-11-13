const SYS='shinobi-no-sho-revamp';
// Only clear a stored override when its sheet class is unavailable. Preserve valid custom sheets.
export async function repairSummonSheet(actor,registry){
 if(!registry)return false;
 if(!actor?.isOwner||!actor.getFlag?.(SYS,'summonProfile')&&!actor.getFlag?.(SYS,'summonTemplate'))return false;
 const sheet=actor.getFlag('core','sheetClass');
 if(!sheet||registry?.[sheet]?.cls)return false;
 await actor.unsetFlag('core','sheetClass');
 return true;
}
export async function repairWorldSummonSheets(){
 if(!game.user.isGM)return;
 const registry=CONFIG.Actor.sheetClasses?.personagem;
 if(!registry)return;
 const actors=[...game.actors];
 // Unlinked tokens store their own actor overrides and must also be repaired.
 for(const scene of game.scenes)for(const token of scene.tokens){
  if(!token.actorLink&&token.actor)actors.push(token.actor);
 }
 for(const actor of actors){try{await repairSummonSheet(actor,registry);}catch(error){console.error('Shinobi summon sheet repair',actor.name,error);}}
}
Hooks.once('ready',repairWorldSummonSheets);
