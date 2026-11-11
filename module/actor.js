import {movement,clamp,SKILLS,ATTRIBUTES} from './engine.js';
export const conditionStacks=(a,id)=>Math.max(0,...a.effects.filter(e=>!e.disabled&&e.statuses.has(id)).map(e=>Number(e.getFlag('sonic-tag-team-heroes','stacks')||1)));
export function itemDamage(actor,item){if(item.system.statusOnly)return 0;const p=actor.system.derived?.attributes?.power??actor.system.attributes?.power??0;const mode=item.system.damageMode;return Math.max(1,mode==='spin'?p+1+item.system.damage:mode==='melee'?p+2+item.system.damage:item.system.damage);}
export class STTHActor extends foundry.documents.Actor {
 prepareDerivedData(){super.prepareDerivedData();const s=this.system;
 if(this.type==='vehicle'){s.derived={hpMax:s.hp.max,dodge:s.dodge,movement:s.movement,initiative:0,gearUsed:0};return;}
 const a={...s.attributes},ranks={...s.skills};
 if(this.type==='npc'&&s.usesPilot&&s.pilot){const pilot=game.actors?.get(s.pilot.replace(/^Actor\./,''));if(pilot&&pilot!==this){const pa=pilot.system.derived?.attributes??pilot.system.attributes;const pr=pilot.system.derived?.ranks??pilot.system.skills;for(const k of ['dexterity','intellect','charisma'])a[k]=Math.max(1,(pa[k]||1)+(k==='dexterity'?s.pilotDexModifier:0));const overrides=new Set((s.pilotSkillOverrides||'').split(','));for(const k of Object.keys(SKILLS))if(!overrides.has(k))ranks[k]=pr[k]||0;}}
 let dodge=s.dodgeBonus,init=s.initiativeBonus,move=s.movementBonus,hp=s.hpBonus;let gearUsed=0;
 for(const item of this.items){if((item.type!=='talent'&&!item.system.equipped)||item.system.broken||item.system.disabled)continue;const v=Number(item.system.modifierValue)||0;if(item.type!=='talent')gearUsed+=item.system.slots;
  if(item.system.modifier==='attribute'&&item.system.modifierTarget in a)a[item.system.modifierTarget]=Math.max(a[item.system.modifierTarget],Math.min(6,a[item.system.modifierTarget]+v));
  if(item.system.modifier==='skill'&&item.system.modifierTarget in ranks)ranks[item.system.modifierTarget]+=v;
  if(item.system.modifier==='dodge')dodge+=v;if(item.system.modifier==='initiative')init+=v;if(item.system.modifier==='movement')move+=v;if(item.system.modifier==='hp')hp+=v;
 }
 if(this.type==='npc'&&s.squadSize>1){for(const k of s.squadSkills.split(','))if(k.trim() in ranks)ranks[k.trim()]+=s.squadSize-1;hp+=(s.squadSize-1)*5;}
 if(s.sneakersRounds>0){move+=2;for(const k in ranks)if(SKILLS[k]==='speed')ranks[k]+=2;}
 if(s.shield){dodge++;if(s.shield==='aqua'){ranks.spin++;ranks.acrobat++;}}
 for(const k in ranks)ranks[k]=clamp(ranks[k],0,4);
 const drySpeed=a.speed;
 const soaked=conditionStacks(this,'soaked')||s.underwater;
 const immune=kind=>this.items.some(i=>(i.type==='talent'||i.system.equipped)&&i.system.modifier==='immunity'&&i.system.modifierTarget===kind&&!i.system.disabled&&!i.system.broken);
 if(soaked&&!immune('soaked'))a.speed=Math.floor(a.speed/2);
 const stun=conditionStacks(this,'stunned'),restrain=conditionStacks(this,'restrained');
 const printed=k=>this.type==='npc'&&s[k]!==null&&s[k]!==undefined;
 const orb=this.items.find(i=>i.system.subtype==='orbinaut'&&i.system.ammoLimited);
 const baseDodge=orb?orb.system.quantity:printed('profileDodge')?s.profileDodge:Math.ceil(a.dexterity/2);
 const baseInit=printed('profileInitiative')?s.profileInitiative:Math.ceil(a.speed/2);
 const baseMove=printed('profileMovement')?s.profileMovement:movement(drySpeed);
 s.derived={attributes:a,ranks,hpMax:5*a.power+5+hp,tpMax:15,dodge:clamp(baseDodge+dodge-2*(stun+restrain),0,6),initiative:Math.max(0,baseInit+init),movement:restrain?0:Math.max(0,(soaked&&!immune('soaked')?Math.floor((baseMove+move)/2):baseMove+move)),gearUsed,canFly:s.heroType==='fly'||this.items.some(i=>i.name==='Can Fly'&&!i.system.disabled),canSwim:a.dexterity>=3,immuneBurning:immune('burning'),immuneSuffocating:immune('suffocating')||s.shield==='aqua'};
 s.hp.max=s.derived.hpMax;s.tp.max=15;
 }
 getRollData(){return {...super.getRollData(),...this.system.derived};}
 async _preCreate(data,options,user){await super._preCreate(data,options,user);if(data.type==='character'||data.type==='npc')this.updateSource({'prototypeToken.actorLink':data.type==='character','prototypeToken.bar1.attribute':'hp','prototypeToken.bar2.attribute':'tp'});}
}
