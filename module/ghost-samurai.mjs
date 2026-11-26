import {SNS_WEAPONS} from './weapon-catalog.js';

const katana = SNS_WEAPONS.find(weapon => weapon.name === 'Katana');
const portrait = 'icons/svg/mystery-man.svg';

export const ghostSamurai = {
  name: 'Ghost Samurai',
  type: 'personagem',
  img: portrait,
  prototypeToken: {name: 'Ghost Samurai', actorLink: false, disposition: -1, texture: {src: portrait}},
  flags: {'shinobi-no-sho-revamp': {bestiaryBoss: 'land-of-birds-ghost-samurai'}},
  system: {
    cabecalho: {nome: 'Ghost Samurai', nc: 10, patente: 'Boss NPC', filiacao: 'Land of Birds'},
    atributos: {
      for: {valor: 10}, des: {valor: 5}, agi: {valor: 7}, per: {valor: 7},
      vig: {valor: 8}, int: {valor: 6}, esp: {valor: 5}
    },
    pericias: {
      atletismo: {pontos: 5}, furtividade: {pontos: 5}, prontidao: {pontos: 5},
      disfarce: {pontos: 5}, procurar: {pontos: 4}, acrobacia: {pontos: 4},
      rastrear: {pontos: 4}
    },
    sociais: {carisma: {valor: 3}, manipulacao: {valor: 2}},
    periciasSociais: {intimidar: {pontos: 5}},
    energias: {vitalidade: {value: 84, max: 84}, chakra: {value: 25, max: 25}},
    calculadora: {danoForca: {dda: katana.damage}},
    databook: {
      biografia: `<p><strong>Land of Birds · Anime-inspired boss adaptation</strong></p>
       <p>A masked swordsman whose apparent haunting is supported by disguise and prepared escape routes. Use the horned armor and tattered cloak as the figure witnesses describe. The armor protects a living wearer who can be tracked, restrained, or unmasked normally.</p>
       <p><strong>Run the encounter:</strong> Start with Stealth to approach or Disguise to sell the false identity. Use standard katana attacks once exposed. If pressed, fall back through a prepared exit using ordinary movement. Muddy footprints or fresh scratches on a hidden door can give the party a lead.</p>
       <p>NC 10 martial NPC. No supernatural immunities or chakra techniques are assumed. Use the normal combat and armor rules.</p>`
    }
  },
  items: [
    {
      name: katana.name, type: 'equipamento', img: 'icons/svg/sword.svg',
      system: {
        equipped: true, attackType: katana.attack, weaponCategory: katana.group.toLowerCase(),
        weaponSize: katana.size, weaponDamage: katana.damage, damageType: katana.dtype,
        criticalRange: katana.crit, quantidade: 1
      }
    },
    {
      name: 'Battle Armor (Ghost Samurai)', type: 'equipamento', img: 'icons/svg/shield.svg',
      system: {
        equipped: true, isArmor: true, absorption: 15, absorptionRemaining: 15,
        modificadorCompartimento: -1, quantidade: 1,
        descricao: 'Heavy battle armor with a horned mask and tattered mantle. Strength 10 qualifies. Armor penalty is 0 with Wear Heavy Armor.'
      }
    },
    {
      name: 'Weapon Proficiency (Katana)', type: 'aptidao', img: 'icons/svg/sword.svg',
      system: {descricao: 'Wield the katana without the martial weapon nonproficiency penalty.'}
    },
    {
      name: 'Wear Heavy Armor', type: 'aptidao', img: 'icons/svg/shield.svg',
      system: {preRequisito: 'Strength 10 or Vigor 15', descricao: 'Use the trained armor penalty for heavy armor. Battle Armor applies a penalty of 0.'}
    }
  ]
};
