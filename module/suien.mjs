function suiton(name, level, descricao) {
 return {name,type:'poder',img:'icons/svg/book.svg',system:{tipo:'Suiton',elemento:'suiton',nivelUsado:level,custoChakra:level,custo:`${level} Chakra`,descricao}};
}

export function suien(systemId) {
 return {
  name:'Suien',type:'personagem',prototypeToken:{name:'Suien',actorLink:false,disposition:-1},
  flags:{[systemId]:{bestiaryBoss:'suien'}},
  system:{
   cabecalho:{nome:'Suien',nc:11,patente:'Rogue Jōnin',filiacao:'Takigakure'},
   atributos:Object.fromEntries(Object.entries({for:8,des:8,agi:8,per:7,vig:8,int:7,esp:11}).map(([key,valor])=>[key,{valor}])),
   pericias:{atletismo:{pontos:4},concentracao:{pontos:5},prontidao:{pontos:4},furtividade:{pontos:4}},
   energias:{vitalidade:{value:89,max:89},chakra:{value:43,max:43}},
   databook:{biografia:'<p>A rogue Hidden Waterfall shinobi who seized the Hero’s Water. The numbers, dose and techniques are tabletop adaptations. Resolve their effects manually.</p>'}
  },
  items:[
   {name:'Hero’s Water',type:'equipamento',img:'icons/svg/potion.svg',system:{quantidade:1,consumable:true,descricao:'Partial Action. Expend the dose to gain 10 temporary Chakra through the end of your second turn after activation. Spend temporary Chakra first. When the effect ends, discard any unspent temporary Chakra and lose 10 Vitality directly. Track the temporary pool and backlash manually.'}},
   {name:'Expert (Concentration)',type:'aptidao',img:'icons/svg/book.svg',system:{aptitudeChoice:'Concentration',descricao:'Gain +2 Accuracy on Concentration tests.'}},
   suiton('Takigakure Style: Watercutting Sword',4,'Standard Action. Form a blade from nearby water and make a melee attack at normal reach for 8 base damage before applying the damage degree. The water blade dissipates after the attack.'),
   suiton('Water Release: Water Formation Wall',4,'Reaction against an incoming attack. Raise a water wall and make a normal Block test. On success, use 8 Hardness for this defense.')
  ]
 };
}
