export function tonbei(systemId) {
 return {
  name:'Tonbei',type:'personagem',prototypeToken:{name:'Tonbei',actorLink:false,disposition:0},
  flags:{[systemId]:{bestiaryBoss:'tonbei'}},
  system:{
   cabecalho:{nome:'Tonbei',nc:7,patente:'Fortress Guardian',filiacao:'Tsuchigumo Clan'},
   atributos:Object.fromEntries(Object.entries({for:4,des:5,agi:5,per:8,vig:6,int:8,esp:7}).map(([key,valor])=>[key,{valor}])),
   pericias:{mecanismo:{pontos:5},prontidao:{pontos:5},procurar:{pontos:4},concentracao:{pontos:4}},
   energias:{vitalidade:{value:63,max:63},chakra:{value:31,max:31}},
   databook:{biografia:'<p>Guardian of the Tsuchigumo Clan fortress on Mount Katsuragi and protector of Hotaru. Statistics and technique effects are tabletop adaptations.</p>'}
  },
  items:[
   {name:'Expert (Readiness)',type:'aptidao',img:'icons/svg/book.svg',system:{aptitudeChoice:'Readiness',descricao:'Gain +2 Accuracy on Readiness tests.'}},
   {name:'Hidden Rock Trap',type:'poder',img:'icons/svg/book.svg',system:{tipo:'Fortress Defense',nivelUsado:3,custoChakra:3,custo:'3 Chakra',descricao:'Standard Action. Choose one prepared rock trap within 10 m. Make a ranged ninjutsu attack against one creature in its trigger area for 5 base damage before the usual damage degree. Each trap triggers once. Resolve manually.'}},
   {name:'Summoning Technique (Bat)',type:'poder',img:'icons/svg/book.svg',system:{tipo:'Kuchiyose',nivelUsado:1,custoChakra:2,custo:'2 Chakra',descricao:'Standard Action, once per scene. Summon one bat for scouting nearby or carrying a short message. The bat has no combat attack in this profile and departs at scene end. Resolve manually.'}}
  ]
 };
}
