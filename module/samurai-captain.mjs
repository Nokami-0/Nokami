import {ghostSamurai} from './ghost-samurai.mjs';
import {SNS_WEAPONS} from './weapon-catalog.js';

const name = 'Land of Iron Samurai Captain';
const [katana, armor] = ghostSamurai.items;
const wakizashi = SNS_WEAPONS.find(weapon => weapon.name === 'Wakizashi');

export const samuraiCaptain = {
  name,
  type: 'personagem',
  prototypeToken: {name, actorLink: false, disposition: -1},
  flags: {'shini-no-sho-altered': {bestiaryBoss: 'land-of-iron-samurai-captain'}},
  system: {
    cabecalho: {nome: name, nc: 10, patente: 'Samurai Captain', filiacao: 'Land of Iron'},
    atributos: {
      for: {valor: 10}, des: {valor: 8}, agi: {valor: 7}, per: {valor: 7},
      vig: {valor: 8}, int: {valor: 6}, esp: {valor: 5}
    },
    pericias: {
      prontidao: {pontos: 5}, atletismo: {pontos: 5}, concentracao: {pontos: 4},
      procurar: {pontos: 4}, acrobacia: {pontos: 4}
    },
    energias: {vitalidade: {value: 84, max: 84}, chakra: {value: 25, max: 25}},
    calculadora: {danoForca: {dda: katana.system.weaponDamage}},
    databook: {
      biografia: '<p>A Land of Iron officer who leads armored patrols and summit security details. Holds choke points with disciplined swordsmanship and keeps a shorter blade for close quarters.</p>'
    }
  },
  items: [
    katana,
    {...katana, name: wakizashi.name, system: {
      ...katana.system, equipped: false, attackType: wakizashi.attack,
      weaponCategory: wakizashi.group.toLowerCase(), weaponSize: wakizashi.size,
      weaponDamage: wakizashi.damage, damageType: wakizashi.dtype, criticalRange: wakizashi.crit
    }},
    {...armor, name: 'Land of Iron Battle Armor', system: {
      ...armor.system, absorption: 20, absorptionRemaining: 20, bodyHardnessBonus: 2,
      valorRyo: 600, peso: 3,
      descricao: 'Segmented heavy armor with sword mounts and a horned helmet. The radio and respirator are built into the mask. Apply +3 accuracy to relevant poison saves manually. At zero Absorption, the remaining armor Hardness applies only to armed and unarmed attacks, including Energize attacks.'
    }},
    {
      name: 'Samurai Saber', type: 'aptidao', img: 'icons/svg/sword.svg',
      system: {
        preRequisito: 'Hand-to-Hand Combat 12',
        descricao: 'Gain proficiency with non-heavy martial swords and Expert on their CC checks. Chakra Blade (Energize): partial action, sustained, 3 Chakra. Chakra Cut: while Chakra Blade is active, make a standard-action CC attack at 5 m + Spirit (10 m for this captain), dealing the normal Chakra Blade attack damage. Costs half Spirit in Chakra. Maneuvering aptitudes cannot be combined with Chakra Cut.'
      }
    },
    {
      name: 'Samurai Armor', type: 'aptidao', img: 'icons/svg/shield.svg',
      system: {
        preRequisito: 'Strength 10 or Vigor 12',
        descricao: 'Grants Heavy Armor Proficiency and training in Samurai Battle Armor, removing its armor penalty.'
      }
    },
    {
      name: 'Swordsman', type: 'aptidao', img: 'icons/svg/sword.svg',
      system: {descricao: 'When wielding a light or medium sword, use its precision for eligible special combat maneuvers without the usual −2 penalty. Grappling requires free hands.'}
    }
  ]
};
