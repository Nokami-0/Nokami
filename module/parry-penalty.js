const ID='sonic-tag-team-heroes';
export function parryDisadvantage(actor){return actor?.effects?.some(e=>!e.disabled&&e.getFlag(ID,'parryNextAttack'))?1:0;}
export async function consumeParryDisadvantage(actor){
 const effects=actor.effects.filter(e=>!e.disabled&&e.getFlag(ID,'parryNextAttack'));
 for(const effect of effects)await effect.delete();
}
export async function imposeParryDisadvantage(actor,source){
 if(!actor?.isOwner)throw Error('The GM or attacker owner must apply the parry penalty.');
 if(actor.getFlag(ID,'parryApplied.'+source))return false;
 if(!parryDisadvantage(actor))await actor.createEmbeddedDocuments('ActiveEffect',[{name:'Parried — next attack: 1 Disadvantage',img:'icons/svg/downgrade.svg',flags:{[ID]:{parryNextAttack:true}}}]);
 await actor.setFlag(ID,'parryApplied.'+source,true);
 return true;
}
