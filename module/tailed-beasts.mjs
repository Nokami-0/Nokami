import {sizeById} from './sizes.js';

const book = 'icons/svg/book.svg';
const roster = [
 {
  id:'shukaku', name:'Shukaku', tails:1, nc:17, size:'colossal', ball:7, hardness:4,
  attributes:[11,9,7,12,12,11,17], natural:['Sand Claw','slashing',1], training:'Standing',
  techniques:[
   ['Wind Release: Drilling Air Bullet','Fūton',4,'Standard Action. Make one Ranged Combat attack within 30 m for 12 base wind damage. Use normal damage degrees.'],
   ['Sand Binding','Sand Manipulation',4,'Standard Action. Make one Ranged Combat attack against a target on the ground within 20 m. On a hit, the target is held in place until the end of its next turn. It can still attack and defend, and may spend a Standard Action to escape with Strength or Escape against DC 20. No damage.']
  ]
 },
 {
  id:'matatabi', name:'Matatabi', tails:2, nc:17, size:'colossal', ball:7, hardness:2,
  attributes:[10,12,15,12,9,10,16], natural:['Great Cat Claw','slashing',2], training:'Reflexes',
  techniques:[
   ['Blue Fireball','Katon',4,'Standard Action. Target a point within 30 m with a 6 m diameter burst. Resolve a Ranged Combat attack for 12 base fire damage with normal area defenses and damage degrees. Blue flame uses ordinary fire interactions.']
  ]
 },
 {
  id:'isobu', name:'Isobu', tails:3, nc:17, size:'colossal', ball:7, hardness:5,
  attributes:[11,8,6,11,15,10,16], natural:['Heavy Claw','slashing',1], training:'Standing',
  anatomy:['Aquatic Body','Can breathe and move underwater. Use its normal movement there. Track terrain and current modifiers normally.'],
  techniques:[
   ['Shell Roll','Natural Maneuver',0,'Standard Action. Move up to normal movement in a straight line. Choose one creature along the path and resolve an ordinary Takedown. Stop before a blocker you cannot pass.'],
   ['Coral Growth','Coral',4,'Standard Action. Make a Melee Combat attack in natural reach. On a hit, coral fixes the target in place until the end of its next turn. A Standard Action and Strength or Escape against DC 20 breaks it early. No damage.']
  ]
 },
 {
  id:'son-goku', name:'Son Gokū', tails:4, nc:18, size:'colossal', ball:7, hardness:3,
  attributes:[14,10,10,10,12,10,17], natural:['Gorilla Fist','bludgeoning',1], training:'Fighter',
  techniques:[
   ['Lava Release: Scorching Stream','Yōton',5,'Standard Action. Project a 15 m × 3 m line of lava. Resolve a Ranged Combat attack for 14 base lava damage with normal area defenses and damage degrees. Lava disperses after the attack.']
  ]
 },
 {
  id:'kokuo', name:'Kokuō', tails:5, nc:18, size:'colossal', ball:8, hardness:3,
  attributes:[13,9,13,11,12,10,17], natural:['Horn Ram','piercing',2], training:'Fighter',
  techniques:[
   ['Boil Release: Unrivalled Strength','Futton',4,'Partial Action, once per round. Steam pressure adds +3 base damage to Kokuō’s next successful natural melee hit before this turn ends. Apply before damage degree. The bonus does not stack.']
  ]
 },
 {
  id:'saiken', name:'Saiken', tails:6, nc:18, size:'colossal', ball:8, hardness:3,
  attributes:[10,8,7,11,14,10,18], natural:['Tail Slam','bludgeoning',1], training:'Standing',
  techniques:[
   ['Corrosive Gas','Corrosive Secretion',5,'Standard Action. Create a 10 m cone. Resolve a Ranged Combat attack for 13 base corrosive damage with normal area defenses and damage degrees. The cloud disperses after the attack.']
  ]
 },
 {
  id:'chomei', name:'Chōmei', tails:7, nc:18, size:'colossal', ball:8, hardness:3,
  attributes:[10,11,15,13,10,10,18], natural:['Horn Strike','piercing',2], training:'Reflexes',
  anatomy:['Winged Flight','Chōmei can fly using its six wing-like tails. Use normal Flight and movement rules. Unable to fly while its wings are restrained.'],
  techniques:[
   ['Scale Powder','Scale Powder',4,'Standard Action. Scatter scales in a 10 m cone. Creatures that fail their area defense are blinded until the end of their next turn. No damage.']
  ]
 },
 {
  id:'gyuki', name:'Gyūki', tails:8, nc:19, size:'incredible', ball:8, hardness:4,
  attributes:[14,11,10,12,14,12,19], natural:['Tentacle Slam','bludgeoning',1], training:'Fighter',
  techniques:[
   ['Ink Spray','Ink',4,'Standard Action. Cover a 10 m cone in ink. On a failed area defense, the target suffers partial concealment on attacks requiring sight until the end of its next turn. No damage.'],
   ['Tailed Beast Eight Twists','Natural Maneuver',0,'Standard Action, once per scene. Sweep a 12 m radius around Gyūki with its tails. Each creature in the area defends separately. On a failed defense, knock the creature prone and move it 3 m outward where space permits. No damage.']
  ]
 },
 {
  id:'kurama', name:'Kurama', tails:9, nc:20, size:'incredible', ball:9, hardness:4,
  attributes:[15,12,14,14,14,13,20], natural:['Fox Claw','slashing',2], training:'Intuition',
  anatomy:['Negative Emotion Sensing','Kurama can try to detect active hostile intent with a Read Motion check at the GM’s discretion. This sense reveals neither thoughts nor ordinary hidden objects.'],
  techniques:[
   ['Chakra Transfer','Bijū Chakra',6,'Standard Action. Spend 6 Chakra and restore up to 6 Chakra to one willing creature in natural reach, up to its normal maximum. This transfer cannot target Kurama. Resolve manually.']
  ]
 }
];

const trainingRules = {
 Fighter:'Ignore the usual −2 Accuracy penalty on special maneuvers made unarmed or with natural weapons.',
 Intuition:'+1 Accuracy on Read Motion.',
 Reflexes:'+1 Accuracy on Dodge.',
 Standing:'Stand as a Free Action. Once per scene you can also stand as a reaction immediately after being knocked down.'
};

function aptitude(name, descricao) {
 return {name,type:'aptidao',img:book,system:{descricao}};
}

function technique(name, tipo, custoChakra, descricao, nivelUsado = 1) {
 return {name,type:'poder',img:book,system:{tipo,nivelUsado,custoChakra,custo:`${custoChakra} Chakra`,descricao}};
}

function tailedBeastBall(level) {
 const damage = level * 3;
 const cost = Math.ceil(damage / 2);
 return technique('Tailed Beast Ball (Bijūdama)','Bijū Chakra',cost,
  `Complete Action. Stand at least 5 m from every enemy. Range ${15 + 6 * level} m. Choose a sphere that bursts on impact (${6 * level} m diameter) or a 5 m-wide cylinder. Deal ${damage} base damage using the normal damage degree and area defenses. Hard obstacles can detonate the sphere early. The cylinder continues through obstacles only if the blast overcomes their Hardness. The beast uses this directly in its natural body. Standalone boss adaptation of Hijutsus Vol. 1, PDF p. 29. Resolve aiming, cover and damage manually.`,level);
}

export function tailedBeasts(systemId) {
 return roster.map(row => {
  const id = `bijuu-${row.id}`;
  const size = sizeById(row.size);
  const [strength,dexterity,agility,perception,vigor,intelligence,spirit] = row.attributes;
  const attributes = {for:strength + size.str,des:dexterity,agi:agility,per:perception,vig:vigor + size.vig,int:intelligence,esp:spirit};
  const vitality = 10 + 3 * attributes.vig + 5 * row.nc;
  const chakra = Math.floor((10 + 3 * spirit) * 1.5);
  const [attackName,damageType,weaponDamage] = row.natural;
  const designation = ['One','Two','Three','Four','Five','Six','Seven','Eight','Nine'][row.tails - 1];
  const items = [
   {name:attackName,type:'equipamento',img:'icons/svg/fist.svg',system:{
    quantidade:1,equipped:true,weaponCategory:'natural',weaponSize:'medium',attackType:'melee',damageType,weaponDamage,
    descricao:`Innate attack. Natural reach ${size.reach} m. No equipment or hands required.`
   }},
   aptitude('Expanded Chakra','Increase maximum Chakra by 50%, using the system’s existing Expanded Chakra rule.'),
   aptitude(row.training,trainingRules[row.training]),
   tailedBeastBall(row.ball),
   ...row.techniques.map(args => technique(...args)),
   ...(row.anatomy ? [aptitude(...row.anatomy)] : [])
  ];
  return {folderName:'Tailed Beasts',actor:{
   name:row.name,type:'personagem',
   prototypeToken:{name:row.name,actorLink:false,disposition:0,width:size.grid,height:size.grid},
   flags:{[systemId]:{bestiaryBoss:id}},
   system:{
    cabecalho:{nome:row.name,nc:row.nc,patente:`${designation}-Tails`,filiacao:'Tailed Beasts'},
    atributos:Object.fromEntries(Object.entries(attributes).map(([key,valor])=>[key,{valor}])),
    pericias:{atletismo:{pontos:5},prontidao:{pontos:5},concentracao:{pontos:5},...(row.id==='chomei' ? {voo:{pontos:6}} : {})},
    defesas:{dureza:row.hardness},
    energias:{tamanho:size.label,alcance:`${size.reach} m`,deslocamento:{bonus:size.move},vitalidade:{value:vitality,max:vitality},chakra:{value:chakra,max:chakra}},
    databook:{biografia:`<p>${row.name}, the ${designation}-Tails, in its natural body. Size bonuses are included in Strength and Vigor. These are standalone encounter statistics. Vitality and Chakra are unlimited. Resolve defeat through encounter objectives such as sealing or retreat.</p><p>Token uses the supplied illustration. Art credit: ${row.id==='saiken' ? 'IGNAT474 (signature on supplied image)' : row.id==='gyuki' ? 'supplied illustration' : 'alxnarutoall (signature on supplied image)'}.</p>`}
   },
   items
  }};
 });
}
