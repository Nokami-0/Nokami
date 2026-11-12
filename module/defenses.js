import {imposeParryDisadvantage} from './parry-penalty.js';
import {owned,prompt,field,select,card,dice,renderResult,num} from './rolls.js';
import {conditionStacks} from './actor.js';
import {damage} from './resources.js';
import {parryOutcome} from './defense-rules.js';
const ID='sonic-tag-team-heroes';
export async function defend(actor,kind){
 owned(actor);
 if(actor.type==='vehicle')throw Error('Use personal defenses on the pilot or crew sheet.');
 if(conditionStacks(actor,'ko'))throw Error('This actor is KO.');
 const common=field('damage','Incoming damage before defenses',0)+select('critical','Incoming hit is critical?',{no:'No',yes:'Yes'},'no')+select('armor','Apply armor DR?',{yes:'Yes',no:'No'},'yes')+select('shield','Use active shield?',{yes:'Yes',no:'No'},'yes');
 if(kind==='block'){
  const power=actor.system.derived.attributes.power;
  const o=await prompt('Block (Power)',common+'<p>Choose one defense for this hit. Block reduces damage by Power ('+power+'). Armor applies afterward. Apply the hit here only once.</p>');
  if(!o)return;
  return damage(actor,num(o.damage),{block:true,critical:o.critical==='yes',bypassArmor:o.armor==='no',shield:o.shield==='yes'});
 }
 const attackers=new Map();
 for(const a of game.actors.filter(a=>a.visible&&a.uuid!==actor.uuid))attackers.set(a.uuid,a.name);
 for(const token of canvas.tokens?.placeables||[])if(token.visible&&token.actor&&token.actor.uuid!==actor.uuid)attackers.set(token.actor.uuid,token.name);
 const selected=[...game.user.targets].find(t=>t.actor?.uuid!==actor.uuid)?.actor?.uuid;
 if(!attackers.size)throw Error('No visible attacker is available. Ask the GM to resolve this Parry.');
 const choices=Object.fromEntries(attackers);
 const o=await prompt('Parry (Speed)',select('attacker','Attacker',choices,selected||attackers.keys().next().value)+field('hits','Attacker hits (at least 1)',1)+common+'<p>Single-target melee attacks only; requires a usable melee weapon or a limb that can safely deflect the attack (GM decides). Roll Speed d6; strictly exceed attacker hits to cancel the hit. Ties fail. Success earns 1 TP, at most once per round (once between End encounter resets outside combat). Success also imposes 1 Disadvantage on the enemy next attack; this penalty does not stack. Use one defense per attack; do not apply damage a second time.</p>');
 if(!o)return;
 const hits=Number(o.hits),amount=Number(o.damage);
 if(!Number.isInteger(hits)||hits<1||!Number.isFinite(amount)||amount<0)throw Error('Enter at least 1 attacker hit and nonnegative incoming damage.');
 const attacker=await fromUuid(o.attacker);
 if(!attacker||attacker.uuid===actor.uuid||!attackers.has(attacker.uuid))throw Error('Choose the actor making the incoming attack.');
 const count=Math.max(0,actor.system.derived.attributes.speed-2*(conditionStacks(actor,'stunned')+conditionStacks(actor,'restrained')));
 const roll=await dice({hit:count,trick:0},{defense:true});
 const result=parryOutcome(roll.hits,hits,actor.system.tp.value);
 let reward=0;
 if(result.success){
  const key=game.combat?.started?game.combat.id+':'+game.combat.round:'outside';
  if(actor.getFlag(ID,'parryReward')!==key){
   reward=result.tp-actor.system.tp.value;
   await actor.update({'system.tp.value':result.tp,['flags.'+ID+'.parryReward']:key});
  }
 }
 const message=await card(actor,'Parry (Speed)',renderResult(roll)+'<p>Against '+hits+' attacker hits: '+(result.success?'Parried; no damage. Gained '+reward+' TP. Attacker suffers 1 Disadvantage on their next attack.':'Failed; resolving normal incoming damage.')+'</p>'+(result.success?'<button type="button" data-stth-chat="parryPenalty">Apply next-attack Disadvantage (GM / attacker owner)</button>':''),{rolls:roll.rolls,data:{kind:'parry',success:result.success,attacker:attacker.uuid}});
 if(result.success){if(attacker.isOwner)await imposeParryDisadvantage(attacker,message.id);else ui.notifications.info('Ask the GM to apply the parry penalty from the chat card.');}
 if(!result.success)return damage(actor,amount,{critical:o.critical==='yes',bypassArmor:o.armor==='no',shield:o.shield==='yes'});
 return result;
}
