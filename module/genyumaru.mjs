export function genyumaru(systemId) {
 return {
  name:'Gen’yūmaru',type:'personagem',prototypeToken:{name:'Gen’yūmaru',actorLink:false,disposition:0},
  flags:{[systemId]:{bestiaryBoss:'genyumaru'}},
  system:{
   cabecalho:{nome:'Gen’yūmaru',nc:6,patente:'Prisoner',filiacao:'Orochimaru’s Hideout'},
   atributos:Object.fromEntries(Object.entries({for:8,des:5,agi:6,per:5,vig:8,int:4,esp:5}).map(([key,valor])=>[key,{valor}])),
   pericias:{atletismo:{pontos:5},escapar:{pontos:4},prontidao:{pontos:4}},
   energias:{vitalidade:{value:64,max:64},chakra:{value:25,max:25}},
   databook:{biografia:'<p>A prisoner who survives Orochimaru’s contest and becomes his temporary vessel. This tabletop profile represents Gen’yūmaru before the transfer.</p>'}
  },
  items:[
   {name:'Unarmed Strike',type:'equipamento',img:'icons/svg/fist.svg',system:{quantidade:1,equipped:true,weaponCategory:'natural',weaponDamage:0,weaponSize:'light',attackType:'melee',damageType:'bludgeoning'}},
   {name:'Iron Fist',type:'aptidao',img:'icons/svg/book.svg',system:{descricao:'At Strength 8, gain +2 base damage on ordinary unarmed attacks that have no weapon damage. This aptitude is a tabletop choice for the prisoner encounter.'}}
  ]
 };
}
