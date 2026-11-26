import {ghostSamurai} from './ghost-samurai.mjs';
import {SNS_WEAPONS} from './weapon-catalog.js';

const name = 'Land of Iron Samurai Captain';
const [katana, armor, proficiency, armorTraining] = ghostSamurai.items;
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
      ...armor.system, descricao: 'Heavy segmented armor with a horned helmet and face guard.'
    }},
    proficiency,
    armorTraining,
    {
      name: 'Swordsman', type: 'aptidao', img: 'icons/svg/sword.svg',
      system: {descricao: 'When wielding a light or medium sword, use its precision for eligible special combat maneuvers without the usual −2 penalty. Grappling requires free hands.'}
    }
  ]
};
