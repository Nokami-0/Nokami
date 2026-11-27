function gelel(name, level, descricao) {
 return {name,type:'poder',img:'icons/svg/book.svg',system:{
  tipo:'Gelel Technique',nivelUsado:level,custoChakra:level,custo:`${level} Chakra`,descricao
 }};
}

export function kamira(systemId) {
 return {
  name:'Kamira',type:'personagem',prototypeToken:{name:'Kamira',actorLink:false,disposition:-1},
  flags:{[systemId]:{bestiaryBoss:'kamira'}},
  system:{
   cabecalho:{nome:'Kamira',nc:11,patente:'Knight',filiacao:'Haido’s Knights'},
   atributos:Object.fromEntries(Object.entries({for:6,des:7,agi:8,per:8,vig:7,int:9,esp:10}).map(([key,valor])=>[key,{valor}])),
   pericias:{furtividade:{pontos:5},concentracao:{pontos:5},prontidao:{pontos:4},acrobacia:{pontos:4}},
   energias:{vitalidade:{value:86,max:86},chakra:{value:40,max:40}},
   databook:{biografia:'<p>Haido’s knight from Legend of the Stone of Gelel. Her Stone grants a bat-like form, illusions and smokescreens. The stats, Chakra costs and effects are tabletop adaptations. Resolve effects manually.</p>'}
  },
  items:[
   {name:'Stone of Gelel',type:'equipamento',img:'icons/svg/item-bag.svg',system:{quantidade:1,descricao:'Powers Kamira’s Gelel techniques. Spend their listed cost from her Chakra pool.'}},
   {name:'Knight Armor',type:'equipamento',img:'icons/svg/shield.svg',system:{quantidade:1,equipped:true,isArmor:true,absorption:8,absorptionRemaining:8}},
   {name:'Expert (Stealth)',type:'aptidao',img:'icons/svg/book.svg',system:{aptitudeChoice:'Stealth',descricao:'Gain +2 Accuracy on Stealth tests. Applied automatically by the actor sheet.'}},
   gelel('Gelel Beast Mode',4,'Partial Action, once per scene. Assume bat form through the end of your second turn after activation. You can fly up to your normal movement per Move Action while transformed. If airborne when the form ends, resolve falling normally.'),
   gelel('Kamira’s Illusion',4,'Standard Action. Requires Beast Mode. Choose one creature within 10 m that can perceive Kamira. On a failed genjutsu resistance test (Difficulty 18), false images impose −2 Accuracy on its attacks against Kamira until the end of its next turn. Kai can end the effect early.'),
   gelel('Smokescreen',3,'Standard Action. Requires Beast Mode. Place a 4 m radius cloud centered on Kamira until the end of her next turn. Use the normal obscured vision rules for everyone in the area. It deals no damage.')
  ]
 };
}
