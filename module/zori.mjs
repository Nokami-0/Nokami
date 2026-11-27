export function zori(systemId) {
 return {
  name:'Zōri',type:'personagem',prototypeToken:{name:'Zōri',actorLink:false,disposition:-1},
  flags:{[systemId]:{bestiaryBoss:'zori'}},
  system:{
   cabecalho:{nome:'Zōri',nc:6,patente:'Samurai Bodyguard',filiacao:'Gatō Company · Land of Waves'},
   atributos:Object.fromEntries(Object.entries({for:7,des:7,agi:7,per:6,vig:6,int:4,esp:4}).map(([key,valor])=>[key,{valor}])),
   pericias:{atletismo:{pontos:4},prontidao:{pontos:4}},
   periciasSociais:{intimidar:{pontos:4}},
   energias:{vitalidade:{value:58,max:58},chakra:{value:22,max:22}},
   databook:{biografia:'<p>Zōri and Waraji are samurai mercenaries hired as Gatō’s bodyguards. The statistics and sword maneuver rules are tabletop adaptations.</p>'}
  },
  items:[
   {name:'Katana',type:'equipamento',img:'icons/svg/sword.svg',system:{quantidade:1,equipped:true,weaponCategory:'martial',weaponDamage:3,weaponSize:'medium',attackType:'melee',damageType:'slashing'}},
   {name:'Reflexes',type:'aptidao',img:'icons/svg/book.svg',system:{descricao:'Gain +1 Accuracy on Dodge tests.'}},
   {name:'Iaidō (Blade Slash)',type:'poder',img:'icons/svg/book.svg',system:{tipo:'Sword Maneuver',nivelUsado:1,custoChakra:0,custo:'0 Chakra',descricao:'Standard Action. Begin with the katana sheathed and a free hand. Draw it and make one normal melee attack at standard reach as part of the same action. Resolve manually.'}}
  ]
 };
}
