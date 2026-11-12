// Descriptions from Shinobi no Sho Basic Book 4.1.b, pp. 275–278.
export const SNS_CONDITIONS = [
  {
    "id": "sns-weakened",
    "name": "Weakened",
    "description": "-1 accuracy to all tests or specified tests; cumulative condition accuracy penalties capped at -3."
  },
  {
    "id": "sns-clinging",
    "name": "Clinging",
    "description": "Immobilized by a grapple."
  },
  {
    "id": "sns-scared",
    "name": "Scared",
    "description": "Move away from fear; if unable, become Weakened."
  },
  {
    "id": "sns-frightened",
    "name": "Frightened",
    "description": "Flee or cower; Weakened and cannot attack."
  },
  {
    "id": "sns-terrified",
    "name": "Terrified",
    "description": "Flee or cower; Stunned."
  },
  {
    "id": "sns-amputated",
    "name": "Amputated",
    "description": "Missing arm or hand; restrictions on two-handed weapons and hand seals."
  },
  {
    "id": "sns-stunned",
    "name": "Stunned",
    "description": "No actions, including free actions; reactions remain possible."
  },
  {
    "id": "sns-fallen",
    "name": "Fallen",
    "description": "Prone; -3 melee combat and melee/area defenses; +3 defenses versus other ranged attacks."
  },
  {
    "id": "sns-blind",
    "name": "Blind",
    "description": "Cannot see; total visual camouflage rules apply."
  },
  {
    "id": "sns-confused",
    "name": "Confused",
    "description": "Random actions determined by 1d8 per book."
  },
  {
    "id": "sns-tired-fatigued",
    "name": "Tired / Fatigued",
    "description": "Attack and defense weakened; another application becomes Exhausted."
  },
  {
    "id": "sns-exhausted",
    "name": "Exhausted",
    "description": "Attack and defense weakened -3; repeat or while fatigued causes unconsciousness."
  },
  {
    "id": "sns-fascinated",
    "name": "Fascinated",
    "description": "Focus on effect; obvious threat breaks fascination."
  },
  {
    "id": "sns-feinted",
    "name": "Feinted",
    "description": "Defense weakened -2."
  },
  {
    "id": "sns-flanked",
    "name": "Flanked",
    "description": "Defense weakened against flanking enemies."
  },
  {
    "id": "sns-prevented",
    "name": "Prevented",
    "description": "Cannot leave position; weakened attack/defense and limited area defense."
  },
  {
    "id": "sns-unconscious",
    "name": "Unconscious",
    "description": "Helpless and cannot act."
  },
  {
    "id": "sns-helpless-paralyzed",
    "name": "Helpless / Paralyzed",
    "description": "Cannot act or defend; attacks automatically hit, subject to relevant exceptions."
  },
  {
    "id": "sns-slow",
    "name": "Slow",
    "description": "Half speed; cannot sprint or dash."
  },
  {
    "id": "sns-dying",
    "name": "Dying",
    "description": "Unconscious and losing Vitality; -11 to -20 Vitality."
  },
  {
    "id": "sns-stable",
    "name": "Stable",
    "description": "Unconscious but no longer losing Vitality."
  },
  {
    "id": "sns-unprepared",
    "name": "Unprepared",
    "description": "Defense weakened -3; loses Dodge bonus."
  },
  {
    "id": "sns-dazzled",
    "name": "Dazzled",
    "description": "Vision impaired; weakened sight-dependent tests."
  },
  {
    "id": "sns-bleeding",
    "name": "Bleeding",
    "description": "Lose 2 Vitality per turn per level; stabilization tests required."
  },
  {
    "id": "sns-suffocation",
    "name": "Suffocation",
    "description": "Stamina checks to hold breath; escalating difficulty and damage."
  },
  {
    "id": "sns-deaf",
    "name": "Deaf",
    "description": "Cannot hear; initiative weakened -3."
  },
  {
    "id": "sns-dizzy",
    "name": "Dizzy",
    "description": "Lose movement action."
  }
];
Hooks.once('init', () => {
  const current = Array.from(CONFIG.statusEffects ?? []);
  const known = new Set(current.map(e => e.id));
  for (const c of SNS_CONDITIONS) if (!known.has(c.id)) current.push({id:c.id,name:c.name,label:c.name,description:c.description,img:'icons/svg/aura.svg',icon:'icons/svg/aura.svg'});
  CONFIG.statusEffects = current;
});
