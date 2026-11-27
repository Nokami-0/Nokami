export function suiko(systemId) {
 return {
  name:'Suiko',type:'personagem',prototypeToken:{name:'Suiko',actorLink:false,disposition:-1},
  flags:{[systemId]:{bestiaryBoss:'suiko'}},
  system:{
   cabecalho:{nome:'Suiko',nc:9,patente:'Four Celestial Symbols',filiacao:'Takumi Village'},
   atributos:Object.fromEntries(Object.entries({for:8,des:5,agi:5,per:6,vig:8,int:7,esp:8}).map(([key,valor])=>[key,{valor}])),
   pericias:{atletismo:{pontos:4},mecanismo:{pontos:5},concentracao:{pontos:4},prontidao:{pontos:4}},
   energias:{vitalidade:{value:79,max:79},chakra:{value:34,max:34}},
   databook:{biografia:'<p>A member of the Four Celestial Symbols from Takumi Village. His tiger-faced Infinite Armour drains chakra through contact. This NPC version adapts the system’s Seimei armor for Suiko’s encounter.</p>'}
  },
  items:[
   {name:'Infinite Armour (Mugen Kōgai)',type:'equipamento',img:'icons/svg/shield.svg',system:{quantidade:1,equipped:true,isArmor:true,absorption:12,absorptionRemaining:12,bodyHardnessBonus:1,descricao:'Suiko’s encounter version. Provides a 12-point armor Absorption pool and +1 body Hardness while equipped. See Chakra Assimilation for its contact effect.'}},
   {name:'Unarmed Strike',type:'equipamento',img:'icons/svg/fist.svg',system:{quantidade:1,equipped:true,weaponCategory:'natural',weaponDamage:0,weaponSize:'light',attackType:'melee',damageType:'bludgeoning'}},
   {name:'Chakra Assimilation',type:'poder',img:'icons/svg/book.svg',system:{tipo:'Equipment Ability',nivelUsado:1,custoChakra:0,custo:'0 Chakra',descricao:'Once per round, when a hostile chakra-powered melee attack contacts the equipped Infinite Armour, its attacker loses up to 2 current Chakra. Suiko regains the amount lost, up to his maximum. No effect against ranged attacks, ordinary weapons, or ordinary unarmed strikes. This does not cancel the attack. Resolve manually.'}}
  ]
 };
}
