function magnetArt(name, cost, descricao) {
 return {name,type:'poder',img:'icons/svg/book.svg',system:{tipo:'Magnet Ninja Art',nivelUsado:cost,custoChakra:cost,custo:`${cost} Chakra`,descricao}};
}

export function jiga(systemId) {
 return {
  name:'Jiga (Ziga)',type:'personagem',prototypeToken:{name:'Jiga (Ziga)',actorLink:false,disposition:-1},
  flags:{[systemId]:{bestiaryBoss:'jiga'}},
  system:{
   cabecalho:{nome:'Jiga (Ziga)',nc:10,patente:'Janin',filiacao:'Land of Vegetables'},
   atributos:Object.fromEntries(Object.entries({for:8,des:7,agi:6,per:7,vig:8,int:7,esp:10}).map(([key,valor])=>[key,{valor}])),
   pericias:{concentracao:{pontos:5},prontidao:{pontos:4},procurar:{pontos:4},atletismo:{pontos:4}},
   energias:{vitalidade:{value:84,max:84},chakra:{value:40,max:40}},
   databook:{biografia:'<p>Jiga, called Ziga on the card, is one of the three Janin alongside Renga and Ruiga. His Magnet Ninja Art depends on touch or nearby metal. The statistics and encounter effects are tabletop adaptations. Resolve technique effects manually.</p>'}
  },
  items:[
   {name:'Unarmed Strike',type:'equipamento',img:'icons/svg/fist.svg',system:{quantidade:1,equipped:true,weaponCategory:'natural',weaponDamage:0,weaponSize:'light',attackType:'melee',damageType:'bludgeoning'}},
   magnetArt('Magnet Ninja Art',3,'Standard Action. Magnetize one metal object you touch. Through the end of your next turn, move that object up to 4 m along a clear path as a Partial Action, once per turn, while it is within 10 m. An object held by an opponent can only be moved using the normal Disarm rules. This effect does not deal damage.'),
   magnetArt('Electromagnetic Vision',2,'Partial Action. Until the start of your next turn, locate exposed metal within 10 m, including metal concealed by darkness or smoke. Total cover blocks detection. This does not reveal creatures unless they carry detectable metal.'),
   magnetArt('Infinite Meteors',5,'Standard Action, once per scene. Requires loose metal or iron-rich debris within reach. Hurl it toward one target within 12 m. Make a ranged ninjutsu attack for 8 base damage before the usual damage degree.')
  ]
 };
}
