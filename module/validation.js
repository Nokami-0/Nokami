// The same equipment limits apply to row buttons, item editors and macros.
export function equipmentError(actor,itemId,next,changed={}) {
 if(!next||actor?.type!=='character')return null;
 const item=actor.items.get(itemId);if(!item)return 'Equipment not found.';
 const system={...item.system,...changed};
 if(system.broken||system.disabled)return 'Repair or enable this gear before equipping it.';
 const other=actor.items.filter(i=>i.id!==itemId&&i.system.equipped&&i.type!=='talent');
 const occupied=other.reduce((sum,i)=>sum+(Number(i.system.slots)||0),0)+(Number(system.slots)||0);
 if(occupied>actor.system.gearSlots)return `Equipped gear requires ${occupied} slots; this character has ${actor.system.gearSlots}.`;
 const kind=system.gearKind||item.name;
 if(other.some(i=>(i.system.gearKind||i.name)===kind))return 'Only one item of each gear kind may be equipped.';
 return null;
}
export function installEquipmentValidation(){
 Hooks.on('preUpdateItem',(item,changes)=>{
  if(!item.parent||!['gear','attack','vehicleUpgrade'].includes(item.type))return;
  const nested=changes.system??{};
  const patch={...nested};for(const [key,value]of Object.entries(changes))if(key.startsWith('system.'))patch[key.slice(7)]=value;
  const next=patch.equipped??item.system.equipped;
  if(!('equipped'in patch||'slots'in patch||'gearKind'in patch))return;
  const error=equipmentError(item.parent,item.id,next,patch);if(error){ui.notifications.warn(error);return false;}
 });
}
