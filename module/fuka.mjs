function technique(name, level, cost, descricao) {
 return {name,type:'poder',img:'icons/svg/book.svg',system:{tipo:'Ninjutsu',nivelUsado:level,custoChakra:cost,custo:`${cost} Chakra`,descricao}};
}

export function fuka(systemId) {
 return {
  name:'Fūka',type:'personagem',prototypeToken:{name:'Fūka',actorLink:false,disposition:-1},
  flags:{[systemId]:{bestiaryBoss:'fuka'}},
  system:{
   cabecalho:{nome:'Fūka',nc:11,patente:'Rogue Shinobi',filiacao:'Furido’s Team'},
   atributos:Object.fromEntries(Object.entries({for:5,des:8,agi:8,per:7,vig:7,int:9,esp:11}).map(([key,valor])=>[key,{valor}])),
   pericias:{furtividade:{pontos:5},concentracao:{pontos:5},disfarce:{pontos:5},prontidao:{pontos:4}},
   energias:{vitalidade:{value:86,max:86},chakra:{value:43,max:43}},
   databook:{biografia:'<p>Fūka absorbs chakra and changes bodies using a scroll. Her hair houses her soul. The listed costs, damage and limited replacement body are tabletop adaptations. Resolve manually.</p>'}
  },
  items:[
   {name:'Body Transfer Scroll',type:'equipamento',img:'icons/svg/book.svg',system:{quantidade:1,descricao:'Holds one replacement body for Colour Course Change in this encounter.'}},
   {name:'Expert (Disguise)',type:'aptidao',img:'icons/svg/book.svg',system:{aptitudeChoice:'Disguise',descricao:'Gain +2 Accuracy on Disguise tests.'}},
   technique('Execution by Kiss',4,4,'Standard Action. Choose a willing or restrained adjacent target. On a failed Spirit resistance test (Difficulty 18), it loses up to 8 current Chakra. Fūka regains the amount actually lost, up to her maximum. Once per target per scene.'),
   technique('Colour Course Change',4,4,'Standard Action, once per scene. Requires the Body Transfer Scroll and intact soul-bearing hair. Expend the replacement body and regain up to 12 Vitality, without exceeding maximum. Existing damage to her hair persists.'),
   technique('Fire Release: Phoenix Sage Fire Technique',4,4,'Standard Action. Make a ranged ninjutsu attack against one target within 12 m for 7 base fire damage. Use the normal damage degree.'),
   technique('Water Release: Water Formation Wall',4,4,'Reaction against an attack. Raise a wall of water between yourself and the attack. Resolve a normal defense; on a successful Block, use 8 Hardness for that defense.')
  ]
 };
}
