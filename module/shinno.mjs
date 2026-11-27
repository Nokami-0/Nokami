import {konohaMedic} from './konoha-medic.mjs';

const technique = (name, cost, descricao) => ({
  name, type: 'poder', img: 'icons/svg/book.svg',
  system: {tipo: 'Shinnō · Film Adaptation', nivelUsado: 1, custoChakra: cost, custo: cost + ' Chakra', descricao}
});
const gear = name => ({name, type: 'equipamento', img: 'icons/svg/item-bag.svg', system: {quantidade: 1}});
const medical = konohaMedic.items.map(item => ({
  ...item, system: {...item.system, ...(item.type === 'poder' && {
    descricao: item.system.descricao.replace(' (8 at level 4)', '')
  })}
}));
const unarmed = {
  name: 'Unarmed Strike', type: 'equipamento', img: 'icons/svg/fist.svg',
  system: {equipped: true, weaponCategory: 'natural', attackType: 'melee', weaponSize: 'light',
    weaponDamage: 0, damageType: 'Bludgeoning', quantidade: 1}
};

function form({name, id, nc, vitality, chakra, strength, dexterity, agility, vigor, biography, items}) {
  return {
    name, type: 'personagem', prototypeToken: {name, actorLink: false, disposition: -1},
    flags: {'shinobi-no-sho-revamp': {bestiaryBoss: id}},
    system: {
      cabecalho: {nome: name, nc, patente: 'Boss NPC', filiacao: 'Land of the Sky'},
      atributos: {
        for: {valor: strength}, des: {valor: dexterity}, agi: {valor: agility}, per: {valor: 9},
        vig: {valor: vigor}, int: {valor: 13}, esp: {valor: 12}
      },
      pericias: {medicina: {pontos: 8}, concentracao: {pontos: 7}, prontidao: {pontos: 5},
        procurar: {pontos: 5}, atletismo: {pontos: 4}},
      periciasSociais: {enganar: {pontos: 7}},
      energias: {vitalidade: {value: vitality, max: vitality}, chakra: {value: chakra, max: chakra}},
      databook: {biografia: '<p><strong>Film · Bonds</strong></p><p>' + biography + '</p>'}
    },
    items: [unarmed, ...medical, ...items]
  };
}

export const shinnoBase = form({
  name: 'Shinnō — Base Form', id: 'shinno-base', nc: 12, vitality: 96, chakra: 48,
  strength: 6, dexterity: 7, agility: 8, vigor: 8,
  biography: 'A traveling physician and covert Sky Ninja. The GM tracks phase changes and usage limits manually.',
  items: [
    gear('Traveling Physician’s Robes'), gear('Medical Kit'), gear('Bandages'),
    gear('Reincarnation Research Scroll'),
    technique('Body Revival Technique', 8, 'Once per scene, when reduced to 0 Vitality, pay the cost and appear dead. At the start of the next turn, rise in base form with 24 Vitality. If connected to the Zero-Tails’ Dark Chakra, the GM may switch to Body Revival Form instead and set its current Vitality to 96 and Chakra to 40. Carry scene usage limits forward.')
  ]
});

export const shinnoRevival = form({
  name: 'Shinnō — Body Revival Form', id: 'shinno-body-revival', nc: 16, vitality: 144, chakra: 64,
  strength: 15, dexterity: 9, agility: 12, vigor: 13,
  biography: 'Ultimate Body. When entering this phase from base form, set current Vitality to 96 and Chakra to 40. If the Zero-Tails connection is severed, regeneration and both Revival Fists shut down immediately. Revert at the end of his next turn, keeping current Vitality and Chakra capped at 96 and 48. The GM resolves phase changes, effects, and usage limits manually.',
  items: [
    gear('Wrist Wraps'), gear('Traveling Clothes'),
    technique('Body Regeneration', 3, 'At the start of his turn, recover 8 Vitality, up to three uses per scene. Requires at least 1 Vitality and an active Zero-Tails connection.'),
    technique('Revival Fist', 5, 'Standard action, 5 m. With an active Zero-Tails connection, make a Ninjutsu attack for 6 base damage using normal damage degrees.'),
    technique('Super Revival Fist', 9, 'Standard action, melee reach, once per scene. With an active Zero-Tails connection, make a Ninjutsu attack for 9 base damage using normal damage degrees. On a hit, the target tests against Difficulty 16 or falls prone.')
  ]
});
