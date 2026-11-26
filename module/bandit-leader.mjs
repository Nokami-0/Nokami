import {SNS_WEAPONS} from './weapon-catalog.js';

const mace = SNS_WEAPONS.find(weapon => weapon.name === 'Mace');

export const banditLeader = {
  name: 'Bandit Leader',
  type: 'personagem',
  img: 'icons/svg/mystery-man.svg',
  prototypeToken: {name: 'Bandit Leader', actorLink: false, disposition: -1},
  flags: {'shinobi-no-sho-revamp': {bestiaryBoss: 'bandit-leader'}},
  system: {
    cabecalho: {nome: 'Bandit Leader', nc: 6, patente: 'Gang Leader', filiacao: 'Bandits'},
    atributos: {
      for: {valor: 6}, des: {valor: 3}, agi: {valor: 3}, per: {valor: 3},
      vig: {valor: 5}, int: {valor: 2}, esp: {valor: 2}
    },
    pericias: {
      atletismo: {pontos: 3}, prontidao: {pontos: 3}, furtividade: {pontos: 3},
      rastrear: {pontos: 3}, procurar: {pontos: 2}, escapar: {pontos: 2}
    },
    sociais: {carisma: {valor: 3}, manipulacao: {valor: 2}},
    periciasSociais: {intimidar: {pontos: 3}},
    energias: {vitalidade: {value: 55, max: 55}, chakra: {value: 16, max: 16}},
    calculadora: {danoForca: {dda: mace.damage}},
    databook: {
      biografia: '<p><strong>Original roadside boss</strong></p><p>A gang leader in a yellow coat who demands a toll from travelers. Use Intimidate when he demands payment or tries to make a prisoner talk. If a fight breaks out, he uses standard melee attacks with his studded club. He may bargain for a way out if his gang scatters.</p><p>The studded club uses the standard Mace profile. This build has no special jutsu.</p>'
    }
  },
  items: [{
    name: 'Studded Club', type: 'equipamento', img: 'icons/svg/sword.svg',
    system: {
      descricao: 'Uses the standard Mace weapon profile.',
      equipped: true, attackType: mace.attack, weaponCategory: mace.group.toLowerCase(),
      weaponSize: mace.size, weaponDamage: mace.damage, damageType: mace.dtype,
      criticalRange: mace.crit, quantidade: 1
    }
  }]
};
