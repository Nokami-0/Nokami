export function directorMakino(systemId) {
 return {
  name:'Director Makino',type:'personagem',prototypeToken:{name:'Director Makino',actorLink:false,disposition:0},
  flags:{[systemId]:{bestiaryBoss:'director-makino'}},
  system:{
   cabecalho:{nome:'Director Makino',nc:3,patente:'Film Director',filiacao:'Land of Fire'},
   atributos:Object.fromEntries(Object.entries({for:2,des:3,agi:2,per:5,vig:3,int:6,esp:3}).map(([key,valor])=>[key,{valor}])),
   sociais:{carisma:{valor:5},manipulacao:{valor:3}},
   pericias:{arte:{pontos:5},cultura:{pontos:3},prontidao:{pontos:2}},
   energias:{vitalidade:{value:34,max:34},chakra:{value:19,max:19}},
   databook:{biografia:'<p>The film director who works with Yukie Fujikaze in Ninja Clash in the Land of Snow. This civilian tabletop profile emphasizes filmmaking and directing a crew.</p>'}
  },
  items:[
   {name:'Expert (Art)',type:'aptidao',img:'icons/svg/book.svg',system:{aptitudeChoice:'Art',descricao:'Gain +2 Accuracy on Art tests.'}},
   {name:'Script and Shot List',type:'equipamento',img:'icons/svg/book.svg',system:{quantidade:1,descricao:'Production notes, scene order, and filming locations.'}}
  ]
 };
}
