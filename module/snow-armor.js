const common = "Homebrew Land of the Snow equipment. Activate or deactivate the chakra field as a Partial Action. Maintain it with 1 Chakra at the start of each turn. After ordinary defenses, reduce hostile ninjutsu or genjutsu damage up to the per-hit limit, spending the same number of barrier points. At 0 barrier points, the field shuts down. The field provides no protection against ordinary weapons or taijutsu. A workshop and 4 hours restore its pool; it cannot be refilled in combat. Apply only the strongest armor reduction to each hit. Track the field, barrier pool, Chakra, resistance bonus and amplification manually.";
const wings = "Built-in gliding wings. Deploy or fold wings as a Partial Action. While descending through open space, glide up to normal movement horizontally per Move Action. Use normal aerial hazard checks. Wings provide no lift or hovering.";
const variants = [
 { name: "Chakra Armor", price: 1200, slots: 3, pool: 12, suppression: 2, requirement: "Spirit 6", filter: 2, amplifyCost: 2, amplifyDamage: 1 },
 { name: "Winged Chakra Armor", price: 1500, slots: 4, pool: 12, suppression: 2, requirement: "Spirit 6; Agility 5", filter: 2, amplifyCost: 2, amplifyDamage: 1, winged: true },
 { name: "Black Prototype Armor", price: 0, slots: 4, pool: 20, suppression: 3, requirement: "Spirit 10", filter: 3, amplifyCost: 3, amplifyDamage: 2, bodyHardness: 2, winged: true }
];
export async function ensureSnowArmor(pack, folder) {
 const index = await pack.getIndex();
 for (const entry of index.filter(item => item.folder === folder && variants.some(armor => armor.name === item.name))) {
  const item = await pack.getDocument(entry._id);
  const description = item?.system?.descricao;
  if (!description?.includes('Homebrew Land of the Snow equipment.')) continue;
  const rename = text => text.replaceAll('Suppression', 'Reduction').replaceAll('suppression', 'reduction').replaceAll('suppress hostile', 'reduce hostile').replaceAll('suppresses up to', 'reduces up to');
  if (rename(description) !== description || rename(item.system.caracteristicas) !== item.system.caracteristicas) {
   await item.update({ 'system.descricao': rename(description), 'system.caracteristicas': rename(item.system.caracteristicas) });
  }
 }
 const missing = variants.filter(armor => !index.some(item => item.folder === folder && item.name === armor.name));
 const oldPrototype = index.find(item => item.folder === folder && item.name === 'Black Prototype Armor');
 if (oldPrototype) {
  const item = await pack.getDocument(oldPrototype._id);
  if (item?.system?.descricao?.includes('A fitted armored vest') && !item.system.descricao.includes('Grants +2 Body Hardness')) {
   await item.update({
    'system.bodyHardnessBonus': 2,
    'system.descricao': 'Grants +2 Body Hardness while worn. Built-in gliding wings deploy or fold as a Partial Action. ' + item.system.descricao
   });
  }
 }
 if (!missing.length) return;
 await Item.createDocuments(missing.map(armor => ({
  name: armor.name, type: "equipamento", folder, img: "icons/equipment/chest/breastplate-collared-steel.webp",
  flags: { "shinobi-no-sho-revamp": { snowChakraArmor: { maxBarrier: armor.pool, suppression: armor.suppression, winged: Boolean(armor.winged) } } },
  system: {
   quantidade: 1, peso: armor.slots, valorRyo: armor.price, isArmor: true,
   absorption: 0, absorptionRemaining: 0, bodyHardnessBonus: armor.bodyHardness ?? 0, weaponCategory: "none",
   caracteristicas: `Special Armor. Requires ${armor.requirement}. Barrier pool ${armor.pool}; reduces up to ${armor.suppression} damage per hit. ${armor.price === 0 ? "GM-controlled prototype; no market price. The 0 Ryō field is a placeholder." : ""}`,
   descricao: `${armor.bodyHardness ? "Grants +2 Body Hardness while worn. " : ""}A fitted armored vest with shoulder guards and a chakra-powered protective field. ${common} Barrier pool: ${armor.pool}. Reduction: up to ${armor.suppression} damage per hit. While active, gain +${armor.filter} Accuracy to resistance checks against genjutsu. Once per round, spend ${armor.amplifyCost} additional Chakra when using a damaging ninjutsu for +${armor.amplifyDamage} base damage; this does not increase power level. ${armor.winged ? wings : ""}`
  }
 })), { pack: pack.collection });
}
