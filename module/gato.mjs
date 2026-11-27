export function gato(systemId) {
 return {
  name:'Gatō',type:'personagem',prototypeToken:{name:'Gatō',actorLink:false,disposition:-1},
  flags:{[systemId]:{bestiaryBoss:'gato'}},
  system:{
   cabecalho:{nome:'Gatō',nc:3,patente:'Shipping Magnate',filiacao:'Land of Waves'},
   atributos:Object.fromEntries(Object.entries({for:2,des:2,agi:2,per:4,vig:3,int:5,esp:2}).map(([key,valor])=>[key,{valor}])),
   sociais:{carisma:{valor:4},manipulacao:{valor:6}},
   pericias:{cultura:{pontos:3},prontidao:{pontos:2}},
   periciasSociais:{intimidar:{pontos:5}},
   energias:{vitalidade:{value:34,max:34},chakra:{value:16,max:16}},
   databook:{biografia:'<p>A civilian shipping magnate who uses his control of trade and hired muscle to pressure the Land of Waves. His tabletop profile favors social encounters. In combat, use separate escort actors when present.</p>'}
  },
  items:[
   {name:'Shipping Company Ledger',type:'equipamento',img:'icons/svg/book.svg',system:{quantidade:1,descricao:'Records freight contracts, payments and debts. Use it as evidence or leverage in a Land of Waves encounter.'}},
   {name:'Round Sunglasses',type:'equipamento',img:'icons/svg/item-bag.svg',system:{quantidade:1,descricao:'Gatō’s signature eyewear.'}}
  ]
 };
}
