function iceDisk(name, level, descricao) {
 return {name,type:'poder',img:'icons/svg/book.svg',system:{tipo:'Ice Release',nivelUsado:level,custoChakra:level,custo:`${level} Chakra`,descricao}};
}

export function renga(systemId) {
 return {
  name:'Renga',type:'personagem',prototypeToken:{name:'Renga',actorLink:false,disposition:-1},
  flags:{[systemId]:{bestiaryBoss:'renga'}},
  system:{
   cabecalho:{nome:'Renga',nc:11,patente:'Janin Leader',filiacao:'Land of Vegetables'},
   atributos:Object.fromEntries(Object.entries({for:6,des:8,agi:7,per:8,vig:8,int:8,esp:11}).map(([key,valor])=>[key,{valor}])),
   pericias:{concentracao:{pontos:5},prontidao:{pontos:4},procurar:{pontos:4},acrobacia:{pontos:4}},
   energias:{vitalidade:{value:89,max:89},chakra:{value:43,max:43}},
   databook:{biografia:'<p>The eldest of the three Janin brothers, Renga shapes moisture into ice disks for defense and concentrates sunlight with an ice lens. These statistics and encounter effects are tabletop adaptations. Resolve the techniques manually.</p>'}
  },
  items:[
   {name:'Expert (Concentration)',type:'aptidao',img:'icons/svg/book.svg',system:{aptitudeChoice:'Concentration',descricao:'Gain +2 Accuracy on Concentration tests.'}},
   iceDisk('Ice Disk Technique — Disk Guard',4,'Reaction against an attack. Create an ice disk to intercept it. Make a normal Block test. On success, use 8 Hardness for this defense. The disk breaks after the defense.'),
   iceDisk('Ice Disk Technique — Solar Lens',5,'Full Action, once per scene. Requires direct sunlight. Focus sunlight on one target within 20 m. Make a ranged ninjutsu attack for 9 base fire damage using normal damage degrees. Resolve a reflective surface deliberately positioned to intercept the beam before applying damage; on interception the original target takes no damage.')
  ]
 };
}
