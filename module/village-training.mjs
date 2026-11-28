const rules = {
  'Expert (Art)': [76, '', 'Gain +2 Accuracy on Art tests.', 'Art'],
  Fighter: [63, '', 'Ignore the normal −2 Accuracy penalty for special combat maneuvers performed unarmed or with natural weapons.'],
  Throw: [68, 'Strength 6 and Fighter', 'When using an unarmed Takedown, you may throw the target backward or upward up to 1 m per Strength (maximum 10 m). An upward throw ends with a fall at the end of the turn.'],
  Intuition: [63, '', 'Gain +1 Accuracy on Read Motion.'],
  Reflexes: [66, '', 'Gain +1 Accuracy on Dodge.'],
  Diligent: [63, '', 'Gain +3 on Initiative checks. Once per scene, you may reroll an Initiative check, including a tie-breaking check. You must accept the new roll.'],
  Standing: [63, '', 'Stand up as a Free Action on your turn. Once per scene, you may also stand as a reaction immediately after an opponent knocks you down.'],
  'Block Weapon': [69, '', 'Gain +1 Accuracy when Blocking armed melee attacks. Beat the opposing roll by at least 4 to attempt a free Disarm. A critical Block disarms automatically.'],
  'Deep Illusion': [74, 'Intelligence 5', 'Increase the resistance difficulty of your illusions by 1. Apply this to the base difficulty on eligible Magen and other listed illusions. The bonus is +2 against Kai used to dispel the illusion.']
};

const training = {
  'land-of-birds-ghost-samurai': ['Block Weapon', 'prontidao', 4],
  'land-of-iron-samurai-captain': ['Block Weapon', 'prontidao', 5],
  'kaguya-clan-leader': [null, 'atletismo', 5],
  ranmaru: ['Intuition', 'procurar', 5],
  'bandit-leader': ['Intuition', 'furtividade', 4],
  'shinno-base': ['Intuition', 'medicina', 5],
  'shinno-body-revival': ['Standing', 'atletismo', 5],
  'kazuma-furiido': ['Diligent', 'prontidao', 5],
  sora: ['Fighter', 'acrobacia', 4],
  'doto-kazahana': ['Diligent', 'concentracao', 5],
  ishidate: ['Fighter', 'atletismo', 6],
  karenbana: ['Deep Illusion', 'furtividade', 5],
  kongo: [['Fighter','Throw'], 'atletismo', 5],
  'nadare-roga': ['Reflexes', 'rastrear', 4],
  'fubuki-kakuyoku': ['Reflexes', 'voo', 4],
  'mizore-fuyukuma': ['Standing', 'mecanismo', 5],
  'konoha-anbu': ['Reflexes', 'disfarce', 4],
  'suna-anbu': ['Diligent', 'mecanismo', 5],
  'kiri-hunter-nin': ['Intuition', 'rastrear', 5],
  'konoha-medic': ['Diligent', 'medicina', 4],
  'village-specialist:Konohagakure': ['Diligent', 'atletismo', 3],
  'village-specialist:Sunagakure': ['Reflexes', 'procurar', 3],
  'village-specialist:Kirigakure': ['Intuition', 'procurar', 3],
  'village-specialist:Kumogakure': ['Block Weapon', 'atletismo', 3],
  'village-specialist:Iwagakure': ['Standing', 'atletismo', 3],
  'village-specialist:Amegakure': ['Reflexes', 'acrobacia', 3],
  'village-specialist:Takigakure': ['Intuition', 'procurar', 3],
  'village-specialist:Hoshigakure': ['Diligent', 'acrobacia', 3]
};

// Additional training for full NPC profiles with a specific role or fighting style.
const loreAptitudes = {
  'kaguya-clan-leader': ['Standing'],
  banna: ['Diligent'],
  'shinno-body-revival': ['Fighter'],
  suien: ['Block Weapon'],
  fujin: ['Fighter'],
  raijin: ['Fighter'],
  renga: ['Intuition'],
  jiga: ['Intuition'],
  suzumebachi: ['Diligent'],
  hanzaki: ['Block Weapon'],
  genyumaru: ['Fighter'],
  waraji: ['Block Weapon'],
  zori: ['Block Weapon'],
  ryugan: ['Block Weapon'],
  suiko: ['Standing'],
  gatsu: ['Block Weapon'],
  sazanami: ['Block Weapon'],
  tonbei: ['Intuition'],
  gitai: ['Standing'],
  shiin: ['Deep Illusion'],
  oboro: ['Intuition'],
  'kin-tsuchi': ['Deep Illusion'],
  'dosu-kinuta': ['Reflexes'],
  menma: ['Expert (Art)'],
  'konoha-anbu-elite': ['Intuition']
};

export function villageTraining(id, actor) {
  const [aptitudes, skill, points] = training[id] ?? [];
  const attributes = actor.system.atributos ?? {};
  const owned = name => actor.items?.some(item => item.type === 'aptidao' && item.name.toLowerCase() === name.toLowerCase());
  const planned = [...[aptitudes].flat().filter(Boolean), ...(loreAptitudes[id] ?? [])];
  const meetsRequirements = name =>
    (name !== 'Deep Illusion' || attributes.int?.valor >= 5) &&
    (name !== 'Throw' || (attributes.for?.valor >= 6 && (owned('Fighter') || planned.includes('Fighter'))));
  const items = planned.filter(meetsRequirements).map(name => {
    const [page, preRequisito, description, aptitudeChoice] = rules[name];
    return {
      name, type:'aptidao', img:'icons/svg/book.svg',
      system:{preRequisito, ...(aptitudeChoice ? {aptitudeChoice} : {}), descricao:`${description} Basic Book 4.1b${page ? `, p. ${page}` : ''}. Apply manually.`}
    };
  });
  const learned = actor.system.pericias?.[skill]?.pontos;
  return {items, skills:skill && !learned ? {[skill]:{pontos:points}} : {}};
}
