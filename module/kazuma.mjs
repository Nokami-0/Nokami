import {SNS_WEAPONS} from './weapon-catalog.js';

const staff = SNS_WEAPONS.find(weapon => weapon.name === 'Staff (double)');

export const kazuma = {
  name: 'Kazuma (Furiido)',
  type: 'personagem',
  img: 'icons/svg/mystery-man.svg',
  prototypeToken: {name: 'Kazuma (Furiido)', actorLink: false, disposition: -1},
  flags: {'shini-no-sho-altered': {bestiaryBoss: 'kazuma-furiido'}},
  system: {
    cabecalho: {nome: 'Kazuma (Furiido)', nc: 14, patente: 'Former Guardian Shinobi', filiacao: 'Former Twelve Guardian Ninja'},
    atributos: {
      for: {valor: 10}, des: {valor: 8}, agi: {valor: 11}, per: {valor: 9},
      vig: {valor: 9}, int: {valor: 11}, esp: {valor: 14}
    },
    pericias: {
      concentracao: {pontos: 7}, prontidao: {pontos: 7}, atletismo: {pontos: 7},
      ocultismo: {pontos: 7}, furtividade: {pontos: 6}, acrobacia: {pontos: 6},
      procurar: {pontos: 4}, rastrear: {pontos: 4}
    },
    energias: {vitalidade: {value: 107, max: 107}, chakra: {value: 52, max: 52}},
    calculadora: {danoForca: {dda: staff.damage}},
    databook: {
      biografia: '<p><strong>Anime · Twelve Guardian Ninja arc</strong></p><p>Kazuma, also known as Furiido, was one of the Twelve Guardian Ninja and is Sora’s father. Use his sectional monk staff for standard melee attacks. Its equipped item uses the standard double-staff profile.</p><p><strong>Earth Release Resurrection:</strong> Run the revived attackers as a pre-staged encounter objective. Use ordinary henchman profiles for the rank and file. The GM stages any named revived NPCs separately. No automatic summons or unlimited reinforcements.</p><p><strong>Sora’s Seal:</strong> Kazuma’s release of the stored Nine-Tails chakra is a story beat specific to Sora. Resolve it as a separate encounter phase when Sora is present. It does not give Kazuma a transformation or a general-purpose combat ability.</p>'
    }
  },
  items: [{
    name: 'Sectional Monk Staff', type: 'equipamento', img: 'icons/svg/sword.svg',
    system: {
      descricao: 'Uses the standard double-staff profile.',
      equipped: true, attackType: staff.attack, weaponCategory: staff.group.toLowerCase(),
      weaponSize: staff.size, weaponDamage: staff.damage, damageType: staff.dtype,
      criticalRange: staff.crit, quantidade: 1
    }
  }]
};
