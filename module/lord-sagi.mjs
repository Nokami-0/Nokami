export function lordSagi(systemId) {
 return {
  name:'Lord Sagi',type:'personagem',prototypeToken:{name:'Lord Sagi',actorLink:false,disposition:0},
  flags:{[systemId]:{bestiaryBoss:'lord-sagi'}},
  system:{
   cabecalho:{nome:'Lord Sagi',nc:3,patente:'Heir',filiacao:'Land of Birds'},
   atributos:Object.fromEntries(Object.entries({for:3,des:3,agi:3,per:4,vig:3,int:5,esp:4}).map(([key,valor])=>[key,{valor}])),
   sociais:{carisma:{valor:5},manipulacao:{valor:3}},
   pericias:{cultura:{pontos:4},prontidao:{pontos:2}},
   energias:{vitalidade:{value:34,max:34},chakra:{value:22,max:22}},
   databook:{biografia:'<p>Sagi, son of Ōwashi and older twin brother of Toki, was the rightful heir of the Land of Birds. This civilian tabletop profile represents Sagi himself. The Ghost Samurai encounter has its own Bestiary entry.</p>'}
  },
  items:[
   {name:'Court Robes',type:'equipamento',img:'icons/svg/item-bag.svg',system:{quantidade:1,descricao:'Formal robes and headwear of the Land of Birds court.'}}
  ]
 };
}
