const SYS='shinobi-no-sho-revamp';
export const SUMMON_REVISION=2;
// Legacy imports used comma-separated skills and sometimes omitted size metadata.
export function normalizeSummonProfile(value){
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const skills=Array.isArray(value.skills)?value.skills:String(value.skills??'').split(',');
 const size=value.size&&typeof value.size==='object'?value.size:{label:typeof value.size==='string'?value.size:'Unspecified'};
 return {...value,species:String(value.species??''),skills:skills.map(s=>String(s).trim()).filter(Boolean),size:{...size,label:String(size.label??'Unspecified')}};
}

export const SUMMON_SKILLS={acrobatics:'acrobacia',athletics:'atletismo',escape:'escapar',stealth:'furtividade',search:'procurar',alertness:'prontidao',readiness:'prontidao',tracking:'rastrear',medicine:'medicina','natural sciences':'ciencias',concentration:'concentracao',disguise:'disfarce',culture:'cultura',occultism:'ocultismo',poisoncraft:'veneficio',poison:'veneficio',flight:'voo'};
export const skillKey=name=>SUMMON_SKILLS[String(name).replace(/\s*\(.*\)/,'').trim().toLowerCase()]||null;
export function summonNCCap(species,level,quantity){return Math.max(0,2*level-(species.henchman?0:species.contract==='Doki'&&quantity===3?1:quantity===2?2:0));}
export function summonQuantityLegal(species,quantity){return Number.isInteger(quantity)&&quantity>=1&&quantity<=(species.maximumQuantity||2);}
export function summonStats(profile,nc,attrs,normalVitality,skills,combat){
 profile=normalizeSummonProfile(profile)||{skills:[]};
 const keys=new Set(profile.skills.map(skillKey).filter(Boolean));
 const active=nc>=4,zeroInt=profile.intelligenceZero;
 const attribute=key=>!active||zeroInt&&key==='int'?0:Number(attrs[key])||0;
 const result={vitality:profile.oneVitality?1:Math.ceil(normalVitality/2),skills:{},combat:{}};
 for(const [key,data] of Object.entries(skills||{}))result.skills[key]=active&&keys.has(key)?attribute(data.attr):0;
 for(const [key,total] of Object.entries(combat||{}))result.combat[key]=active?total+(Number(profile.commonPenalty)||0):0;
 return result;
}
export function summonRollRestriction(profile,nc,test){
 if(!profile)return null;
 if(profile.intelligenceZero&&['Intelligence','INT','Art','Natural Sciences','Concentration','Culture','Medicine','*Medicine','Mechanics','*Mechanics','Occultism','*Occultism','Poisoncraft','**Poisoncraft'].includes(test))return 'This species automatically fails Intelligence tests.';
 if(profile.species==='Bee (Individual)'&&/Melee Combat|Ranged Combat/.test(test))return 'An individual bee automatically fails combat checks except self-defense; use a swarm for attacks.';
 if(profile.henchman&&/Melee Combat|Ranged Combat|Dodge|Read Movement/.test(test))return 'Numerous summon / henchman: resolve its automatic-failure exception from the species rules (for example School Attack).';
 return null;
}
// Reconcile only system-generated entries; leave attributes, energies, custom gear and ordinary actors alone.
export async function syncSummonSpecies(actor,species,templateFactory){
 if(!species||actor.getFlag(SYS,'summonRulesRevision')===SUMMON_REVISION)return false;
 const expected=templateFactory(species),previous=actor.getFlag(SYS,'summonProfile')||{};
 const nc=Number(actor.system?.cabecalho?.nc??previous.nc??4);
 const referenceKey=i=>{const f=i.flags?.[SYS]||{};return f.summonContentKey||(f.speciesSkill?'skill:'+skillKey(i.name.replace(/^Skill: /,'')):f.summonAllowedAptitude?'aptitude:'+i.name.replace(/^Allowed Aptitude: /,''):f.summonReference?'profile':f.dokiLoadoutKey?'attack:doki:'+f.dokiLoadoutKey:f.summonAttack?'attack:'+i.name:null)};
 for(const data of expected.items){
  const key=referenceKey(data),match=actor.items.find(i=>referenceKey(i)===key);
  const incoming=structuredClone(data);
  if(incoming.flags[SYS].summonAttack)incoming.flags[SYS].noDamage=nc<4;
  if(match)await match.update({name:incoming.name,img:incoming.img,system:{...match.system,...incoming.system},flags:{...match.flags,[SYS]:{...match.flags?.[SYS],...incoming.flags[SYS]}}});
  else await actor.createEmbeddedDocuments('Item',[incoming]);
 }
 const expectedKeys=new Set(expected.items.map(referenceKey));
 const obsolete=actor.items.filter(i=>{const f=i.flags?.[SYS]||{};return (f.speciesSkill||f.summonAllowedAptitude)&&!expectedKeys.has(referenceKey(i));}).map(i=>i.id);
 if(obsolete.length)await actor.deleteEmbeddedDocuments('Item',obsolete);
 const profile={...expected.flags[SYS].summonProfile,...previous,nc,skills:expected.flags[SYS].summonProfile.skills,source:species.source,page:species.page,primaryAttributes:species.key_attributes,techniques:species.techniques,aptitudes:species.aptitudes,powerOptions:species.powerOptions,intelligenceZero:!!species.intelligenceZero,oneVitality:!!species.oneVitality,henchman:!!species.henchman,skillRules:expected.flags[SYS].summonProfile.skillRules,aptitudeRules:expected.flags[SYS].summonProfile.aptitudeRules,sourceNotes:species.notes,attacks:expected.flags[SYS].summonProfile.attacks};
 if(previous.commonPenalty)profile.commonPenalty=species.commonPenalty;
 await actor.setFlag(SYS,'summonProfile',profile);
 await actor.setFlag(SYS,'kuchiyoseSpecies',species);
 await actor.setFlag(SYS,'summonRulesRevision',SUMMON_REVISION);
 return true;
}

