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
 const o=await prompt('Parry (Speed)',field('hits','Attacker hits (at least 1)',1)+common+'<p>Single-target melee attacks only; requires a usable melee weapon or a limb that can safely deflect the attack (GM decides). Roll Speed d6; strictly exceed attacker hits to cancel the hit. Ties fail. Success earns 1 TP, at most once per round (once between End encounter resets outside combat). Use one defense per attack; do not apply damage a second time.</p>');
 if(!o)return;
 const hits=Number(o.hits),amount=Number(o.damage);
 if(!Number.isInteger(hits)||hits<1||!Number.isFinite(amount)||amount<0)throw Error('Enter at least 1 attacker hit and nonnegative incoming damage.');
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
 await card(actor,'Parry (Speed)',renderResult(roll)+'<p>Against '+hits+' attacker hits: '+(result.success?'Parried; no damage. Gained '+reward+' TP.':'Failed; resolving normal incoming damage.')+'</p>',{rolls:roll.rolls});
 if(!result.success)return damage(actor,amount,{critical:o.critical==='yes',bypassArmor:o.armor==='no',shield:o.shield==='yes'});
 return result;
}
