import {SNS_WEAPONS} from './weapon-catalog.js';

const mace = SNS_WEAPONS.find(weapon => weapon.name === 'Mace');

export const banditLeader = {
  name: 'Bandit Leader',
  type: 'personagem',
  img: 'icons/svg/mystery-man.svg',
  prototypeToken: {name: 'Bandit Leader', actorLink: false, disposition: -1},
  flags: {'shini-no-sho-altered': {bestiaryBoss: 'bandit-leader'}},
  system: {
    cabecalho: {nome: 'Bandit Leader', nc: 8, patente: 'Gang Leader', filiacao: 'Bandits'},
    atributos: {
      for: {valor: 8}, des: {valor: 4}, agi: {valor: 5}, per: {valor: 5},
      vig: {valor: 7}, int: {valor: 4}, esp: {valor: 3}
    },
    pericias: {
      atletismo: {pontos: 4}, prontidao: {pontos: 4}, furtividade: {pontos: 4},
      rastrear: {pontos: 4}, procurar: {pontos: 4}, escapar: {pontos: 4}
    },
    sociais: {carisma: {valor: 4}, manipulacao: {valor: 2}},
    periciasSociais: {intimidar: {pontos: 4}},
    energias: {vitalidade: {value: 71, max: 71}, chakra: {value: 19, max: 19}},
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
