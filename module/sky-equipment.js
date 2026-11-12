const scope = "shinobi-no-sho-revamp";
const launcherName = "Sky Ninja — Handheld Kunai Launcher";
const entries = [
  ["Sky Ninja — Winged Mechanical Device", 900, 3, "Flight gear. Requires Agility 5 and Spirit 5. Occupies the back slot. Launch from a prepared platform as a Standard Action. Spend 2 Chakra to start and 1 at the start of each subsequent round. Fly up to 12 m per round. At 0 Chakra, glide or descend up to 12 m horizontally per round until landing. No armor absorption."],
  [launcherName, 450, 2, "Requires Agility 4 and Gunpowder training. Standard Action: spend 3 Kunai and make a normal ranged attack with weapon damage +2 piercing. Full Action burst: spend 6 Kunai, attack up to two different targets within 5 m of one another at −2 Accuracy each. Apply normal multi-target restrictions. Reloading the 24-kunai magazine is a Standard Action. Track standard Kunai inventory rather than a separate magazine pool.", { weaponCategory: "special", attackType: "ranged", weaponDamage: 2, damageType: "piercing", weaponRange: 20 }],
  ["Sky Ninja — Kunai Launcher Magazine", 55, 1, "Prepared 24-kunai magazine. Reload as a Standard Action. Track standard Kunai separately in inventory."],
  ["Sky Ninja — Aerial Explosive Bomb", 90, 1, "Standard Action to drop or throw up to 10 m. Detonates on impact in a 3 m radius. Appropriate defense against GM-set difficulty. Failure deals 5 explosive damage, success deals half rounded down. Each creature takes damage at most once.", { consumable: true, weaponRange: 10, weaponDamage: 5, damageType: "explosive" }],
  ["Sky Ninja — Kunai Scatter Bomb", 120, 1, "Standard Action to drop or throw up to 10 m. On impact, 4 m radius. Appropriate defense against GM-set difficulty. Failure deals 4 piercing damage, success deals 2. Expended on use. Requires 12 Kunai to manufacture or reload between missions.", { consumable: true, weaponRange: 10, weaponDamage: 4, damageType: "piercing" }],
  ["Sky Ninja — Aircraft Launch Rail", 1400, 0, "Fixed installation. One flyer wearing the Winged Mechanical Device can launch as a Standard Action. The rail itself has no Chakra cost. The GM may require installation on a vehicle or fortress."],
  ["Sky Ninja — Automated Kunai Trap", 240, 3, "Spend 2 Full Actions to set. When triggered, make a ranged attack using the setter’s trap accuracy or GM-set difficulty. On hit, deals 3 piercing damage and expends 3 Kunai. Holds 12 Kunai. Detect and disarm using normal trap rules.", { weaponRange: 15, weaponDamage: 3, damageType: "piercing" }],
  ["Sky Ninja — Chakra Beam Flying Machine", 0, 0, "GM vehicle. Three crew operate the machine and a fourth channels the beam. The gunner spends 10 Chakra and a Full Action to fire a line 30 m long and 3 m wide. GM-set defense. Failure deals 10 energy damage, success deals 5."],
  ["Ancor Vantian — Chakra-Draining Prison Cell", 0, 0, "Fixed fortress equipment. At the end of each round, a confined target loses 2 Chakra unless protected by an appropriate technique. Use scenario rules to escape or disable the cell."],
  ["Ancor Vantian — Fortress Chakra Cannon", 0, 0, "GM-controlled siege weapon powered by the fortress. Set damage and area for the adventure. Use scenario rules for structural destruction and durability."]
];

export async function ensureSkyEquipment(pack, folder) {
  const index = await pack.getIndex();
  const missing = entries.filter(([name]) => !index.some(item => item.folder === folder && item.name === name));
  if (!missing.length) return;
  const locked = pack.locked;
  if (locked) await pack.configure({ locked: false });
  try {
    await Item.createDocuments(missing.map(([name, valorRyo, peso, descricao, stats]) => ({
      name, type: "equipamento", folder,
      flags: { [scope]: { skyKunaiLauncher: name === launcherName } },
      system: { valorRyo, peso, descricao, quantidade: 1, ...stats }
    })), { pack: pack.collection });
  } finally {
    if (locked) await pack.configure({ locked: true });
  }
}

export function isSkyKunaiLauncher(item) {
  return item.getFlag(scope, "skyKunaiLauncher") === true || item.name === launcherName;
}

const pending = new Set();
export async function fireSkyKunaiLauncher(actor, launcher) {
  if (!actor.isOwner || pending.has(actor.uuid)) return;
  pending.add(actor.uuid);
  try {
    if (Number(actor.system.atributos?.agi?.valor ?? 0) < 4) {
      return ui.notifications.warn("The Kunai Launcher requires Agility 4.");
    }
    const spend = await new Promise(resolve => new Dialog({
      title: launcher.name,
      content: "<p>Gunpowder training is required. Confirm that your character is trained before firing.</p><p>Single fire is a Standard Action. Burst fire is a Full Action.</p>",
      buttons: {
        single: { label: "Single (3 Kunai)", callback: () => resolve(3) },
        burst: { label: "Burst (6 Kunai)", callback: () => resolve(6) },
        cancel: { label: "Cancel", callback: () => resolve(0) }
      },
      default: "cancel",
      close: () => resolve(0)
    }).render(true));
    if (!spend || !actor.items.has(launcher.id)) return;
    let remaining = spend;
    const updates = [];
    for (const ammo of actor.items) {
      if (ammo.type !== "equipamento" || !/^kunais?(?: \([^)]*\))?$/i.test(ammo.name.trim())) continue;
      const quantity = Number(ammo.system.quantidade);
      if (!Number.isInteger(quantity) || quantity < 1) continue;
      const used = Math.min(quantity, remaining);
      updates.push({ _id: ammo.id, "system.quantidade": quantity - used });
      remaining -= used;
      if (remaining === 0) break;
    }
    if (remaining) return ui.notifications.warn(`You need ${spend} Kunai to fire in this mode.`);
    await actor.updateEmbeddedDocuments("Item", updates);
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<h3>${foundry.utils.escapeHTML(launcher.name)}</h3><p>Spent ${spend} Kunai. Range 20 m. Resolve normal ranged attacks with +2 piercing weapon damage. ${spend === 6 ? "Burst: up to two different targets within 5 m of each other, at −2 Accuracy per attack." : "Single fire: one target."}</p>`
    });
  } catch (error) {
    console.error("Shinobi no Sho kunai launcher", error);
    ui.notifications.error("The launcher action did not finish. Check your Kunai stacks before retrying.");
  } finally {
    pending.delete(actor.uuid);
  }
}
