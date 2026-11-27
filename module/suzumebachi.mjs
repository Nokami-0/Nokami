export function suzumebachi(systemId) {
 const technique = (name, level, description) => ({
  name,type:'poder',img:'icons/svg/book.svg',
  system:{tipo:'Kamizuru Hiden',nivelUsado:level,custoChakra:level,custo:`${level} Chakra`,descricao:description}
 });
 return {
  name:'Suzumebachi',type:'personagem',prototypeToken:{name:'Suzumebachi',actorLink:false,disposition:-1},
  flags:{[systemId]:{bestiaryBoss:'suzumebachi',summonContract:'Bees',kuchiyoseLevel:8}},
  system:{
   cabecalho:{nome:'Suzumebachi',nc:10,patente:'Clan Leader',filiacao:'Iwagakure · Kamizuru Clan'},
   atributos:Object.fromEntries(Object.entries({for:5,des:8,agi:7,per:8,vig:7,int:9,esp:10}).map(([key,valor])=>[key,{valor}])),
   pericias:{furtividade:{pontos:5},concentracao:{pontos:5},rastrear:{pontos:5},prontidao:{pontos:4}},
   energias:{vitalidade:{value:81,max:81},chakra:{value:40,max:40}},
   databook:{biografia:'<p>Leader of the Kamizuru Clan from Iwagakure. She uses bees to track, trap and overwhelm opponents. The Bees contract uses the Kuchiyose panel. The separate technique descriptions are resolved manually.</p>'}
  },
  items:[
   {name:'Kunai',type:'equipamento',img:'icons/svg/dagger.svg',system:{quantidade:3,equipped:true,weaponCategory:'simple',weaponDamage:1,attackType:'ranged',weaponSize:'light',damageType:'piercing',weaponRange:15}},
   technique('Bee Bomb Technique',4,'Standard Action. Send explosive bees against one target within 16 m. Make a ranged ninjutsu attack for 7 base damage using ordinary damage degrees.'),
   technique('Bee Honey Technique',3,'Standard Action. Send honey-filled bees against one target within 12 m. Make a ranged ninjutsu attack. On a hit, the honey prevents the target from moving from its space until the end of its next turn. It can attack and defend, or spend a Standard Action to break free with Strength or Escape (Difficulty 16).'),
   technique('Beeswax Clone',3,'Standard Action. Create a beeswax duplicate in an unoccupied space within 6 m. It lasts until the start of your next turn or until hit. It can draw attacks but cannot deal damage.'),
   technique('Hiding with Camouflage Technique',3,'Standard Action. Roll Stealth against appropriate detection checks. Hide visually until the end of your next turn, or until you attack or use another technique. Hearing and other senses can still reveal you.'),
   technique('Rock Hive',4,'Standard Action. Release bees from a rocky surface within 12 m. Make a ranged ninjutsu attack against one adjacent creature for 6 base damage using ordinary damage degrees.'),
   {name:'Thousand Bee Stings Technique',type:'poder',img:'icons/svg/book.svg',system:{tipo:'Kamizuru Hiden',nivelUsado:8,custo:'Swarm NC + 3 Chakra',descricao:'Kamizuru Clan Revised, pp. 3–4. Full Action. Requires a summoned Bee Swarm. Spend Chakra equal to its NC + 3. The initial damage equals swarm NC. Make one additional hit test per four Kuchiyose levels used; add 2 damage per success. See the Bee Swarm compendium entry for its complete rules.'}}
  ]
 };
}
