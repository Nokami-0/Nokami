function gelel(name, level, cost, descricao) {
 return {name,type:'poder',img:'icons/svg/book.svg',system:{
  tipo:'Gelel Technique',nivelUsado:level,custoChakra:cost,custo:`${cost} Chakra`,descricao
 }};
}

export function ranke(systemId) {
 return {
  name:'Ranke',type:'personagem',prototypeToken:{name:'Ranke',actorLink:false,disposition:-1},
  flags:{[systemId]:{bestiaryBoss:'ranke'}},
  system:{
   cabecalho:{nome:'Ranke',nc:11,patente:'Knight',filiacao:'Haido’s Knights'},
   atributos:Object.fromEntries(Object.entries({for:8,des:8,agi:8,per:6,vig:8,int:6,esp:10}).map(([key,valor])=>[key,{valor}])),
   pericias:{atletismo:{pontos:5},acrobacia:{pontos:4},prontidao:{pontos:4},concentracao:{pontos:5}},
   energias:{vitalidade:{value:89,max:89},chakra:{value:40,max:40}},
   databook:{biografia:'<p>Haido’s knight from Legend of the Stone of Gelel. Her Stone powers her lightning and gorilla-like beast form. Chakra costs and combat effects are tabletop adaptations. Spend Chakra through the sheet and resolve each effect manually.</p>'}
  },
  items:[
   {name:'Stone of Gelel',type:'equipamento',img:'icons/svg/item-bag.svg',system:{quantidade:1,descricao:'The source of Ranke’s Gelel techniques. The listed costs use her Chakra pool as the tabletop resource.'}},
   {name:'Knight Armor',type:'equipamento',img:'icons/svg/shield.svg',system:{quantidade:1,equipped:true,isArmor:true,absorption:8,absorptionRemaining:8,descricao:'Ranke’s armor and cape. The 8-point Absorption pool represents this tabletop profile.'}},
   {name:'Powerful Attack',type:'aptidao',img:'icons/svg/book.svg',system:{preRequisito:'Melee Combat 7',descricao:'Declare before a melee attack. Apply −1 Accuracy and +1 base damage to that attack. Resolve manually.'}},
   gelel('Gelel Beast Mode',4,4,'Partial Action, once per scene. Assume your gorilla-like form through the end of your second turn after activation. Gain +2 base damage to ordinary unarmed strikes and +1 Hardness. Your listed Gelel attacks keep their own base damage. Track the duration manually.'),
   gelel('Plasma Ball',4,4,'Standard Action. Make a ranged ninjutsu attack against one target within 12 m for 7 base damage before the normal damage degree.'),
   gelel('Thunder Sabre',4,4,'Standard Action. Make one melee attack with a blade of Gelel lightning at normal melee reach for 8 base damage before the normal damage degree.'),
   gelel('Tornado Lightning',5,5,'Standard Action. Make one ranged ninjutsu attack against a target within 10 m for 8 base damage before the normal damage degree. When attacking an unattended object, reduce its Hardness by 2 for this attack, to a minimum of 0.')
  ]
 };
}
