import {ATTRIBUTES,SKILLS} from './engine.js';
const f=foundry.data.fields;
const n=(initial=0,min=0,max)=>new f.NumberField({initial,integer:true,min,...(max===undefined?{}:{max})});
const s=(initial='')=>new f.StringField({initial});const b=()=>new f.BooleanField({initial:false});const obj=()=>new f.ObjectField({initial:{}});
const resource=initial=>new f.SchemaField({value:n(initial),max:n(initial)});
export class CharacterData extends foundry.abstract.TypeDataModel {
 static defineSchema(){return {
  npcTier:s(),profileSource:s(),profileDodge:new f.NumberField({initial:null,nullable:true,integer:true,min:0,max:6}),profileInitiative:new f.NumberField({initial:null,nullable:true,integer:true,min:0}),profileMovement:new f.NumberField({initial:null,nullable:true,integer:true,min:0}),hpNotApplicable:b(),initiativeNotApplicable:b(),usesPilot:b(),pilot:s(),pilotDexModifier:new f.NumberField({initial:0,integer:true}),pilotSkillOverrides:s(),heroType:s('speed'),archetype:s('genius'),species:s('Mobian'),bio:s(),appearance:s(),personality:s(),height:n(),
  attributes:new f.SchemaField(Object.fromEntries(Object.keys(ATTRIBUTES).map(k=>[k,n(k==='speed'?4:1,1,7)]))),
  skills:new f.SchemaField(Object.fromEntries(Object.keys(SKILLS).map(k=>[k,n(0,0,12)]))),
  hp:resource(10),tp:resource(15),rings:n(),mobiums:n(),crits:n(),critThreshold:n(),initiativeTrick:n(),
  dodgeBonus:new f.NumberField({initial:0,integer:true,min:-100}),initiativeBonus:new f.NumberField({initial:0,integer:true,min:-100}),movementBonus:new f.NumberField({initial:0,integer:true,min:-100}),hpBonus:new f.NumberField({initial:0,integer:true,min:-10000}),gearSlots:n(6),advancementSpent:n(),
  specialUsed:b(),specialEncounter:s(),squadSize:n(1,1,5),squadSkills:s(),specialSkill:s('knowledge'),blastSkill:s('spin'),blastStatus:s('stunned'),blastBuff:s('rings'),blastName:s(),
  underwater:b(),breathRounds:n(),shield:s(),sneakersRounds:n(),phases:obj(),derived:obj(),race:obj(),qte:obj(),creationComplete:b()
 };}
}
export class VehicleData extends foundry.abstract.TypeDataModel {
 static defineSchema(){return {speed:n(3,1,7),power:n(2,1,7),dexterityModifier:new f.NumberField({initial:0,integer:true,min:-5,max:5}),hp:resource(20),dodge:n(2,0,6),movement:n(4),crits:n(),critThreshold:n(1),passengers:n(2),width:n(1,1),length:n(1,1),pilot:s(),crew:s(),qualities:s(),form:s(),bio:s(),personal:b(),height:n(),phases:obj(),derived:obj(),race:obj()};}
}
export class ItemData extends foundry.abstract.TypeDataModel {
 static defineSchema(){return {
  ammoLimited:b(),statusOnly:b(),description:s(),source:s(),skill:s('spin'),damage:new f.NumberField({initial:1,integer:true,min:-9}),damageMode:s('fixed'),range:n(1),advantage:new f.NumberField({initial:0,integer:true}),
  extraDamage:n(1),aoe:s(),arc:s('360'),facing:s('forward'),effect:s(),effectHits:n(1),automaticEffect:b(),
  movementCost:s(),recharge:n(),remainingRecharge:n(),tpCost:n(),partnerType:s(),aimSkill:s(),partnerSkill:s(),comboKind:s('combined'),
  equipped:b(),slots:n(1),quantity:n(1),price:n(),ringPrice:n(),removable:b(),used:b(),modifier:s(),modifierValue:new f.NumberField({initial:0}),modifierTarget:s(),
  subtype:s(),uses:n(),charges:n(),broken:b(),disabled:b(),notes:s(),lastUsed:s(),generation:s(),gearKind:s()
 };}
}
