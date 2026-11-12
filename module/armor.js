// Custom armor rule. Only the strongest equipped, functional armor applies.
export function armorReduction(items=[]){
 let best=0;
 for(const item of items){
  const s=item.system||{};
  if(!['gear','vehicleUpgrade'].includes(item.type)||!s.equipped||s.broken||s.disabled)continue;
  const defaults={'light armor':1,'medium armor':2,'heavy armor':3};
  const value=s.damageReduction??defaults[String(item.name).trim().toLowerCase()]??0;
  best=Math.max(best,Math.max(0,Math.trunc(Number(value)||0)));
 }
 return best;
}
export function reduceArmorDamage(amount,reduction,{bypass=false,shield=false}={}){
 const incoming=Math.max(0,Math.trunc(Number(amount)||0));
 const prevented=bypass||shield?0:Math.min(incoming,Math.max(0,Math.trunc(Number(reduction)||0)));
 return {incoming,prevented,damage:incoming-prevented};
}
