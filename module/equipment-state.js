const isArmor = item => Boolean(item.system?.isArmor || item.system?.snsArmor || item.getFlag?.('sns-weapon-library', 'armor'));
export async function setEquipmentState(actor, itemId, equipped) {
  if (!actor?.isOwner) throw new Error('You must own this actor to change equipment.');
  const item = actor.items.get(itemId);
  if (!item || item.type !== 'equipamento') throw new Error('Add this equipment to the actor inventory first.');
  const next = equipped === undefined ? !Boolean(item.system?.equipped) : Boolean(equipped);
  const updates = [{ _id: item.id, 'system.equipped': next }];
  if (next && isArmor(item)) {
    for (const other of actor.items) {
      if (other.id !== item.id && other.type === 'equipamento' && other.system?.equipped && isArmor(other))
        updates.push({ _id: other.id, 'system.equipped': false });
    }
  }
  await actor.updateEmbeddedDocuments('Item', updates);
  return next;
}
