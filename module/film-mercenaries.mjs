import {odourlessPoisonMist} from './bestiary-poisons.mjs';

const systemId = 'shini-no-sho-altered';

function mercenary({id, name, nc, affiliation, attributes, skills, vitality, chakra, biography, items}) {
  return {
    name, type: 'personagem', img: 'icons/svg/mystery-man.svg',
    prototypeToken: {name, actorLink: false, disposition: -1},
    flags: {[systemId]: {bestiaryBoss: id}},
    system: {
      cabecalho: {nome: name, nc, patente: 'Mercenary Shinobi', filiacao: affiliation},
      atributos: Object.fromEntries(Object.entries(attributes).map(([key, valor]) => [key, {valor}])),
      pericias: Object.fromEntries(Object.entries(skills).map(([key, pontos]) => [key, {pontos}])),
      energias: {vitalidade: {value: vitality, max: vitality}, chakra: {value: chakra, max: chakra}},
      databook: {biografia: biography}
    },
    items
  };
}

function technique(name, style, level, cost, description) {
  return {
    name, type: 'poder', img: 'icons/svg/book.svg',
    system: {tipo: style, nivelUsado: level, custo: `${cost} Chakra`, custoChakra: cost, descricao: description}
  };
}

function snowArmor(winged = false) {
  return {
    name: winged ? 'Winged Chakra Armor' : 'Chakra Armor',
    type: 'equipamento', img: 'icons/equipment/chest/breastplate-collared-steel.webp',
    flags: {[systemId]: {snowChakraArmor: {maxBarrier: 12, suppression: 2, winged}}},
    system: {
      equipped: true, isArmor: true, absorption: 0, absorptionRemaining: 0, quantidade: 1,
      descricao: 'Activate or deactivate as a Partial Action. Maintain for 1 Chakra at the start of each turn. After ordinary defenses, reduce hostile ninjutsu or genjutsu damage by up to 2, spending that many points from the 12-point barrier pool. The field shuts down at 0 and does not protect against weapons or taijutsu. Apply only the strongest armor reduction. While active, gain +2 Accuracy to genjutsu resistance. Once per round, spend 2 extra Chakra for +1 base damage on a damaging ninjutsu. Restore the barrier in a workshop over 4 hours. Track manually.' +
        (winged ? ' Deploy or fold the wings as a Partial Action. While descending in open space, glide up to normal movement horizontally per Move Action. The wings provide no lift or hover.' : '')
    }
  };
}

export const fubukiKakuyoku = mercenary({
  id: 'fubuki-kakuyoku', name: 'Fubuki Kakuyoku', nc: 11, affiliation: 'Yukigakure',
  attributes: {for: 5, des: 8, agi: 9, per: 7, vig: 7, int: 8, esp: 11},
  skills: {concentracao: 5, prontidao: 5, acrobacia: 5, procurar: 4, escapar: 4},
  vitality: 82, chakra: 42,
  biography: '<p><strong>Film · Ninja Clash in the Land of Snow</strong></p><p>Fubuki uses winged chakra armor and controls existing snow and ice. Open with a ranged attack, then pin one opponent so her allies can reposition. The stats and technique effects are tabletop adaptations resolved manually.</p>',
  items: [
    snowArmor(true),
    technique('Swallow Snow Storm', 'Ice Release', 4, 4, 'Standard action. Requires existing snow or ice. Make one ranged ninjutsu attack against one target within 16 m. Resolve 8 base damage using the normal damage degree. The flock resolves as one attack.'),
    technique('Ice Prison Technique', 'Ice Release', 4, 4, 'Standard action. Requires existing snow or ice. Make one ranged ninjutsu attack against a target within 12 m. On a hit, ice fixes the target in place until the end of its next turn. It can still attack and defend. It or an adjacent ally can spend a Standard Action to break it early with a Strength test (difficulty 18). No damage. Once per target per scene.'),
    {
      name: 'Ice Bomb', type: 'equipamento', img: 'icons/svg/explosion.svg',
      system: {quantidade: 2, descricao: 'Standard action. Expend one bomb and throw it at one target within 8 m. Roll a normal ranged weapon attack. On a hit, resolve 4 base damage using normal damage degree. Track consumption manually.'}
    }
  ]
});

export const mizoreFuyukuma = mercenary({
  id: 'mizore-fuyukuma', name: 'Mizore Fuyukuma', nc: 10, affiliation: 'Yukigakure',
  attributes: {for: 10, des: 8, agi: 6, per: 6, vig: 10, int: 5, esp: 6},
  skills: {atletismo: 5, mecanismo: 5, prontidao: 5, escapar: 4, acrobacia: 4},
  vitality: 96, chakra: 26,
  biography: '<p><strong>Film · Ninja Clash in the Land of Snow</strong></p><p>Mizore uses powered armor, a mechanical arm and a snowboard. Use him to hold a narrow approach or chase opponents downhill. The equipment effects are tabletop adaptations resolved manually.</p>',
  items: [
    snowArmor(),
    {
      name: 'Mechanical Gauntlet', type: 'equipamento', img: 'icons/svg/fist.svg',
      system: {equipped: true, weaponCategory: 'natural', attackType: 'melee', weaponSize: 'light', weaponDamage: 2,
        damageType: 'bludgeoning', quantidade: 1,
        descricao: 'Powered melee strike. Add the weapon damage shown on this item to the normal Strength-based damage calculation. Use standard melee reach.'}
    },
    {
      name: 'Snowboard', type: 'equipamento', img: 'icons/svg/item-bag.svg',
      system: {quantidade: 1, descricao: 'When riding downhill as a Move Action, move up to 1.5 times normal movement, rounded down to the nearest meter. Ignore difficult terrain caused by snow along the rideable route. Use normal movement on level snow and normal checks for hazards. The board cannot carry you uphill or across bare ground.'}
    }
  ]
});

export const karenbana = mercenary({
  id: 'karenbana', name: 'Karenbana', nc: 11, affiliation: 'Wandering Ninja Clan',
  attributes: {for: 7, des: 9, agi: 11, per: 8, vig: 6, int: 8, esp: 6},
  skills: {furtividade: 5, acrobacia: 5, prontidao: 5, concentracao: 5, escapar: 5, procurar: 4},
  vitality: 76, chakra: 32,
  biography: '<p><strong>Film · Guardians of the Crescent Moon Kingdom</strong></p><p>Karenbana combines camouflage, illusory petals and a kunai. Her perfume and audible footsteps can give her position away. The stats and technique effects are tabletop adaptations resolved manually.</p>',
  items: [
    {
      name: 'Kunai', type: 'equipamento', img: 'icons/svg/dagger.svg',
      system: {equipped: true, weaponCategory: 'simple', attackType: 'melee', weaponSize: 'light', weaponDamage: 1,
        damageType: 'piercing', weaponRange: 15, quantidade: 1}
    },
    technique('Illusory Petals', 'Magen', 4, 4, 'Standard action. One target within 10 m that can see Karenbana and is suffering the effects of her clan’s Odourless Poison Mist makes its normal genjutsu resistance test (difficulty 18). On failure, its next attack against Karenbana before the end of its next turn takes a −2 Accuracy penalty. A successful Kai ends the effect. No damage, and repeated uses do not stack.'),
    technique('Hiding with Camouflage Technique', 'Ninjutsu', 3, 3, 'Standard action. Make a normal Stealth test. Until the end of Karenbana’s next turn, observers use appropriate senses to oppose it. The camouflage masks her visually, while hearing, scent and disturbed surroundings can reveal her. It ends immediately after she attacks or uses another technique.'),
    odourlessPoisonMist(2)
  ]
});

export const nadareRoga = mercenary({
  id: 'nadare-roga', name: 'Nadare Rōga', nc: 12, affiliation: 'Yukigakure',
  attributes: {for: 6, des: 8, agi: 9, per: 9, vig: 8, int: 9, esp: 12},
  skills: {concentracao: 6, prontidao: 6, acrobacia: 5, procurar: 5, rastrear: 4},
  vitality: 94, chakra: 48,
  biography: '<p><strong>Film · Ninja Clash in the Land of Snow</strong></p><p>A member of Dotō’s Snow Ninja team. His techniques shape existing snow and ice, so use snowy slopes or ice fields when staging his encounter. The statistics and technique effects are tabletop adaptations. Resolve effects and usage limits manually.</p>',
  items: [
    snowArmor(),
    {
      name: 'Kunai', type: 'equipamento', img: 'icons/svg/dagger.svg',
      system: {equipped: true, weaponCategory: 'simple', attackType: 'melee', weaponSize: 'light',
        weaponDamage: 1, damageType: 'piercing', weaponRange: 15, quantidade: 1,
        descricao: 'Standard shinobi backup weapon for this tabletop build.'}
    },
    technique('Wolf Fang Avalanche Technique', 'Ice Release', 5, 5,
      'Standard action. Requires a snow-covered slope. Shape the sliding snow into wolves that surge down a 15 m line, 2 m wide. Roll one ranged ninjutsu attack and resolve it against each creature in the line for 7 base damage using normal damage degrees. A Lightning Release technique that intercepts the pack disperses the wolves from that point onward. Once per scene.'),
    technique('Tearing Dragon Fierce Tiger', 'Ice Release', 5, 5,
      'Standard action. Requires nearby ice. Shape it into a tiger and make one ranged ninjutsu attack within 18 m for 8 base damage using normal damage degrees. If an ongoing Water Release effect lies in its path, Nadare may target that effect instead. Resolve the clash normally and freeze the water if he wins.'),
    technique('One Horned White Whale', 'Ice Release', 6, 7,
      'Standard action. Requires a large mass of existing ice. Form a horned whale and place a 3 m radius impact area centered within 15 m. Roll one ranged ninjutsu attack and resolve it against each creature in the area for 9 base damage using normal damage degrees. Once per scene.')
  ]
});

export const kongo = mercenary({
  id: 'kongo', name: 'Kongō', nc: 11, affiliation: 'Wandering Ninja Clan',
  attributes: {for:11, des:5, agi:5, per:6, vig:11, int:4, esp:5},
  skills: {atletismo:5, prontidao:5, escapar:4}, vitality:98, chakra:25,
  biography: '<p><strong>Film · Guardians of the Crescent Moon Kingdom</strong></p><p>Kongō is the trio’s close-combat bruiser. Use the normal unarmed attack and forced-movement maneuvers when appropriate. Karenbana disrupts opponents while Ishidate threatens Petrifying Touch.</p>',
  items: [{
    name:'Unarmed Strike', type:'equipamento', img:'icons/svg/fist.svg',
    system:{equipped:true, weaponCategory:'natural', attackType:'melee', weaponSize:'light',
      weaponDamage:0, damageType:'bludgeoning', quantidade:1}
  }, odourlessPoisonMist()]
});
