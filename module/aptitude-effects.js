const normalize = value => String(value ?? '').normalize('NFD').replace(/\p{Diacritic}/gu,'').trim().toLowerCase();

const toggles = {
  diligente:['diligent','diligente'],
  velocista:['sprinter','velocista'],
  quimico:['chemist','chemical','chemical*','quimico'],
  burroCarga:['pack mule','burro de carga'],
  corpulencia:['stout build','corpulence','corpulencia'],
  resiliencia:['resilience','resiliencia'],
  chakraExpandido:['expanded chakra','chakra expandido'],
  furtividadePerceptiva:['perceptive stealth','furtividade perceptiva']
};

const skillNames = {
  flight:'voo', acrobatics:'acrobacia', art:'arte', athletics:'atletismo',
  'natural sciences':'ciencias', concentration:'concentracao', culture:'cultura',
  disguise:'disfarce', escape:'escapar', stealth:'furtividade', 'animal handling':'lidarAnimais',
  mechanics:'mecanismo', medicine:'medicina', occultism:'ocultismo', 'sleight of hand':'prestidigitacao',
  search:'procurar', readiness:'prontidao', tracking:'rastrear', poisoncraft:'veneficio'
};

const baseTargets = ['vitality','chakra','hardness','absorption','initiative','movement','inventory',
  'combat.corporal','combat.distancia','combat.esquiva','combat.lerMovimentos',
  'damage.danoForca','damage.danoDestreza','damage.danoEspirito'];
const skillTargets = Object.values(skillNames).map(key=>`skill.${key}`);
const targets = new Map([...baseTargets,...skillTargets].map(key=>[normalize(key),key]));
for (const [label,key] of Object.entries(skillNames)) targets.set(`skill.${label}`,`skill.${key}`);
const bows = new Set(['short bow','long bow','bow']);
const thrown = new Set(['kunai','senbon','shuriken','lance']);

export function aptitudeEffects(actor, systemId) {
  const items = typeof actor?.getFlag?.(systemId,'villageHenchman') === 'string'
    ? [] : Array.from(actor?.items ?? []).filter(item=>item.type === 'aptidao' && !item.system?.aptitudeInactive);
  const names = new Set(items.map(item=>normalize(item.name)));
  const config = {...actor?.system?.configuracoes};
  for (const [key,aliases] of Object.entries(toggles)) {
    if (aliases.some(name=>names.has(name))) config[key] = true;
  }
  const bonuses = new Map();
  function add(key, value) {
    bonuses.set(key,(bonuses.get(key) ?? 0)+value);
  }
  const hasAny = (...aliases) => aliases.some(name=>names.has(name));
  if (hasAny('reflexes','reflexos')) add('combat.esquiva',1);
  if (hasAny('intuition','intuicao')) add('combat.lerMovimentos',1);
  const expertSkills = new Set();
  for (const item of items) {
    const name = normalize(item.name);
    const choice = normalize(item.system?.aptitudeChoice || name.match(/\(([^)]+)\)$/)?.[1]);
    if (/^(expert|perito)(?:\s*\(|$)/.test(name)) {
      const target = targets.get(`skill.${choice}`);
      if (target) expertSkills.add(target);
    }
    for (const line of String(item.system?.aptitudeModifiers ?? '').split('\n')) {
      const match = /^\s*([^=]+)\s*=\s*([+-]?\d+)\s*$/.exec(line);
      if (!match) continue;
      const target = targets.get(normalize(match[1]));
      const amount = Number(match[2]);
      if (target && Number.isSafeInteger(amount)) add(target,amount);
    }
  }
  for (const key of expertSkills) add(key,2);
  return {config, bonus:key=>bonuses.get(key) ?? 0, items, hasAny};
}

export function weaponAptitudeEffects(actor, weapon, systemId) {
  const {items,hasAny} = aptitudeEffects(actor,systemId);
  const {attackType,weaponCategory,weaponDamage,weaponSize} = weapon.system ?? {};
  const name = normalize(weapon.name).replace(/\s*\([^)]*\)$/,'');
  const dexterity = Number(actor.system?.atributos?.des?.valor ?? 0);
  const strength = Number(actor.system?.atributos?.for?.valor ?? 0);
  const unarmed = /^(unarmed(?: attack| strike)?|ataque desarmado)$/.test(name);
  const ranged = attackType === 'ranged';
  const finesse = !ranged && dexterity >= 3 && (unarmed || weaponSize === 'light') &&
    hasAny('acuity','finesse','acuidade');
  const shooter = dexterity >= 12 && ranged && weaponDamage > 0 && items.some(item=>{
    const title = normalize(item.name);
    if (!/^(shooter|atirador)(?:\s*\(|$)/.test(title)) return false;
    const choice = normalize(item.system?.aptitudeChoice || title.match(/\(([^)]+)\)$/)?.[1]);
    return (['bow','bows','arco','arcos'].includes(choice) && bows.has(name)) ||
      (['throwing','thrown','simple throwing weapons','arremesso'].includes(choice) &&
        weaponCategory === 'simple' && thrown.has(name));
  });
  const criticalMin = Number(String(weapon.system?.criticalRange ?? '15-16').match(/\d+/)?.[0] ?? 15);
  const enhancedCritical = items.some(item => {
    const title = normalize(item.name);
    if (!/^(enhanced critic|enhanced critical|critico aprimorado)(?:\s*\(|$)/.test(title)) return false;
    const choice = normalize(item.system?.aptitudeChoice || title.match(/\(([^)]+)\)$/)?.[1]);
    return choice && (choice === name || (unarmed && choice === 'unarmed'));
  });
  const ironFist = unarmed && Number(weaponDamage ?? 0) === 0 && strength >= 2 &&
    hasAny('iron fist','punho de ferro');
  return {
    criticalMin: Math.max(4, criticalMin - (enhancedCritical ? 1 : 0)),
    accuracy: finesse && !actor.system?.configuracoes?.acuidade ? dexterity-strength : 0,
    damage:(shooter ? (bows.has(name) ? 1 : 3) : 0) +
      (ironFist ? (strength >= 12 ? 4 : strength >= 10 ? 3 : strength >= 8 ? 2 : 1) : 0)
  };
}
