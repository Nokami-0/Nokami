export function waraji(systemId) {
 return {
  name:'Waraji',type:'personagem',prototypeToken:{name:'Waraji',actorLink:false,disposition:-1},
  flags:{[systemId]:{bestiaryBoss:'waraji'}},
  system:{
   cabecalho:{nome:'Waraji',nc:6,patente:'Samurai Bodyguard',filiacao:'Gatō Company · Land of Waves'},
   atributos:Object.fromEntries(Object.entries({for:8,des:5,agi:6,per:5,vig:7,int:4,esp:4}).map(([key,valor])=>[key,{valor}])),
   pericias:{atletismo:{pontos:4},prontidao:{pontos:4}},
   periciasSociais:{intimidar:{pontos:4}},
   energias:{vitalidade:{value:61,max:61},chakra:{value:22,max:22}},
   databook:{biografia:'<p>Waraji and Zōri are samurai mercenaries hired as Gatō’s bodyguards. The statistics and sword maneuver rules are tabletop adaptations.</p>'}
  },
  items:[
   {name:'Katana',type:'equipamento',img:'icons/svg/sword.svg',system:{quantidade:1,equipped:true,weaponCategory:'martial',weaponDamage:3,weaponSize:'medium',attackType:'melee',damageType:'slashing'}},
   {name:'Powerful Attack',type:'aptidao',img:'icons/svg/book.svg',system:{preRequisito:'Melee Combat 7',descricao:'Declare before a melee attack. Apply −1 Accuracy and +1 base damage to that attack. Resolve manually.'}},
   {name:'Iaidō (Blade Slash)',type:'poder',img:'icons/svg/book.svg',system:{tipo:'Sword Maneuver',nivelUsado:1,custoChakra:0,custo:'0 Chakra',descricao:'Standard Action. Begin with the katana sheathed and a free hand. Draw it and make one normal melee attack at standard reach as part of the same action. Resolve manually.'}}
  ]
 };
}
