const scope = "shinobi-no-sho-revamp";
const launcherName = "Kihō’s Wrist-Mounted Bomb Launcher";
const bombs = {
  smoke: { name: "Smoke Bomb", price: 20, stack: 5, effect: "On impact, creates a 3 m radius smoke cloud until the end of the next round or until strong wind disperses it. Apply normal visibility and concealment rules." },
  poison: { name: "Poison Gas Bomb", price: 60, stack: 3, effect: "On impact, creates a 3 m radius gas cloud for one round. Breathing creatures make a poison resistance check. Failure gives −2 Accuracy on their next action. Respirator bonuses apply. Overlapping clouds do not stack." }
};

const pendingShots = new Set();
const bombType = item => item?.type === "equipamento"
  ? Object.keys(bombs).find(key => item.getFlag(scope, "bombType") === key || item.name.toLowerCase() === bombs[key].name.toLowerCase())
  : undefined;

export function isBombLauncher(item) {
  return item.getFlag(scope, "bombLauncher") === true || item.name === launcherName;
}

export async function fireBombLauncher(actor, launcher) {
  if (!actor.isOwner || pendingShots.has(actor.uuid)) return;
  pendingShots.add(actor.uuid);
  try {
    const choices = actor.items.filter(item => bombType(item) && item.system.quantidade > 0);
    if (!choices.length) return ui.notifications.warn("No compatible bombs are available.");
    const escape = foundry.utils.escapeHTML;
    const options = choices.map(item => `<option value="${escape(item.id)}">${escape(item.name)} (×${Number(item.system.quantidade)})</option>`).join("");
    const id = await new Promise(resolve => new Dialog({
      title: launcher.name,
      content: `<form><label>Choose the bomb to fire <select name="ammo">${options}</select></label><p>Confirm after loading the chosen bomb (Standard Action under the supplement’s proposed reload rule). Firing spends one bomb even if the attack misses.</p></form>`,
      buttons: {
        fire: { label: "Fire", callback: html => resolve(html.find('[name="ammo"]').val()) },
        cancel: { label: "Cancel", callback: () => resolve(null) }
      },
      default: "cancel",
      close: () => resolve(null)
    }).render(true));
    if (!id || !choices.some(item => item.id === id)) return;
    const ammo = actor.items.get(id);
    const type = bombType(ammo);
    const quantity = Number(ammo?.system.quantidade);
    if (!actor.items.has(launcher.id) || !type || !Number.isInteger(quantity) || quantity < 1) {
      return ui.notifications.warn("The launcher or selected ammunition is no longer available.");
    }
    await ammo.update({ "system.quantidade": quantity - 1 });
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<h3>${escape(launcher.name)}</h3><p>Fired one ${escape(ammo.name)}. ${quantity - 1} remaining in this stack.</p><p>Range 15 m. Resolve the ranged attack normally and use the GM’s scatter procedure on a miss.</p><p>${bombs[type].effect}</p>`
    });
  } catch (error) {
    console.error("Shinobi no Sho launcher", error);
    ui.notifications.error("The launcher action did not finish. Check the ammunition stack before retrying.");
  } finally {
    pendingShots.delete(actor.uuid);
  }
}

export async function ensureTeamGurenEquipment(pack, folder) {
  const entries = [{
    name: launcherName,
    flags: { [scope]: { bombLauncher: true } },
    system: {
      weaponCategory: "special", attackType: "ranged", weaponRange: 15, weaponDamage: 0,
      valorRyo: 500, peso: 2, descricao: "Choose a Smoke Bomb or Poison Gas Bomb when loading. Firing consumes the selected bomb and uses its effect. Proposed reload: Standard Action."
    }
  }, {
    name: "Nurari’s Slim Suit",
    system: { valorRyo: 400, peso: 2, isArmor: true, absorption: 0,
      descricao: "Special Light Armor. Armor penalty 0. While worn, gain +3 Accuracy to escape physical grabs and grapples. Seals, chakra restraints and nonphysical immobilization are unaffected." }
  }, {
    name: "Kigiri’s Respirator Mask",
    system: { valorRyo: 150, peso: 1, absorption: 0,
      descricao: "While properly worn, gain +3 Accuracy on resistance checks against inhaled poison and harmful gases. Provides no oxygen or protection against contact poison." }
  }, ...Object.entries(bombs).map(([key, bomb]) => ({
    name: bomb.name,
    flags: { [scope]: { bombType: key } },
    system: { valorRyo: bomb.price, peso: 1, unitsPerSlot: bomb.stack, descricao: bomb.effect }
  }))];
  const index = await pack.getIndex();
  const missing = entries.filter(entry => !index.some(item => item.folder === folder && item.name === entry.name));
  if (!missing.length) return;
  await Item.createDocuments(missing.map(entry => ({
    ...entry, type: "equipamento", folder, system: { quantidade: 1, ...entry.system }
  })), { pack: pack.collection });
}
