export function michiruTsuki(systemId) {
 return {
  name:'Michiru Tsuki',type:'personagem',prototypeToken:{name:'Michiru Tsuki',actorLink:false,disposition:0},
  flags:{[systemId]:{bestiaryBoss:'michiru-tsuki'}},
  system:{
   cabecalho:{nome:'Michiru Tsuki',nc:3,patente:'Crown Prince',filiacao:'Land of the Moon'},
   atributos:Object.fromEntries(Object.entries({for:3,des:2,agi:2,per:4,vig:4,int:4,esp:3}).map(([key,valor])=>[key,{valor}])),
   sociais:{carisma:{valor:5},manipulacao:{valor:3}},
   pericias:{cultura:{pontos:4},prontidao:{pontos:2}},
   energias:{vitalidade:{value:37,max:37},chakra:{value:19,max:19}},
   databook:{biografia:'<p>Crown prince of the Land of the Moon and Hikaru’s father. This civilian tabletop profile represents Michiru during the escort mission before his accession.</p>'}
  },
  items:[
   {name:'Royal Travel Outfit',type:'equipamento',img:'icons/svg/item-bag.svg',system:{quantidade:1,descricao:'Michiru’s colorful traveling clothes and jewelry.'}}
  ]
 };
}
