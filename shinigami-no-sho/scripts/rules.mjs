export const ATTRIBUTES = {
  strength: "Strength", dexterity: "Dexterity", agility: "Agility",
  perception: "Perception", intelligence: "Intelligence", vigor: "Vigor", spirit: "Spirit"
};

export const COMBAT = {
  melee: ["Melee Combat", "strength"], ranged: ["Ranged Combat", "dexterity"],
  dodge: ["Dodge", "agility"], read: ["Read Movement", "perception"]
};

export const EXPERTISE = {
  acrobatics: ["Acrobatics", "agility"], athletics: ["Athletics", "strength"],
  concentration: ["Concentration", "intelligence"], control: ["Control", "intelligence"],
  culture: ["Culture", "intelligence"], deception: ["Deception", "intelligence"],
  eloquence: ["Eloquence", "perception"], escape: ["Escape", "dexterity"],
  mechanisms: ["Mechanisms", "intelligence"], medicine: ["Medicine", "intelligence"],
  sciences: ["Natural Sciences", "intelligence"], occultism: ["Occultism", "intelligence"],
  readiness: ["Readiness", "perception"], search: ["Search", "perception"],
  stealth: ["Stealth", "agility"]
};

export const LINEAGES = ["Shinigami", "Hollow", "Arrancar", "Human", "Fullbringer", "Quincy",
  "Shaman", "Adze", "Templar", "Dragon", "Custom"];

export const ACTIONS = ["", "Standard", "Move", "Partial", "Complete", "Reaction", "Free"];

export function derive(system) {
  const attr = system.attributes;
  const combat = Object.fromEntries(Object.entries(COMBAT).map(([key, [,attribute]]) =>
    [key, system.combatBase[key] + attr[attribute]]));
  const expertise = Object.fromEntries(Object.entries(EXPERTISE).map(([key, [,attribute]]) =>
    [key, Math.ceil(attr[attribute] / 2) + system.expertiseRanks[key]]));
  return {combat, expertise, initiative: attr.agility + expertise.readiness + system.initiativeBonus,
    vitalityMax: Math.max(1, 10 + 3 * attr.vigor + 5 * system.campaignLevel + system.vitalityBonus),
    reiatsuMax: Math.max(0, 10 + 3 * attr.spirit + system.reiatsuBonus)};
}

export function vitalityState(value) {
  if (value > 0) return "Conscious";
  if (value === 0) return "Incapacitated";
  if (value >= -10) return "Unconscious";
  if (value >= -20) return "Dying";
  return "Dead";
}

export function checkResult(dice, accuracy, difficulty) {
  if (dice >= 15) return "Automatic success";
  if (dice <= 3) return "Automatic failure";
  if (difficulty == null) return "";
  return dice + accuracy >= difficulty ? "Success" : "Failure";
}

export function applyLethalDamage(vitality, amount) {
  return vitality > 0 ? Math.max(0, vitality - amount) : vitality - amount;
}
