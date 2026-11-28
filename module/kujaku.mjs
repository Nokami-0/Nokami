function shortsword(side) {
 return {
  name:`Fujaku Hishō Shōken (${side})`,type:'equipamento',img:'icons/svg/sword.svg',
  system:{quantidade:1,equipped:true,weaponCategory:'martial',weaponDamage:2,weaponSize:'medium',attackType:'melee',damageType:'slashing',
   descricao:'One blade of the Weaknessless Soaring Shortswords. Uses the +2 damage profile of the existing Seimei weapon. Both blades must be wielded for Rotating Ferocious Wind.'}
 };
}

export function kujaku(systemId) {
 return {
  name:'Kujaku',type:'personagem',prototypeToken:{name:'Kujaku',actorLink:false,disposition:-1},
  flags:{[systemId]:{bestiaryBoss:'kujaku'}},
  system:{
   cabecalho:{nome:'Kujaku',nc:10,patente:'Four Celestial Symbols',filiacao:'Takumi Village'},
   atributos:Object.fromEntries(Object.entries({for:5,des:10,agi:8,per:7,vig:6,int:7,esp:10}).map(([key,valor])=>[key,{valor}])),
   pericias:{acrobacia:{pontos:4},concentracao:{pontos:5},prontidao:{pontos:4},mecanismo:{pontos:4}},
   energias:{vitalidade:{value:73,max:73},chakra:{value:40,max:40}},
   databook:{biografia:'<p>A Wind Release specialist from Takumi Village who channels wind through a matched pair of swords. Her stats and the listed technique effects are tabletop adaptations.</p>'}
  },
  items:[
   shortsword('Left'), shortsword('Right'),
   {name:'Ambidexterity',type:'aptidao',img:'icons/svg/book.svg',system:{descricao:'Allows Kujaku to wield the paired shortswords together. Use the normal rules for fighting with two weapons.'}},
   {name:'Rotating Ferocious Wind',type:'poder',img:'icons/svg/book.svg',system:{tipo:'Fuuton',elemento:'fuuton',nivelUsado:4,custoChakra:4,custo:'4 Chakra',descricao:'Standard Action. Requires both Fujaku Hishō Shōken blades wielded. Project a 6 m cone. Resolve a ranged ninjutsu attack for 8 base slashing damage, using normal defenses and damage degrees for each target. Resolve manually.'}}
  ]
 };
}
