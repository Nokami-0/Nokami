const SYS='shinobi-no-sho-revamp';
export function dokiEquipment(species,nc){
 if(!species.dokiWeapon)return [];
 const img=species.image||'systems/'+SYS+'/integrated/assets/'+species.token_file;
 const make=(key,name,category,damage,quantity,type,description)=>({name,type:'equipamento',img,system:{descricao:description,weaponCategory:category,weaponDamage:damage,weaponBonus:0,criticalRange:'15-16',attackType:'melee',weaponSize:category==='natural'?'light':'medium',damageType:type,quantidade:quantity,unitsPerSlot:quantity,equipped:true},flags:{[SYS]:{summonAttack:true,dokiLoadoutKey:key,dokiLoadoutVersion:1,attackType:'melee',damageType:type,noDamage:nc<4,baseDamageFormula:'max(3, Strength - 3)',dokiAttackName:name}}});
 const result=[];
 if(species.dokiWeapon==='club')result.push(make('club','Club (Bludgeoning)','simple',2,1,'bludgeoning','Club weapon. Advanced weapon catalog: Weapon Damage +2, critical 15–16, bludgeoning. Add to summon base max(3, Strength − 3). Requires a usable club; no extra attack.'));
 if(species.dokiWeapon==='claws')result.push(make('tekko-pair','Tekko-Kagi — Pair (Slashing/Piercing)','martial',3,2,'slashing','A pair of two Tekko-Kagi. Advanced catalog notation +3/+1, critical 15–16, slashing/piercing. Primary Weapon Damage is +3. The catalog paired +4 option requires Ambidexterity; after confirming prerequisites, set the existing weapon modifier to +1 when using that option. This item does not grant Ambidexterity, a free off-hand attack or extra actions. See Advanced Shinobi Guide pp.68–72.'));
 result.push(make('unarmed','Unarmed Strike (Bludgeoning)','natural',0,1,'bludgeoning','Natural unarmed attack available without the carried weapon. Summon base damage max(3, Strength − 3); no weapon damage bonus. NC below 4 cannot deal attack damage.'));
 return result;
}
export function summonEquipmentBase(strength,item){
 const data=item.system||{};
 return Math.max(3,(Number(strength)||0)-3)+(Number(data.weaponDamage)||0)+(Number(data.weaponBonus)||0);
}
export async function syncDokiLoadout(actor,species){
 if(!species?.dokiWeapon||actor.getFlag(SYS,'dokiLoadoutVersion')===1)return {added:0,updated:0};
 const nc=actor.system?.cabecalho?.nc??actor.getFlag(SYS,'summonProfile')?.nc??4;
 const expected=dokiEquipment(species,nc);let added=0,updated=0;
 for(const item of expected){
  const key=item.flags[SYS].dokiLoadoutKey;
  const legacy={club:['Club (Bludgeoning)'],'tekko-pair':['Tekko-kagi (Slashing/Piercing)','Tekko-Kagi — Pair (Slashing/Piercing)'],unarmed:['Unarmed Strike (Bludgeoning)']}[key];
  const match=actor.items.find(i=>i.flags?.[SYS]?.dokiLoadoutKey===key||i.flags?.[SYS]?.summonAttack&&legacy.includes(i.name));
  if(match){await match.update({name:item.name,img:item.img,system:{...match.system,...item.system},flags:{...match.flags,[SYS]:{...match.flags?.[SYS],...item.flags[SYS]}}});updated++;}
  else{await actor.createEmbeddedDocuments('Item',[item]);added++;}
 }
 const profile=actor.getFlag(SYS,'summonProfile');
 if(profile)await actor.setFlag(SYS,'summonProfile',{...profile,attacks:expected.map(i=>[i.name,i.flags[SYS].damageType]),attackTypes:expected.map(i=>({name:i.name,damageType:i.flags[SYS].damageType,attackType:'melee',nonDamaging:nc<4}))});
 await actor.setFlag(SYS,'dokiLoadoutVersion',1);
 return {added,updated};
}
