export function kotohime(systemId) {
 return {
  name:'Princess Koto (Kotohime)',img:'icons/svg/mystery-man.svg',type:'personagem',
  prototypeToken:{name:'Princess Koto',actorLink:false,disposition:-1},
  flags:{[systemId]:{bestiaryBoss:'kotohime'}},
  system:{
   cabecalho:{nome:'Princess Koto (Kotohime)',nc:7,patente:'Hideout Operative',filiacao:'Otogakure · Fūma Clan'},
   atributos:Object.fromEntries(Object.entries({for:4,des:6,agi:6,per:6,vig:5,int:7,esp:8}).map(([key,valor])=>[key,{valor}])),
   pericias:{arte:{pontos:5},concentracao:{pontos:4},mecanismo:{pontos:4}},
   energias:{vitalidade:{value:60,max:60},chakra:{value:34,max:34}},
   databook:{biografia:'<p>A Fūma Clan operative who plays the koto and lures intruders deeper into Orochimaru’s hideout. The numbers and restraint rules are tabletop adaptations.</p>'}
  },
  items:[
   {name:'Koto',type:'equipamento',img:'icons/svg/item-bag.svg',system:{quantidade:1,descricao:'Kotohime’s stringed instrument.'}},
   {name:'Expert (Art)',type:'aptidao',img:'icons/svg/book.svg',system:{aptitudeChoice:'Art',descricao:'Gain +2 Accuracy on Art tests.'}},
   {name:'Hair Restraint',type:'poder',img:'icons/svg/book.svg',system:{tipo:'Ninjutsu',nivelUsado:3,custoChakra:3,custo:'3 Chakra',descricao:'Standard Action. Make a ranged ninjutsu attack against one creature within 4 m. On a hit, it cannot move from its space until the end of its next turn. It can attack and defend or spend a Standard Action to break free with Strength or Escape (Difficulty 16). No damage. Resolve manually.'}}
  ]
 };
}
