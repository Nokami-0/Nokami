const systemId = 'shini-no-sho-altered';
const common = new Set(['Bunshin No Jutsu', 'Henge No Jutsu', 'Kai (Release)', 'Kawarimi No Jutsu']);
const waterVillages = new Set(['Kirigakure', 'Amegakure', 'Takigakure', 'Uzushiogakure']);

export function villageBasicTechniques(row, catalog) {
  if (row.village === 'Land of Iron' || row.clan) return [];
  return catalog.filter(({name}) => common.has(name) || name === 'Kinobori' ||
    (name === 'Tadayou' && waterVillages.has(row.village)));
}

function specialist(village, name, technique, style, cost, description) {
  const id = `village-specialist:${village}`;
  return {
    folderName: village,
    actor: {
      name, type: 'personagem', img: 'icons/svg/mystery-man.svg',
      prototypeToken: {name, actorLink: false, disposition: -1},
      flags: {[systemId]: {bestiaryBoss: id}},
      system: {
        cabecalho: {nome: name, nc: 8, patente: 'Village Specialist', filiacao: village},
        atributos: {for:{valor:4}, des:{valor:5}, agi:{valor:6}, per:{valor:6}, vig:{valor:6}, int:{valor:7}, esp:{valor:8}},
        pericias: {concentracao:{pontos:4}, prontidao:{pontos:4}},
        energias: {vitalidade:{value:58,max:58}, chakra:{value:24,max:24}},
        databook: {biografia:'<p>Village specialist with a Chakra pool. Its signature technique is a tabletop adaptation. Spend Chakra with the item button and resolve the effect manually.</p>'}
      },
      items: [{
        name: technique, type: 'poder', img: 'icons/svg/book.svg',
        system: {tipo:style, nivelUsado:2, custoChakra:cost, custo:`${cost} Chakra`, descricao:description}
      }]
    }
  };
}

export const villageSpecialists = [
  specialist('Kirigakure', 'Kiri Mist Specialist', 'Hidden Mist Technique', 'Suiton', 3,
    'Standard Action. Center a 6 m radius of fog on a point within 12 m. The fog lasts until the end of your next turn. Use the table’s normal rules for obscured vision. It neither deals damage nor grants the caster a way to see through it.'),
  specialist('Iwagakure', 'Iwa Earth Specialist', 'Earth-Style Wall', 'Doton', 3,
    'Standard Action. Raise a 3 m wide, 2 m tall earthen barrier on open ground within 8 m. The wall gives cover while intact and crumbles at the end of the scene. Use the normal object rules, treating it as an earthen barrier.'),
  specialist('Kumogakure', 'Kumo Lightning Specialist', 'Lightning Chakra Blade', 'Raiton', 2,
    'Partial Action. Channel lightning into a held melee weapon. Add +1 base damage to your next hit with that weapon before the end of this turn. This bonus does not stack with itself.'),
  specialist('Hoshigakure', 'Hoshi Star-Trained Specialist', 'Mysterious Peacock Method', 'Star Ninjutsu', 3,
    'Standard Action. Shape the signature chakra feathers to strike one target within 8 m. Make one ranged ninjutsu attack at 4 base damage using the normal damage degree.')
];
