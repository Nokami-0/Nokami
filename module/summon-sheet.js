const SYS='shinobi-no-sho-revamp';
export function summonSheetContext(actor,actors){
 const profile=actor.getFlag?.(SYS,'summonProfile');
 const isSummon=Boolean(profile||actor.getFlag?.(SYS,'summonTemplate'));
 if(!isSummon)return {isSummon:false};
 const owner=profile?.ownerId?actors?.get?.(profile.ownerId):null;
 return {isSummon:true,summonProfile:profile||{},summonIsTemplate:Boolean(actor.getFlag?.(SYS,'summonTemplate')),summonNC:actor.system?.cabecalho?.nc??profile?.nc??0,summonOwnerName:owner?.name||(profile?.ownerId?'Summoner unavailable':'Not assigned — template'),summonSkillsText:Array.isArray(profile?.skills)?profile.skills.join(', '):String(profile?.skills||''),summonReferenceItems:[],summonSkillItems:[],summonAllowedItems:[]};
}
export function summonReferenceKind(item){
 const flags=item.flags?.[SYS]||{};
 if(flags.summonReference)return 'summonReferenceItems';
 if(flags.speciesSkill)return 'summonSkillItems';
 if(flags.summonAllowedAptitude)return 'summonAllowedItems';
 return null;
}
