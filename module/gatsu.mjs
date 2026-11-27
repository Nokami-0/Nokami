export function gatsu(systemId) {
 return {
  name:'Gatsu',type:'personagem',prototypeToken:{name:'Gatsu',actorLink:false,disposition:0},
  flags:{[systemId]:{bestiaryBoss:'gatsu'}},
  system:{
   cabecalho:{nome:'Gatsu',nc:6,patente:'Bounty Hunter',filiacao:'Land of Stone'},
   atributos:Object.fromEntries(Object.entries({for:8,des:4,agi:5,per:7,vig:7,int:5,esp:4}).map(([key,valor])=>[key,{valor}])),
   pericias:{rastrear:{pontos:5},procurar:{pontos:4},atletismo:{pontos:4},prontidao:{pontos:4}},
   energias:{vitalidade:{value:61,max:61},chakra:{value:22,max:22}},
   databook:{biografia:'<p>A bounty hunter from the Land of Stone who fights with a club. His tabletop profile emphasizes tracking fugitives and taking them into custody.</p>'}
  },
  items:[
   {name:'Club',type:'equipamento',img:'icons/svg/sword.svg',system:{quantidade:1,equipped:true,weaponCategory:'simple',weaponDamage:2,weaponSize:'heavy',attackType:'melee',damageType:'bludgeoning'}},
   {name:'Bounty Notices',type:'equipamento',img:'icons/svg/book.svg',system:{quantidade:1,descricao:'A collection of current bounty notices and notes on fugitives.'}}
  ]
 };
}
