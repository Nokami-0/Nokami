const systemId = 'shini-no-sho-altered';
const common = new Set(['Bunshin No Jutsu', 'Henge No Jutsu', 'Kai (Release)', 'Kawarimi No Jutsu']);
const waterVillages = new Set(['Kirigakure', 'Amegakure', 'Takigakure', 'Uzushiogakure']);

export function villageBasicTechniques(row, catalog) {
  if (row.village === 'Land of Iron' || row.village === 'Bandits' || row.village === 'Cult and Undead' || row.clan) return [];
  return catalog.filter(({name}) => common.has(name) || name === 'Kinobori' ||
    (name === 'Tadayou' && waterVillages.has(row.village)));
}

function specialist(village, name, technique, style, cost, description) {
  const id = `village-specialist:${village}`;
  const kunai = {
    name:'Kunai', type:'equipamento', img:'icons/svg/dagger.svg',
    system:{equipped:true, weaponCategory:'simple', attackType:'melee', weaponSize:'light',
      weaponDamage:1, weaponRange:15, damageType:'piercing', quantidade:1}
  };
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
        energias: {vitalidade:{value:68,max:68}, chakra:{value:34,max:34}},
        databook: {biografia:'<p>Village specialist with a Chakra pool. Use the rules on each item, spend Chakra with the sheet button, and resolve the effect manually. Named signature techniques marked in this roster are tabletop adaptations.</p>'}
      },
      items: [kunai, ...(technique ? [{
        name: technique, type: 'poder', img: 'icons/svg/book.svg',
        system: {tipo:style, nivelUsado:2, custoChakra:cost, custo:`${cost} Chakra`, descricao:description}
      }] : [])]
    }
  };
}

export const villageSpecialists = [
  specialist('Konohagakure', 'Konoha Fire Specialist'),
  specialist('Sunagakure', 'Suna Wind Specialist'),
  specialist('Amegakure', 'Ame Water Specialist'),
  specialist('Takigakure', 'Taki Water Specialist'),
  specialist('Kirigakure', 'Kiri Mist Specialist', 'Hidden Mist Technique', 'Suiton', 3,
    'Standard Action. Center a 6 m radius of fog on a point within 12 m. The fog lasts until the end of your next turn. Use the table’s normal rules for obscured vision. It neither deals damage nor grants the caster a way to see through it.'),
  specialist('Iwagakure', 'Iwa Earth Specialist', 'Earth-Style Wall', 'Doton', 3,
    'Standard Action. Raise a 3 m wide, 2 m tall earthen barrier on open ground within 8 m. The wall gives cover while intact and crumbles at the end of the scene. Use the normal object rules, treating it as an earthen barrier.'),
  specialist('Kumogakure', 'Kumo Lightning Specialist', 'Lightning Chakra Blade', 'Raiton', 2,
    'Partial Action. Channel lightning into a held melee weapon. Add +1 base damage to your next hit with that weapon before the end of this turn. This bonus does not stack with itself.'),
  specialist('Hoshigakure', 'Hoshi Star-Trained Specialist', 'Mysterious Peacock Method', 'Star Ninjutsu', 3,
    'Standard Action. Shape the signature chakra feathers to strike one target within 8 m. Make one ranged ninjutsu attack at 4 base damage using the normal damage degree.')
];

const elementalTraining = {
  'village-specialist:Konohagakure': ['katon', 'Fire', 'cannon'],
  'village-specialist:Sunagakure': ['fuuton', 'Wind', 'project'],
  'village-specialist:Kirigakure': ['suiton', 'Water', 'restraint'],
  'village-specialist:Kumogakure': ['raiton', 'Lightning', 'ray'],
  'village-specialist:Iwagakure': ['doton', 'Earth', 'tremor'],
  'village-specialist:Amegakure': ['suiton', 'Water', 'cannon'],
  'village-specialist:Takigakure': ['suiton', 'Water', 'purify'],
  'kiri-hunter-nin': ['suiton', 'Water', 'repel']
};

const basicTraining = {
  'doto-kazahana': ['Kai (Release)', 'Kawarimi No Jutsu'],
  'fubuki-kakuyoku': ['Kai (Release)', 'Kawarimi No Jutsu'],
  'mizore-fuyukuma': ['Kai (Release)', 'Kawarimi No Jutsu'],
  'nadare-roga': ['Kai (Release)', 'Kawarimi No Jutsu', 'Tadayou'],
  'ishidate': ['Kai (Release)', 'Kawarimi No Jutsu', 'Shunshin No Jutsu'],
  'karenbana': ['Kai (Release)', 'Henge No Jutsu', 'Bunshin No Jutsu'],
  'shinno-base': ['Kai (Release)', 'Henge No Jutsu', 'Kawarimi No Jutsu'],
  'shinno-body-revival': ['Kai (Release)', 'Shunshin No Jutsu'],
  'kazuma-furiido': ['Kai (Release)', 'Kawarimi No Jutsu'],
  'sora': ['Kawarimi No Jutsu', 'Kinobori']
};

export function villageLoadoutItems(id, village, basicJutsu, ninpou) {
  const isSpecialist = id.startsWith('village-specialist:');
  const basics = isSpecialist
    ? villageBasicTechniques({village}, basicJutsu)
    : basicJutsu.filter(item => basicTraining[id]?.includes(item.name));
  const training = elementalTraining[id];
  if (!training) return basics;
  const [element, label, effect] = training;
  const rule = ninpou.find(item => item.id === `effect:${element}:${effect}`);
  if (!rule) throw Error(`Missing ${label} Ninpou effect: ${effect}`);
  const level = rule.level;
  return [...basics, {
    name:`${label} Ninpou — ${rule.name.split(' — ').at(-1)}`, type:'poder', img:'icons/svg/book.svg',
    system:{
      tipo:'Ninpou', elemento:element, nivelUsado:level, custoChakra:level, custo:`${level} Chakra`,
      descricao:`${rule.description}\n\nBasic Book 4.1b, pp. ${rule.sourcePages}. Spend the listed Chakra using the sheet, then resolve the effect using the normal Ninpou rules.`
    }
  }];
}
