import {armorReduction,reduceArmorDamage} from './armor.js';
import {applyDamage,clamp,skillCost,SKILLS} from './engine.js';
import {owned,prompt,field,select,card,num,spendPhase,dice} from './rolls.js';
import {conditionStacks} from './actor.js';
const ID='sonic-tag-team-heroes';
export const CONDITIONS={stunned:'Stunned',restrained:'Restrained',dazzled:'Dazzled',prone:'Knocked Back / Prone',burning:'Burning',soaked:'Soaked',suffocating:'Suffocating',ko:'KO'};
export async function condition(actor,id,stacks=1){owned(actor);const max=['stunned','restrained'].includes(id)?3:1;const existing=actor.effects.find(e=>e.statuses.has(id));if(stacks<=0){if(existing)await existing.delete();return;}
 if(id==='burning'&&actor.system.derived?.immuneBurning)return;
 const data={name:CONDITIONS[id],img:`systems/${ID}/assets/${id}.svg`,statuses:[id],flags:{[ID]:{stacks:Math.min(max,stacks),round:game.combat?.round??0,turn:game.combat?.turn??0}}};
 if(existing)await existing.update({[`flags.${ID}.stacks`]:Math.min(max,stacks)});else await actor.createEmbeddedDocuments('ActiveEffect',[data]);
}
export async function damage(actor,amount,{critical=false,shield=true,bypassArmor=false}={}){owned(actor);const s=actor.system;if(s.hpNotApplicable)throw Error('This part has HP N/A. Target its damageable core or configured boss form; apply statuses separately.');
 const state={hp:s.hp.value,rings:s.rings||0,crits:s.crits,pc:actor.type==='character',threshold:s.critThreshold||0};
 const armor=reduceArmorDamage(amount,armorReduction(actor.items),{bypass:bypassArmor,shield:shield&&Boolean(s.shield)});
 const r=applyDamage(state,armor.damage,{critical:critical&&(armor.incoming===0||armor.damage>0),shield:shield&&Boolean(s.shield)});
 r.armorPrevented=armor.prevented;
 const update={'system.hp.value':r.hp,'system.crits':r.crits};if(actor.type==='character')update['system.rings']=r.rings;if(r.shieldBroken)update['system.shield']='';
 await actor.update(update);if(r.stunned)await condition(actor,'stunned',Math.max(1,conditionStacks(actor,'stunned')));if(r.ko)await condition(actor,'ko');
 await card(actor,'Damage resolved',`<p>${r.damage} damage. ${r.armorPrevented?`Armor prevented ${r.armorPrevented} damage. `:''}HP ${r.hp}. ${r.shieldBroken?'Shield broke and absorbed the hit.':''}${r.spilled?` ${r.spilled} Rings are recoverable for one round; GM places them on accessible adjacent squares.`:''}${r.stunned?' Stunned.':''}${r.ko?' KO.':''}</p><p>Spilled Rings are not automatically placed or collected. Energy/fire shield exceptions must be chosen before applying damage.</p>`);return r;
}
export async function damageDialog(actor){const o=await prompt('Apply damage',field('damage','Damage',0)+select('armor','Apply armor damage reduction?',{yes:'Yes',no:'No — bypass armor'},'yes')+select('critical','Inflict a critical hit?',{no:'No',yes:'Yes'},'no')+select('shield','Use active shield?',{yes:'Yes — negate this hit and break shield',no:'No — bypass shield / exempt damage'},'yes'));if(o)await damage(actor,num(o.damage),{critical:o.critical==='yes',shield:o.shield==='yes',bypassArmor:o.armor==='no'});}
export async function healRings(actor){owned(actor);const o=await prompt('Spend Rings',field('rings','Rings to spend (up to 5 per Interact)',Math.min(5,actor.system.rings))+select('resource','Recover',{hp:'HP',tp:'TP'},'hp'));if(!o)return;
 const count=clamp(num(o.rings),0,5),s=actor.system;if(count>s.rings)throw Error('Not enough Rings.');if(o.resource==='tp'&&s.underwater)throw Error('Rings cannot restore TP while underwater.');const max=o.resource==='hp'?s.derived.hpMax:s.derived.tpMax;const restored=Math.min(count,max-s[o.resource].value);if(restored<=0)return;
 if(!conditionStacks(actor,'ko'))await spendPhase(actor,'interact');await actor.update({'system.rings':s.rings-restored,[`system.${o.resource}.value`]:s[o.resource].value+restored});if(o.resource==='hp'&&s.hp.value>0&&!(s.underwater&&s.tp.value===0))await condition(actor,'ko',0);
}
export async function rest(actor,full=false){owned(actor);const s=actor.system;await actor.update({'system.hp.value':full?s.derived.hpMax:Math.min(s.derived.hpMax,s.hp.value+5),'system.tp.value':full?15:Math.min(15,s.tp.value+5)});if(actor.system.hp.value>0&&!(actor.system.underwater&&actor.system.tp.value===0))await condition(actor,'ko',0);}
export async function equip(actor,item){owned(actor);const next=!item.system.equipped;if(next&&(item.system.broken||item.system.disabled))throw Error('Repair this gear first.');
 if(next&&actor.type==='character'){const used=actor.items.filter(i=>i.system.equipped).reduce((s,i)=>s+i.system.slots,0);if(used+item.system.slots>actor.system.gearSlots)throw Error('No free gear slots.');if(actor.items.some(i=>i.id!==item.id&&i.system.equipped&&(i.system.gearKind||i.name)===(item.system.gearKind||item.name)))throw Error('Only one gear of each kind may be equipped.');}
 await spendPhase(actor,'interact');await item.update({'system.equipped':next});
}
export async function useItem(actor,item){owned(actor);if(item.system.quantity<1)throw Error('No uses remaining.');await spendPhase(actor,'interact');const s=actor.system,name=item.system.subtype;
 if(['barrier','thunder','flame','aqua'].includes(name))await actor.update({'system.shield':name});
 else if(name==='sneakers')await actor.update({'system.sneakersRounds':3});
 else if(name==='rings')await actor.update({'system.rings':s.rings+(item.system.modifierValue||5)});
 else await card(actor,item.name,`<p>${foundry.utils.escapeHTML(item.system.description)}</p><p>Resolve this item’s chosen benefit with the GM. Consumed one item.</p>`);
 await item.update({'system.quantity':item.system.quantity-1});
}
export async function advance(actor){owned(actor);const choices={...Object.fromEntries(Object.keys(SKILLS).map(k=>['skill:'+k,k+' rank'])),...Object.fromEntries(['speed','power','dexterity','intellect','charisma'].map(k=>['attribute:'+k,k+' attribute']))};const o=await prompt('Point-buy advancement',select('choice','Improve',choices,'skill:spin')+'<p>Spends Rings, records skill expenditure threshold, and applies Type discount. Use permanent ranks, including milestone awards; gear is not purchased.</p>');if(!o)return;const [kind,key]=o.choice.split(':'),s=actor.system;let cost,current;
 if(kind==='skill'){current=s.skills[key];if(current>=4)throw Error('Maximum skill rank 4, including item bonuses.');if(s.derived.ranks[key]>=4)throw Error('This skill is already at the effective rank cap of 4.');cost=skillCost(current,s.heroType,s.archetype,key);}else{current=s.attributes[key];if(current>=7)throw Error('Maximum attribute 7.');cost=(current+1)*10;if(s.advancementSpent<cost)throw Error(`First spend at least ${cost} Rings on skill ranks.`);}
 if(s.rings<cost)throw Error(`Requires ${cost} Rings.`);const path=kind==='skill'?'skills':'attributes';await actor.update({[`system.${path}.${key}`]:current+1,'system.rings':s.rings-cost,'system.advancementSpent':s.advancementSpent+(kind==='skill'?cost:0)});
}
export async function underwaterCheck(actor){owned(actor);if(actor.system.derived.immuneSuffocating){await actor.update({'system.underwater':true,'system.breathRounds':0});if(['thunder','flame'].includes(actor.system.shield))await actor.update({'system.shield':''});await condition(actor,'suffocating',0);if(actor.system.hp.value>0)await condition(actor,'ko',0);return card(actor,'Breathing','<p>Immune to suffocation / supplied with air.</p>');}if(['thunder','flame'].includes(actor.system.shield))await actor.update({'system.shield':''});const s=actor.system,round=s.breathRounds+1;if(round===1){await actor.update({'system.underwater':true,'system.breathRounds':1});return;}
 const p={hit:s.derived.attributes.power,trick:0};const difficulty=Math.max(1,round-1);const r=round-2>p.hit?{hits:0,success:false,rolls:[]}:await dice(p,{difficulty});const failed=!r.success;
 await actor.update({'system.underwater':true,'system.breathRounds':round,'system.tp.value':failed?Math.max(0,s.tp.value-5):s.tp.value});if(failed){await condition(actor,'suffocating');if(actor.type==='npc')await damage(actor,0,{critical:true,shield:false});else if(actor.system.tp.value===0)await condition(actor,'ko');}await card(actor,'Hold breath',`<p>${r.hits} hits against difficulty ${round-1}. ${failed?(actor.type==='npc'?'Suffer a crit.':'Lose 5 TP.'):'Breath held.'} Next interval increases Disadvantage by 1.</p>`,{rolls:r.rolls});}
export async function endEncounter(actor){owned(actor);await actor.update({'system.crits':0,'system.sneakersRounds':0,'system.breathRounds':0,'system.phases':{}});for(const e of actor.effects.filter(e=>['stunned','dazzled'].some(id=>e.statuses.has(id))))await e.delete();}
