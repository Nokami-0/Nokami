import {dice,card} from './rolls.js';import {conditionStacks} from './actor.js';import {damage,condition} from './resources.js';
const ID='sonic-tag-team-heroes';
export class STTHCombat extends foundry.documents.Combat {
 async rollInitiative(ids,{updateTurn=true,messageOptions={}}={}){
 ids=typeof ids==='string'?[ids]:ids;const updates=[];
 for(const id of ids){const c=this.combatants.get(id),a=c?.actor;if(!a||!c.isOwner)continue;if(a.system.initiativeNotApplicable){ui.notifications.warn(`${a.name}: initiative N/A; schedule this hazard manually.`);continue;}let count=a.system.derived?.initiative||0;let upgrades=Math.min(count,a.system.initiativeTrick||0);
 if(a.type==='vehicle'){const pilot=await fromUuid(a.system.pilot);count=pilot?.system.derived?.initiative||1;upgrades=0;}
 const r=await dice({hit:Math.max(0,count-upgrades),trick:upgrades});let score=r.trickDice.includes(0)?0:Math.max(0,...r.hitDice,...r.trickDice);updates.push({_id:id,initiative:score});await card(a,'Initiative',`<p>${r.hitDice.join(', ')} ${r.trickDice.length?' / Trick Dice '+r.trickDice.join(', '):''} → <b>${score}</b>.</p><p>Highest face, not hits. Any Trick Die 0 goes last. PCs win ties vs NPCs; players choose PC ties.</p>`,{rolls:r.rolls});}
 await this.updateEmbeddedDocuments('Combatant',updates);if(updateTurn&&this.turn!==null)await this.update({turn:this.turn});return this;
 }
 async nextTurn(){
  await super.nextTurn();
  for(let n=0;n<this.combatants.size;n++){
   if(this.combatant?.getFlag(ID,'skipRound')!==this.round)break;
   await super.nextTurn();
  }
  return this;
 }
 _sortCombatants(a,b){const diff=(b.initiative??-1)-(a.initiative??-1);if(diff)return diff;const pcA=a.actor?.type==='character',pcB=b.actor?.type==='character';if(pcA!==pcB)return pcA?-1:1;return (a.sort??0)-(b.sort??0)||a.id.localeCompare(b.id);}
}
export function installCombatHooks(){
 Hooks.on('updateCombat',async(combat,changed)=>{if(!game.user.isGM||game.users.activeGM?.id!==game.user.id)return;if(!('round'in changed||'turn'in changed))return;
 const a=combat.combatant?.actor;if(a){const skip=combat.combatant.getFlag(ID,'skipRound');if(skip===combat.round)ui.notifications.warn(`${a.name} has spent this turn participating in Team Blast.`);await a.update({'system.phases':{key:`${combat.id}:${combat.round}:${combat.turn}`,move:0,interact:0,action:0}});}
 // Stunned lasts one full round from its first application, not from stacking.
 for(const actor of [...new Set(combat.combatants.map(c=>c.actor).filter(Boolean))]){
  for(const e of actor.effects.filter(e=>['stunned','dazzled'].some(id=>e.statuses.has(id)))){const start=e.getFlag(ID,'round'),turn=e.getFlag(ID,'turn');if(start!==undefined&&(combat.round>start+1||combat.round===start+1&&combat.turn>=turn))await e.delete();}
 }
 if('round'in changed&&combat.round>1){for(const actor of [...new Set(combat.combatants.map(c=>c.actor).filter(Boolean))]){
  if(conditionStacks(actor,'burning')&&!actor.system.hpNotApplicable&&!actor.system.derived?.immuneBurning)await damage(actor,5,{shield:false});
  if(actor.system.sneakersRounds>0)await actor.update({'system.sneakersRounds':actor.system.sneakersRounds-1});
 }}
 });
}
