export function kamikiri(systemId) {
 return {
  name:'Kamikiri',type:'personagem',prototypeToken:{name:'Kamikiri',actorLink:false,disposition:-1},
  flags:{[systemId]:{bestiaryBoss:'kamikiri'}},
  system:{
   cabecalho:{nome:'Kamikiri',nc:8,patente:'Hideout Guard',filiacao:'Otogakure · Fūma Clan'},
   atributos:Object.fromEntries(Object.entries({for:10,des:6,agi:7,per:6,vig:8,int:5,esp:5}).map(([key,valor])=>[key,{valor}])),
   pericias:{atletismo:{pontos:5},prontidao:{pontos:4},furtividade:{pontos:4},mecanismo:{pontos:4}},
   energias:{vitalidade:{value:74,max:74},chakra:{value:25,max:25}},
   databook:{biografia:'<p>Fūma Clan shinobi who guards Orochimaru’s hideout alongside Jigumo and Kagerō. His signature weapon is a pair of oversized pincers mounted on his right arm. The combat statistics and maneuver are tabletop adaptations.</p>'}
  },
  items:[
   {name:'Scissor Pincers',type:'equipamento',img:'icons/svg/dagger.svg',system:{quantidade:1,equipped:true,weaponCategory:'martial',weaponDamage:3,attackType:'melee',weaponSize:'heavy',damageType:'slashing',descricao:'Arm-mounted shears. The brace lets Kamikiri wield them one-handed in this profile. Use normal melee reach and damage rules.'}},
   {name:'Rock-Splitting Cut',type:'poder',img:'icons/svg/book.svg',system:{tipo:'Weapon Maneuver',nivelUsado:1,custoChakra:0,custo:'0 Chakra',descricao:'Standard Action. Make one normal Scissor Pincers attack against an unattended stone object in melee reach. Add 2 to base damage for this strike; apply the object’s Hardness normally. Resolve manually.'}}
  ]
 };
}
